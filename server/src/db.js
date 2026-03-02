import 'dotenv/config'
import { PrismaClient } from './generated/prisma/index.js'
import { PrismaNeon } from '@prisma/adapter-neon'
import { logger } from './config/logger.js'

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})

const baseClient = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
})

// Auto-calculate project progress using Prisma Extensions (v5+ compatible)
export const prisma = baseClient.$extends({
  query: {
    task: {
      async create({ args, query }) {
        const result = await query(args);
        await recalculateProgress(result.projectId);
        return result;
      },
      async update({ args, query }) {
        // Capture old projectId BEFORE update to handle project moves
        const oldTask = await baseClient.task.findUnique({
          where: args.where,
          select: { projectId: true }
        });

        const result = await query(args);

        if (oldTask) {
          await recalculateProgress(oldTask.projectId);
          // If task moved to a new project, recalculate new project too
          if (result.projectId && result.projectId !== oldTask.projectId) {
            await recalculateProgress(result.projectId);
          }
        }
        return result;
      },
      async delete({ args, query }) {
        const task = await baseClient.task.findUnique({
          where: args.where,
          select: { projectId: true }
        });
        const result = await query(args);
        if (task) await recalculateProgress(task.projectId);
        return result;
      },
    },
  },
});

async function recalculateProgress(projectId) {
  try {
    const [total, done] = await Promise.all([
      baseClient.task.count({ where: { projectId } }),
      baseClient.task.count({ where: { projectId, status: 'DONE' } }),
    ]);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    await baseClient.project.update({ where: { id: projectId }, data: { progress } });
    logger.debug(`Updated project ${projectId} progress to ${progress}%`);
  } catch (error) {
    logger.error('Error auto-calculating project progress:', error.message);
  }
}

// Query logging & slow query detection
baseClient.$on('query', (e) => {
  if (e.duration > 500) {
    logger.warn('Slow query detected', { query: e.query.substring(0, 200), duration: e.duration });
  }
  if (process.env.NODE_ENV === 'development') {
    logger.debug('DB Query', { query: e.query.substring(0, 200), duration: e.duration });
  }
});

export const testConnection = async () => {
  try {
    await baseClient.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error('DB connection failed:', err.message);
    return false;
  }
};
