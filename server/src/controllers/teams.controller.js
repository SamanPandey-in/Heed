import { prisma } from "../prisma/client.js";
import { randomBytes } from 'crypto';
import { createNotification } from "../utils/notify.js";
import { emitTeamChatMessageCreated, emitTeamNoteMessageCreated } from "../lib/socket.js";

const ensureTeamMembership = async (teamId, userId) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!team) {
    return { ok: false, status: 404, message: "Team not found" };
  }

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    select: { userId: true },
  });

  if (!membership) {
    return { ok: false, status: 403, message: "Access denied" };
  }

  return { ok: true };
};

export const getTeams = async (req, res, next) => {
  try {
    const userId = req.userId; // Set by auth middleware
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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

export const updateTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;
    const { name, description } = req.body;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isOwner = team.ownerId === userId;
    const isMember = team.members.some((member) => member.userId === userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Only team members can update team" });
    }

    const hasNameUpdate = typeof name === "string";
    const hasDescriptionUpdate = typeof description === "string";

    if (!hasNameUpdate && !hasDescriptionUpdate) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    if (hasNameUpdate && !name.trim()) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const updateData = {
      ...(hasNameUpdate ? { name: name.trim() } : {}),
      ...(hasDescriptionUpdate ? { description: description.trim() } : {}),
    };

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
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

    if (targetUser.id !== userId) {
      createNotification({
        userId: targetUser.id,
        type: "TEAM_MEMBER_ADDED",
        title: "You were added to a team",
        message: `You have been added to the team "${team.name}".`,
        entityType: "team",
        entityId: teamId,
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

    const isTeamOwner = team.ownerId === userId;
    const isSelfRemoval = userId === targetUserId;

    if (!isTeamOwner && !isSelfRemoval) {
      return res.status(403).json({ message: "Only team owner can remove other members" });
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

    res.json({ message: isSelfRemoval ? "Left team successfully" : "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

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

    createNotification({
      userId,
      type: "TEAM_MEMBER_ADDED",
      title: "You joined a team",
      message: `You successfully joined the team "${team.name}".`,
      entityType: "team",
      entityId: team.id,
    });

    const newMember = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatarUrl: true,
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
        members: [...team.members.map((m) => m.user), newMember],
      },
    });
  } catch (err) {
    next(err);
  }
};

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

export const getTeamNotesMessages = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const access = await ensureTeamMembership(teamId, userId);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const messages = await prisma.teamNoteMessage.findMany({
      where: { teamId },
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
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

export const createTeamNotesMessage = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const access = await ensureTeamMembership(teamId, userId);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const message = await prisma.teamNoteMessage.create({
      data: {
        teamId,
        userId,
        content: content.trim(),
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

    emitTeamNoteMessageCreated({
      teamId,
      noteMessage: message,
    });

    res.status(201).json({
      message: "Note saved successfully",
      noteMessage: message,
    });
  } catch (err) {
    next(err);
  }
};

export const getTeamChatMessages = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const access = await ensureTeamMembership(teamId, userId);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const messages = await prisma.teamChatMessage.findMany({
      where: { teamId },
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
      orderBy: { createdAt: "asc" },
    });

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

export const createTeamChatMessage = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const access = await ensureTeamMembership(teamId, userId);
    if (!access.ok) {
      return res.status(access.status).json({ message: access.message });
    }

    const message = await prisma.teamChatMessage.create({
      data: {
        teamId,
        userId,
        content: content.trim(),
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

    emitTeamChatMessageCreated({
      teamId,
      chatMessage: message,
    });

    res.status(201).json({
      message: "Message sent successfully",
      chatMessage: message,
    });
  } catch (err) {
    next(err);
  }
};
