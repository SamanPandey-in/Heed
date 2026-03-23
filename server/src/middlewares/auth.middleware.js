// Verifies the JWT access token on every protected route.

import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Support token from Authorization header OR query parameter (for SSE/EventSource)
  let token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  
  if (!token && req.query?.token) {
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ message: "Access token required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = payload.userId; // available in all downstream route handlers
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Access token expired" });
    return res.status(401).json({ message: "Invalid access token" });
  }
};
