// Teams Controller - handles team-related operations

import { prisma } from "../prisma/client.js";

// GET all teams for authenticated user
export const getTeams = async (req, res, next) => {
  try {
    const userId = req.userId; // Set by auth middleware
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get all teams where user is a member
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        avatarUrl: team.avatarUrl,
        ownerId: team.ownerId,
        owner: team.owner,
        inviteCode: team.inviteCode,
        memberIds: team.members.map((m) => m.userId),
        members: team.members.map((m) => m.user),
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET single team by ID
export const getTeamById = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        owner: true,
        projects: {
          select: { id: true, name: true },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is member of team
    if (!team.members.some((m) => m.userId === userId) && team.ownerId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        avatarUrl: team.avatarUrl,
        ownerId: team.ownerId,
        owner: team.owner,
        inviteCode: team.inviteCode,
        memberIds: team.members.map((m) => m.userId),
        members: team.members.map((m) => m.user),
        projects: team.projects,
        createdAt: team.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// CREATE team
export const createTeam = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        ownerId: userId,
        inviteCode: `${name.toUpperCase()}-${Date.now()}`,
        members: {
          create: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
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

    res.status(201).json({
      message: "Team created successfully",
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        ownerId: team.ownerId,
        inviteCode: team.inviteCode,
        memberIds: team.members.map((m) => m.userId),
        members: team.members.map((m) => m.user),
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE team (owner only)
export const deleteTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.ownerId !== userId) {
      return res.status(403).json({ message: "Only team owner can delete team" });
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    next(err);
  }
};
