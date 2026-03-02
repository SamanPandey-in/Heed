// ============================================================================
// CONTROLLERS - Authentication Controller
// ============================================================================

import * as authService from '../services/auth.service.js';
import { successResponse, createdResponse, badRequestResponse } from '../utils/apiResponse.js';
import { validate } from '../utils/validation.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.js';

/**
 * Register new user
 */
export const register = async (req, res) => {
  const user = await authService.registerUser(req.validated);

  // Auto-login: generate tokens
  const accessToken = authService.generateAccessToken(user.id);
  const refreshToken = authService.generateRefreshToken(user.id);
  await authService.saveRefreshToken(user.id, refreshToken);

  return createdResponse(res, 'User registered successfully', { user, accessToken, refreshToken });
};

/**
 * Login user
 */
export const login = async (req, res) => {
  const result = await authService.loginUser(req.validated);
  return successResponse(res, 'Login successful', result);
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  const result = await authService.refreshAccessToken(req.validated.refreshToken);
  return successResponse(res, 'Token refreshed', result);
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  await authService.logoutUser(req.user.id);
  return successResponse(res, 'Logged out successfully');
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);
  return successResponse(res, 'Profile retrieved', user);
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  const user = await authService.updateUserProfile(req.user.id, req.body);
  return successResponse(res, 'Profile updated', user);
};

/**
 * Request password reset
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return badRequestResponse(res, 'Email is required');
  }

  await authService.requestPasswordReset(email);
  return successResponse(res, 'If the email exists, a reset link has been sent');
};

/**
 * Reset password with token
 */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return badRequestResponse(res, 'Token and new password are required');
  }

  await authService.resetPassword(token, password);
  return successResponse(res, 'Password reset successful. Please login with your new password.');
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
