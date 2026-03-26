// Verifies the JWT session token on every protected route.

import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";

const SESSION_COOKIE = "sessionToken";

const resolveJwtSecret = () =>
  process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  let secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : isProd;

  const sameSite = process.env.COOKIE_SAME_SITE || (secure ? "none" : "lax");

  // Normalize invalid combinations: SameSite=None requires Secure=true in modern browsers
  if (typeof sameSite === "string" && sameSite.toLowerCase() === "none" && !secure) {
    secure = true;
  }

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };
};

const clearSessionCookie = (res) => {
  const cookieOptions = getCookieOptions();
  res.clearCookie(SESSION_COOKIE, cookieOptions);
};

export const authenticate = async (req, res, next) => {
  const cookieToken = req.cookies?.[SESSION_COOKIE];
  const authHeader = req.headers["authorization"];
  const tokenSource = cookieToken
    ? "cookie"
    : authHeader?.startsWith("Bearer ")
      ? "header"
      : null;

  // Support token from cookie or Authorization header only
  const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (!token) return res.status(401).json({ message: "Authentication required" });

  const jwtSecret = resolveJwtSecret();
  if (!jwtSecret) {
    return res.status(500).json({ message: "JWT secret is not configured" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });

    if (!user) {
      if (cookieToken) {
        clearSessionCookie(res);
      }
      return res.status(401).json({ message: "User not found" });
    }

    req.userId = user.id;
    req.user = { id: user.id };
    req.auth = { tokenSource };
    next();
  } catch (err) {
    if (cookieToken) {
      clearSessionCookie(res);
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired" });
    }

    return res.status(401).json({ message: "Invalid session" });
  }
};
