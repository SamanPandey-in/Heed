import { prisma } from "../prisma/client.js";
import { createNotification } from "../utils/notify.js";
import { logActivity } from "../services/activityService.js";

export const getTasks = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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
        order: task.order,
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
        timeSpent: task.timeSpent,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

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

export const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true, teamId: true },
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
        subTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            timeSpent: true,
            assignee: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
    });

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

    res.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        order: task.order,
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
        timeSpent: task.timeSpent,
        subTasks: task.subTasks,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { title, description, projectId, assigneeId, priority = "MEDIUM", type = "TASK", dueDate } = req.body;
    const normalizedAssigneeId = typeof assigneeId === "string" ? assigneeId.trim() : assigneeId;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

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

    if (normalizedAssigneeId) {
      const assigneeMembership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: project.teamId,
            userId: normalizedAssigneeId,
          },
        },
      });

      if (!assigneeMembership) {
        return res.status(400).json({ message: "Assignee must be a member of the project's team" });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        projectId,
        assigneeId: normalizedAssigneeId || null,
        createdBy: userId,
        priority,
        type,
        status: "BACKLOG",
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
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

    if (task.assigneeId && task.assigneeId !== userId) {
      createNotification({
        userId: task.assigneeId,
        type: "TASK_ASSIGNED",
        title: "You were assigned a task",
        message: `${task.creator.fullName || task.creator.username} assigned "${task.title}" to you.`,
        entityType: "task",
        entityId: task.id,
      });
    }

    // Calculate and persist project progress
    const allTasks = await prisma.task.count({ where: { projectId: task.projectId } });
    const doneTasks = await prisma.task.count({
      where: { projectId: task.projectId, status: "DONE" }
    });
    const progress = allTasks > 0 ? Math.round((doneTasks / allTasks) * 100) : 0;
    await prisma.project.update({
      where: { id: task.projectId },
      data: { progress },
    });

    // Log activity
    await logActivity({
      entityType: 'task',
      entityId: task.id,
      projectId: task.projectId,
      userId,
      action: 'TASK_CREATED',
      newValue: { title: task.title, status: task.status },
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { taskId } = req.params;
    const { title, description, status, priority, type, assigneeId, dueDate, timeSpent, order } = req.body;
    const normalizedAssigneeId = typeof assigneeId === "string" ? assigneeId.trim() : assigneeId;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            teamId: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userTeam = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: task.project.teamId,
          userId,
        },
      },
    });

    if (!userTeam) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "assigneeId") && normalizedAssigneeId) {
      const assigneeMembership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: task.project.teamId,
            userId: normalizedAssigneeId,
          },
        },
      });

      if (!assigneeMembership) {
        return res.status(400).json({ message: "Assignee must be a member of the project's team" });
      }
    }

    if (typeof title === "string" && !title.trim()) {
      return res.status(400).json({ message: "Task title cannot be empty" });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "timeSpent")) {
      const numericTimeSpent = Number(timeSpent);
      if (!Number.isInteger(numericTimeSpent) || numericTimeSpent < 0) {
        return res.status(400).json({ message: "timeSpent must be a non-negative integer" });
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "order")) {
      const numericOrder = Number(order);
      if (!Number.isInteger(numericOrder) || numericOrder < 0) {
        return res.status(400).json({ message: "order must be a non-negative integer" });
      }
    }

    const updateData = {
      ...(typeof title === "string" && { title: title.trim() }),
      ...(typeof description === "string" && { description: description.trim() }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(type && { type }),
      ...(Object.prototype.hasOwnProperty.call(req.body, "assigneeId") && {
        assigneeId: normalizedAssigneeId || null,
      }),
      ...(Object.prototype.hasOwnProperty.call(req.body, "dueDate") && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(Object.prototype.hasOwnProperty.call(req.body, "timeSpent") && {
        timeSpent: Number(timeSpent),
      }),
      ...(Object.prototype.hasOwnProperty.call(req.body, "order") && {
        order: Number(order),
      }),
    };

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
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

    const assigneeChanged =
      Object.prototype.hasOwnProperty.call(req.body, "assigneeId") &&
      updated.assigneeId &&
      updated.assigneeId !== task.assigneeId;

    if (assigneeChanged && updated.assigneeId !== userId) {
      createNotification({
        userId: updated.assigneeId,
        type: "TASK_ASSIGNED",
        title: "You were assigned a task",
        message: `${userId === task.createdBy ? "The creator" : "A team member"} assigned "${updated.title}" to you.`,
        entityType: "task",
        entityId: updated.id,
      });
    }

    if (status && status !== task.status && task.createdBy !== userId) {
      createNotification({
        userId: task.createdBy,
        type: "TASK_UPDATED",
        title: "Task status updated",
        message: `"${updated.title}" was moved to ${status.replace("_", " ")}.`,
        entityType: "task",
        entityId: updated.id,
      });
    }

    // Calculate and persist project progress
    const allTasks = await prisma.task.count({ where: { projectId: task.projectId } });
    const doneTasks = await prisma.task.count({
      where: { projectId: task.projectId, status: "DONE" }
    });
    const progress = allTasks > 0 ? Math.round((doneTasks / allTasks) * 100) : 0;
    await prisma.project.update({
      where: { id: task.projectId },
      data: { progress },
    });

    // Log activity
    await logActivity({
      entityType: 'task',
      entityId: updated.id,
      projectId: task.projectId,
      userId,
      action: 'TASK_UPDATED',
      oldValue: status ? { status: task.status } : undefined,
      newValue: status ? { status: updated.status } : { ...Object.entries(updateData).reduce((acc, [key, val]) => { acc[key] = val; return acc; }, {}) },
    });

    res.json({
      message: "Task updated successfully",
      task: updated,
    });
  } catch (err) {
    next(err);
  }
};

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

    const projectId = task.projectId;

    await prisma.task.delete({
      where: { id: taskId },
    });

    // Calculate and persist project progress after deletion
    const allTasks = await prisma.task.count({ where: { projectId } });
    const doneTasks = await prisma.task.count({
      where: { projectId, status: "DONE" }
    });
    const progress = allTasks > 0 ? Math.round((doneTasks / allTasks) * 100) : 0;
    await prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });

    // Log activity
    await logActivity({
      entityType: 'task',
      entityId: taskId,
      projectId,
      userId,
      action: 'TASK_DELETED',
      oldValue: { title: task.title, status: task.status },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};
