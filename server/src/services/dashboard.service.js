// ============================================================================
// SERVICES - Dashboard Service
// ============================================================================

import { prisma } from '../config/database.js';

export const getDashboardStats = async (userId) => {
  // First get workspaceIds (needed for subsequent queries)
  const workspaceMemberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  });
  const workspaceIds = workspaceMemberships.map(m => m.workspaceId);

  // Run all independent queries in parallel
  const [taskStats, overdueTasks, myTasks, projectProgress, totalProjects] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: {
        OR: [
          { assigneeId: userId },
          { reporterId: userId },
          { project: { workspaceId: { in: workspaceIds } } }
        ]
      },
      _count: true
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        dueDate: { lt: new Date() },
        status: { not: 'DONE' }
      }
    }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      select: {
        id: true, title: true, status: true, priority: true, dueDate: true,
        project: { select: { id: true, name: true } }
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      take: 10
    }),
    prisma.project.findMany({
      where: { workspaceId: { in: workspaceIds } },
      select: {
        id: true, name: true, status: true, progress: true,
        _count: { select: { tasks: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    }),
    prisma.project.count({ where: { workspaceId: { in: workspaceIds } } }),
  ]);

  // Format task stats
  const tasksByStatus = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };
  taskStats.forEach(stat => {
    tasksByStatus[stat.status] = stat._count;
  });

  return {
    tasksByStatus,
    overdueTasks,
    myTasks,
    projectProgress,
    totalProjects,
  };
};

export const getRecentActivity = async (userId) => {
  const workspaceMemberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true },
  });
  const workspaceIds = workspaceMemberships.map(m => m.workspaceId);

  const [recentTasks, recentMessages] = await Promise.all([
    prisma.task.findMany({
      where: { project: { workspaceId: { in: workspaceIds } } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.message.findMany({
      where: { project: { workspaceId: { in: workspaceIds } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        author: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Merge and sort by date
  const activity = [
    ...recentTasks.map(t => ({ type: 'task', ...t, timestamp: t.updatedAt })),
    ...recentMessages.map(m => ({ type: 'message', ...m, timestamp: m.createdAt })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

  return activity;
};

export default { getDashboardStats, getRecentActivity };