// ============================================================================
// SERVICES - Authentication Service
// ============================================================================

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import config from '../config/index.js';
import { logger } from '../config/logger.js';
import { sendPasswordResetEmail } from './email.service.js';

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, tokenId: uuidv4() }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Save refresh token to database
 */
export const saveRefreshToken = async (userId, token) => {
  // Delete existing tokens for this user
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });
    
    if (!storedToken) {
      return null;
    }
    
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Register new user
 */
export const registerUser = async ({ email, password, name }) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      imageUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  logger.info(`New user registered: ${user.email}`);
  
  return user;
};

/**
 * Login user
 */
export const loginUser = async ({ email, password }) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Verify password
  const isValidPassword = await comparePassword(password, user.passwordHash);
  
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }
  
  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  
  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  
  // Save refresh token
  await saveRefreshToken(user.id, refreshToken);
  
  logger.info(`User logged in: ${user.email}`);
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  const decoded = await verifyRefreshToken(refreshToken);
  
  if (!decoded) {
    throw new Error('Invalid or expired refresh token');
  }
  
  // Generate new access token
  const accessToken = generateAccessToken(decoded.userId);
  
  return { accessToken };
};

/**
 * Logout user
 */
export const logoutUser = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
  
  logger.info(`User logged out: ${userId}`);
};

/**
 * Get current user profile
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      imageUrl: true,
      role: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, data) => {
  const { name, imageUrl, currentPassword, newPassword } = data;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // If changing password, verify current password
  if (newPassword) {
    if (!currentPassword) {
      throw new Error('Current password required to change password');
    }
    
    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }
    
    const passwordHash = await hashPassword(newPassword);
    
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(imageUrl !== undefined && { imageUrl }),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        updatedAt: true,
      },
    });
  }
  
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      imageUrl: true,
      role: true,
      updatedAt: true,
    },
  });
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Always return success to prevent email enumeration
  if (!user) {
    logger.warn(`Password reset requested for non-existent email: ${email}`);
    return;
  }
  
  // Delete any existing reset tokens
  await prisma.passwordReset.deleteMany({
    where: { userId: user.id },
  });
  
  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt,
    },
  });
  
  // Send reset email
  await sendPasswordResetEmail(email, resetToken);
  
  logger.info(`Password reset email sent to: ${user.email}`);
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, newPassword) => {
  // Find valid reset token
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token },
  });
  
  if (!resetRecord) {
    throw new Error('Invalid reset token');
  }
  
  if (new Date() > resetRecord.expiresAt) {
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
    throw new Error('Reset token has expired');
  }
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);
  
  // Update user password
  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { passwordHash },
  });
  
  // Delete reset token
  await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
  
  // Delete all refresh tokens (force re-login)
  await prisma.refreshToken.deleteMany({
    where: { userId: resetRecord.userId },
  });
  
  logger.info(`Password reset successful for user: ${resetRecord.userId}`);
};

export default {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
