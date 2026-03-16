//auth logics: login, logout, refresh, /me, forgot/reset password

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../prisma/client.js";

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const REFRESH_COOKIE = "refreshToken";

// Helpers

const signAccess = (userId) =>
  jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

const signRefresh = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });

// Only expose safe fields to the frontend — no password hash, no tokens
const safeUser = (u) => ({
  id: u.id,
  email: u.email,
  username: u.username,
  fullName: u.fullName,
  avatarUrl: u.avatarUrl || null,
  bio: u.bio || null,
  isEmailVerified: u.isEmailVerified,
});

// REGISTER

export const register = async (req, res, next) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const exists = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });
    if (exists) {
      const field = exists.email === email.toLowerCase() ? "Email" : "Username";
      return res.status(409).json({ message: `${field} already in use` });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        lastLoginAt: new Date(),
      },
    });

    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user: safeUser(user), accessToken });
  } catch (err) {
    next(err);
  }
};

// LOGIN

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccess(user.id);
    const refreshToken = signRefresh(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(refreshToken, 10),
        lastLoginAt: new Date(),
      },
    });

    setRefreshCookie(res, refreshToken);
    res.json({ user: safeUser(user), accessToken });
  } catch (err) {
    next(err);
  }
};

// LOGOUT

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      try {
        const { userId } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await prisma.user.update({
          where: { id: userId },
          data: { refreshToken: null },
        });
      } catch {
        /* invalid token — still clear cookie */
      }
    }
    clearRefreshCookie(res);
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

// REFRESH

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ message: "No refresh token" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res
        .status(401)
        .json({ message: "Refresh token expired or invalid" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user?.refreshToken)
      return res.status(401).json({ message: "Session revoked" });

    const valid = await bcrypt.compare(token, user.refreshToken);
    if (!valid)
      return res.status(401).json({ message: "Invalid refresh token" });

    const newAccessToken = signAccess(user.id);
    const newRefreshToken = signRefresh(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(newRefreshToken, 10) },
    });

    setRefreshCookie(res, newRefreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

// GET ME

export const getMe = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Session expired" });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) return res.status(401).json({ message: "User not found" });

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

// FORGOT PASSWORD

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashedToken, resetTokenExp },
      });
      // TODO: send email — link: `${process.env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`
      console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
    }

    // Always 200 to prevent user enumeration
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
};

// RESET PASSWORD

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Token and new password required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await prisma.user.findFirst({
      where: { resetToken: hashedToken, resetTokenExp: { gt: new Date() } },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
        refreshToken: null,
      },
    });

    clearRefreshCookie(res);
    res.json({ message: "Password reset successful. Please log in again." });
  } catch (err) {
    next(err);
  }
};
