// Teams Controller - handles team-related operations

import { prisma } from "../prisma/client.js";
import { randomBytes } from 'crypto';

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
        inviteCode: randomBytes(4).toString('hex').toUpperCase(),
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

// UPDATE team
export const updateTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    const { name, description } = req.body;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.ownerId !== userId) {
      return res.status(403).json({ message: "Only team owner can update team" });
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: name?.trim() || team.name,
        description: description?.trim() || team.description,
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
      },
    });

    res.json({
      message: "Team updated successfully",
      team: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        ownerId: updated.ownerId,
        inviteCode: updated.inviteCode,
        memberIds: updated.members.map((m) => m.userId),
        members: updated.members.map((m) => m.user),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ADD team member
export const addTeamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { userId: targetUserId, email } = req.body;
    const userId = req.userId;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.ownerId !== userId) {
      return res.status(403).json({ message: "Only team owner can add members" });
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

    const existing = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUser.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "User is already a member" });
    }

    await prisma.teamMember.create({
      data: {
        teamId,
        userId: targetUser.id,
      },
    });

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

// REMOVE team member
export const removeTeamMember = async (req, res, next) => {
  try {
    const { teamId, userId: targetUserId } = req.params;
    const userId = req.userId;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.ownerId !== userId) {
      return res.status(403).json({ message: "Only team owner can remove members" });
    }

    if (team.ownerId === targetUserId) {
      return res.status(400).json({ message: "Cannot remove team owner" });
    }

    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
    });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: targetUserId,
        },
      },
    });

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

// JOIN team by invite code
export const joinByInviteCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.userId;

    if (!inviteCode?.trim()) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    const team = await prisma.team.findFirst({
      where: { inviteCode: inviteCode.trim() },
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

    if (!team) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    const existing = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "You are already a member of this team" });
    }

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
      },
    });

    res.json({
      message: "Joined team successfully",
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        ownerId: team.ownerId,
        owner: team.owner,
        inviteCode: team.inviteCode,
        members: [...team.members.map((m) => m.user), { id: userId }],
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
