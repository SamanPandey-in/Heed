import "dotenv/config";
import app from "./app.js";
import { prisma } from "./src/prisma/client.js";

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection established");

    server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n✓ Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("✓ Server closed");
      await prisma.$disconnect();
      console.log("✓ Database connection closed");
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("✗ Forced shutdown");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("✗ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("✗ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
