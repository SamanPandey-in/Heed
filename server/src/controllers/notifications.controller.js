import { prisma } from "../prisma/client.js";

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;
    const unreadOnly = req.query.unread === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

export const clearAll = async (req, res, next) => {
  try {
    await prisma.notification.deleteMany({ where: { userId: req.userId } });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    next(err);
  }
};
