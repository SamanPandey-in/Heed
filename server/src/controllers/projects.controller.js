import { prisma } from "../prisma/client.js";
import { createNotification, createNotifications } from "../utils/notify.js";

export const getProjects = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const projects = await prisma.project.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        team: {
          select: { id: true, name: true },
        },
        members: {
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
        },
      },
    });

    res.json({
      projects: projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        result: project.result,
        teamId: project.teamId,
        team: project.team,
        createdBy: project.createdBy,
        notes: project.notes || '',
        links: project.links || [],
        memberIds: project.members.map((m) => m.userId),
        members: project.members.map((m) => m.user),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: true,
      },
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

    res.json({
      project: {
        ...project,
        memberIds: project.members.map((m) => m.userId),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, description, teamId, status = "ACTIVE", key } = req.body;

    const projectKey = (key || name.trim().slice(0,4))
    .toUpperCase()
    .replace(/[^A-Z]/g,'');

    if (!name?.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: userId,
        },
      },
    });

    if (!teamMember) {
      return res.status(403).json({ message: "You must be a team member to create projects" });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        status,
        teamId,
        createdBy: userId,
        key: projectKey,
        members: {
          create: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    const teamWithMembers = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: { select: { userId: true } } },
    });
    const teamMemberIds = (teamWithMembers?.members || []).map((member) => member.userId);

    createNotifications(teamMemberIds, userId, {
      type: "PROJECT_UPDATED",
      title: "New project in your team",
      message: `A new project "${project.name}" was created in your team.`,
      entityType: "project",
      entityId: project.id,
    });

    res.status(201).json({
      message: "Project created successfully",
      project: {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        status: project.status,
        teamId: project.teamId,
        createdBy: project.createdBy,
        memberIds: project.members.map((m) => m.userId),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const { name, description, status, result, notes, links } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: userId,
        },
      },
    });

    if (!teamMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name?.trim() || project.name,
        description: description?.trim() || project.description,
        status: status || project.status,
        result: result ?? project.result,
        notes: notes !== undefined ? notes : project.notes,
        links: links !== undefined ? links : project.links,
      },
      include: {
        members: {
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
        },
      },
    });

    res.json({
      message: "Project updated successfully",
      project: {
        id: updated.id,
        name: updated.name,
        key: updated.key,
        description: updated.description,
        status: updated.status,
        result: updated.result,
        notes: updated.notes || '',
        links: updated.links || [],
        teamId: updated.teamId,
        createdBy: updated.createdBy,
        memberIds: updated.members.map((m) => m.userId),
        members: updated.members.map((m) => m.user),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId: targetUserId, email } = req.body;
    const userId = req.userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: userId,
        },
      },
    });

    if (!teamMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    let targetUser;
    if (targetUserId) {
      targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    } else if (email) {
      targetUser = await prisma.user.findUnique({ where: { email } });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isTeamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId: targetUser.id,
        },
      },
    });

    if (!isTeamMember) {
      return res.status(400).json({ message: "User must be a team member first" });
    }

    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUser.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "User is already a project member" });
    }

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
      },
    });

    if (targetUser.id !== userId) {
      createNotification({
        userId: targetUser.id,
        type: "PROJECT_MEMBER_ADDED",
        title: "You were added to a project",
        message: `You have been added to the project "${project.name}".`,
        entityType: "project",
        entityId: projectId,
      });
    }

    res.status(201).json({
      message: "Member added successfully",
      member: {
        id: targetUser.id,
        username: targetUser.username,
        fullName: targetUser.fullName,
        email: targetUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const { projectId, userId: targetUserId } = req.params;
    const userId = req.userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isProjectCreator = project.createdBy === userId;
    const isSelfRemoval = userId === targetUserId;

    if (!isProjectCreator && !isSelfRemoval) {
      return res.status(403).json({ message: "Only project creator can remove other members" });
    }

    if (project.createdBy === targetUserId) {
      return res.status(400).json({ message: "Cannot remove project creator" });
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
    });

    res.json({ message: isSelfRemoval ? "Left project successfully" : "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy !== userId) {
      return res.status(403).json({ message: "Only project creator can delete project" });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};
