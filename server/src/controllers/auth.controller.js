import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../prisma/client.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/emailService.js";

const SALT_ROUNDS = 12;
const SESSION_TOKEN_TTL = "7d";
const SESSION_COOKIE = "sessionToken";

const resolveJwtSecret = () =>
  process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

const signSessionToken = (userId) => {
  const secret = resolveJwtSecret();
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: SESSION_TOKEN_TTL,
  });
};

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  let secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : isProd;

  let sameSite = process.env.COOKIE_SAME_SITE || (secure ? "none" : "lax");

  // Normalize invalid combinations: SameSite=None requires Secure=true in modern browsers
  if (typeof sameSite === "string" && sameSite.toLowerCase() === "none" && !secure) {
    secure = true;
  }

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

const setSessionCookie = (res, token) =>
  res.cookie(SESSION_COOKIE, token, getCookieOptions());

const clearSessionCookie = (res) => {
  const cookieOptions = getCookieOptions();
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });
};

// Only expose safe fields to the frontend — no password hash, no tokens
const safeUser = (u) => ({
  id: u.id,
  email: u.email,
  username: u.username,
  fullName: u.fullName,
  avatarUrl: u.avatarUrl || null,
  bio: u.bio || null,
  isEmailVerified: u.isEmailVerified,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
  lastLoginAt: u.lastLoginAt || null,
  teamIds: Array.isArray(u.teamMemberships)
    ? u.teamMemberships.map((membership) => membership.teamId)
    : [],
});

const getUserWithMemberships = (userId) =>
  prisma.user.findUnique({
    where: { id: userId },
    include: {
      teamMemberships: {
        select: { teamId: true },
      },
    },
  });

const verifySessionToken = (token) => {
  const secret = resolveJwtSecret();
  if (!secret) {
    const error = new Error("JWT secret is not configured");
    error.status = 500;
    throw error;
  }

  return jwt.verify(token, secret);
};

const clearInvalidSession = (res, message) => {
  clearSessionCookie(res);
  return res.status(401).json({ message });
};

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

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        isEmailVerified: false,
        verificationToken: hashedToken,
        verificationTokenExp: tokenExp,
      },
    });

    const clientOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
    const emailResult = await sendVerificationEmail(
      user.email,
      user.fullName,
      rawToken,
      clientOrigin,
    );

    if (!emailResult.success) {
      console.warn("[Auth] Verification email failed for", user.email, "— token stored, user can resend.");
    }

    return res.status(201).json({
      message: "Account created. Please check your email to verify your account.",
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        teamMemberships: {
          select: { teamId: true },
        },
      },
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    const sessionToken = signSessionToken(user.id);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
      include: {
        teamMemberships: {
          select: { teamId: true },
        },
      },
    });

    setSessionCookie(res, sessionToken);
    res.json({ user: safeUser(updatedUser) });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearSessionCookie(res);
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) return clearInvalidSession(res, "Not authenticated");

    let payload;
    try {
      payload = verifySessionToken(token);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return clearInvalidSession(res, "Session expired");
      }

      if (error.status === 500) {
        throw error;
      }

      return clearInvalidSession(res, "Invalid session");
    }

    const user = await getUserWithMemberships(payload.userId);
    if (!user) {
      return clearInvalidSession(res, "User not found");
    }

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teamMemberships: {
          select: { teamId: true },
        },
      },
    });
    if (!user) return res.status(401).json({ message: "User not found" });

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

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

      const clientOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
      const emailResult = await sendPasswordResetEmail(email, resetToken, clientOrigin);
      
      if (!emailResult.success) {
        console.warn('[Auth] Failed to send reset email, but token was generated. User can receive email if service recovers.');
      }
    }

    // Always 200 to prevent user enumeration
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
};

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
      },
    });

    clearSessionCookie(res);
    res.json({ message: "Password reset successful. Please log in again." });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const matchesCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matchesCurrent) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "New password must be different from current password" });
    }

    const nextPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: nextPasswordHash,
      },
    });

    clearSessionCookie(res);
    return res.json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (err) {
    return next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Verification token is required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        verificationTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired. Please request a new one.",
        code: "INVALID_TOKEN",
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        message: "Email already verified. You can log in.",
        code: "ALREADY_VERIFIED",
        email: user.email,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    return res.json({
      message: "Email verified successfully. You can now log in.",
      code: "VERIFIED",
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.isEmailVerified) {
      return res.json({ message: "If that email exists and is unverified, a new link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const tokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: hashedToken, verificationTokenExp: tokenExp },
    });

    const clientOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
    await sendVerificationEmail(user.email, user.fullName, rawToken, clientOrigin);

    return res.json({ message: "If that email exists and is unverified, a new link has been sent." });
  } catch (err) {
    next(err);
  }
};
