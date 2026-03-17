// Projects Controller - handles project-related operations

import { prisma } from "../prisma/client.js";

// GET all projects for authenticated user's teams
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get projects from teams user is member of
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

// GET single project by ID
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

    // Check if user has access
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

// CREATE project
export const createProject = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, description, teamId, status = "ACTIVE" } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    // Verify user is member of team
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

    res.status(201).json({
      message: "Project created successfully",
      project: {
        id: project.id,
        name: project.name,
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

// DELETE project
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
