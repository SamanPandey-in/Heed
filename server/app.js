import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/users.route.js";
import teamRoutes from "./src/routes/teams.route.js";
import projectRoutes from "./src/routes/projects.route.js";
import taskRoutes from "./src/routes/tasks.route.js";
import commentRoutes from "./src/routes/comments.route.js";
import notificationRoutes from "./src/routes/notifications.route.js";
import searchRoutes from "./src/routes/search.route.js";
import presenceRoutes from "./src/routes/presence.route.js";

const app = express();

app.use(helmet());

const allowedOrigins = [process.env.CORS_ORIGIN || "http://localhost:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/presence", presenceRoutes);

app.get("/api/health", (_, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() }),
);

app.use((err, _req, res, _next) => {
  console.error("[Error]", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
