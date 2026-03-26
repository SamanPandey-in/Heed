import {
  joinPresence,
  leavePresence,
  subscribeToPresence,
  unsubscribeFromPresence,
  broadcastPresenceUpdate,
  getPresenceCount,
} from '../services/presenceService.js';
import { prisma } from '../prisma/client.js';

export const getProjectPresence = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!projectId || !userId) {
      return res.status(400).json({ message: 'Missing projectId or userId' });
    }

    // Verify user has access to project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userTeam = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId,
        },
      },
    });

    if (!userTeam) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Connect user to presence
    joinPresence(projectId, user);
    subscribeToPresence(projectId, res);

    // Broadcast initial count
    broadcastPresenceUpdate(projectId);

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Cleanup on disconnect
    const cleanup = () => {
      clearInterval(heartbeatInterval);
      leavePresence(projectId, userId);
      unsubscribeFromPresence(projectId, res);
      broadcastPresenceUpdate(projectId);
      res.end();
    };

    res.on('close', cleanup);
    res.on('error', cleanup);
  } catch (err) {
    next(err);
  }
};
