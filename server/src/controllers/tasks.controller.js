// Tasks Controller - handles task-related operations

import { prisma } from "../prisma/client.js";

// GET all tasks for authenticated user's projects
export const getTasks = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get tasks from projects in user's teams
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          team: {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        },
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignee: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    res.json({
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        projectId: task.projectId,
        project: task.project,
        assigneeId: task.assigneeId,
        assignee: task.assignee,
        createdBy: task.createdBy,
        creator: task.creator,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET tasks for a specific project
export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userTeam = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: userId,
        },
      },
    });

    if (!userTeam) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// CREATE task
export const createTask = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { title, description, projectId, assigneeId, priority = "MEDIUM", type = "TASK", dueDate } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userTeam = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: userId,
        },
      },
    });

    if (!userTeam) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        projectId,
        assigneeId,
        createdBy: userId,
        priority,
        type,
        status: "BACKLOG",
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
      include: {
        assignee: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE task
export const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId && { assigneeId }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
      include: {
        assignee: true,
        creator: true,
      },
    });

    res.json({
      message: "Task updated successfully",
      task: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE task
export const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.createdBy !== userId) {
      return res.status(403).json({ message: "Only task creator can delete task" });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};
