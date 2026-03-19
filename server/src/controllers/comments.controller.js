import { prisma } from "../prisma/client.js";

export const getComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userTeam = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: task.project.teamId,
          userId: userId,
        },
      },
    });

    if (!userTeam) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userTeam = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: task.project.teamId,
          userId: userId,
        },
      },
    });

    if (!userTeam) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: "Only comment author can delete comment" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
