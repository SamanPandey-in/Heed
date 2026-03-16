// Express application setup

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./src/routes/auth.route.js";
// import userRoutes from "./src/routes/user.route.js";
// import teamRoutes from "./src/routes/team.route.js";
// import projectRoutes from "./src/routes/project.route.js";
// import taskRoutes from "./src/routes/task.route.js";

const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origin and cookies
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
).split(",");
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    credentials: true, // required for HttpOnly cookie
  }),
);

// Body parsing and cookie parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Auth route gets stricter limiter to prevent brute-force attacks on login/register endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts, please try again later." },
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/teams", teamRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/tasks", taskRoutes);

app.get("/api/health", (_, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() }),
);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("[Error]", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
