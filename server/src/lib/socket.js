import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { prisma } from "../prisma/client.js";

let ioInstance;

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const authHeader = socket.handshake.headers?.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};

const canAccessTask = async (userId, taskId) => {
  if (!taskId) return false;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      project: {
        select: {
          teamId: true,
        },
      },
    },
  });

  if (!task?.project?.teamId) return false;

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: task.project.teamId,
        userId,
      },
    },
    select: { userId: true },
  });

  return Boolean(membership);
};

const canAccessProject = async (userId, projectId) => {
  if (!projectId) return false;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { teamId: true },
  });

  if (!project?.teamId) return false;

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: project.teamId,
        userId,
      },
    },
    select: { userId: true },
  });

  return Boolean(membership);
};

const canAccessTeam = async (userId, teamId) => {
  if (!teamId) return false;

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    select: { userId: true },
  });

  return Boolean(membership);
};

const replyAck = (ack, payload) => {
  if (typeof ack === "function") {
    ack(payload);
  }
};

export const initializeSocket = (server) => {
  if (ioInstance) return ioInstance;

  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = payload.userId;
      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  ioInstance.on("connection", (socket) => {
    socket.on("task:join", async ({ taskId }, ack) => {
      try {
        const hasAccess = await canAccessTask(socket.userId, taskId);
        if (!hasAccess) {
          return replyAck(ack, { ok: false, message: "Access denied" });
        }

        socket.join(`task:${taskId}`);
        return replyAck(ack, { ok: true });
      } catch {
        return replyAck(ack, { ok: false, message: "Unable to join task room" });
      }
    });

    socket.on("task:leave", ({ taskId }) => {
      if (!taskId) return;
      socket.leave(`task:${taskId}`);
    });

    socket.on("projectNotes:join", async ({ projectId }, ack) => {
      try {
        const hasAccess = await canAccessProject(socket.userId, projectId);
        if (!hasAccess) {
          return replyAck(ack, { ok: false, message: "Access denied" });
        }

        socket.join(`projectNotes:${projectId}`);
        return replyAck(ack, { ok: true });
      } catch {
        return replyAck(ack, { ok: false, message: "Unable to join project notes room" });
      }
    });

    socket.on("projectNotes:leave", ({ projectId }) => {
      if (!projectId) return;
      socket.leave(`projectNotes:${projectId}`);
    });

    socket.on("teamNotes:join", async ({ teamId }, ack) => {
      try {
        const hasAccess = await canAccessTeam(socket.userId, teamId);
        if (!hasAccess) {
          return replyAck(ack, { ok: false, message: "Access denied" });
        }

        socket.join(`teamNotes:${teamId}`);
        return replyAck(ack, { ok: true });
      } catch {
        return replyAck(ack, { ok: false, message: "Unable to join team notes room" });
      }
    });

    socket.on("teamNotes:leave", ({ teamId }) => {
      if (!teamId) return;
      socket.leave(`teamNotes:${teamId}`);
    });

    socket.on("teamChat:join", async ({ teamId }, ack) => {
      try {
        const hasAccess = await canAccessTeam(socket.userId, teamId);
        if (!hasAccess) {
          return replyAck(ack, { ok: false, message: "Access denied" });
        }

        socket.join(`teamChat:${teamId}`);
        return replyAck(ack, { ok: true });
      } catch {
        return replyAck(ack, { ok: false, message: "Unable to join team chat room" });
      }
    });

    socket.on("teamChat:leave", ({ teamId }) => {
      if (!teamId) return;
      socket.leave(`teamChat:${teamId}`);
    });
  });

  return ioInstance;
};

const safeEmit = (emitFn) => {
  if (!ioInstance) return;
  emitFn(ioInstance);
};

export const emitTaskCommentCreated = ({ taskId, comment }) => {
  if (!taskId || !comment) return;
  safeEmit((io) => {
    io.to(`task:${taskId}`).emit("task:comment:created", { taskId, comment });
  });
};

export const emitTaskCommentDeleted = ({ taskId, commentId }) => {
  if (!taskId || !commentId) return;
  safeEmit((io) => {
    io.to(`task:${taskId}`).emit("task:comment:deleted", { taskId, commentId });
  });
};

export const emitProjectNoteMessageCreated = ({ projectId, noteMessage }) => {
  if (!projectId || !noteMessage) return;
  safeEmit((io) => {
    io
      .to(`projectNotes:${projectId}`)
      .emit("projectNotes:message:created", { projectId, noteMessage });
  });
};

export const emitTeamNoteMessageCreated = ({ teamId, noteMessage }) => {
  if (!teamId || !noteMessage) return;
  safeEmit((io) => {
    io
      .to(`teamNotes:${teamId}`)
      .emit("teamNotes:message:created", { teamId, noteMessage });
  });
};

export const emitTeamChatMessageCreated = ({ teamId, chatMessage }) => {
  if (!teamId || !chatMessage) return;
  safeEmit((io) => {
    io
      .to(`teamChat:${teamId}`)
      .emit("teamChat:message:created", { teamId, chatMessage });
  });
};
