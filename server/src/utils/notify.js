import { prisma } from "../prisma/client.js";

export async function createNotification({ userId, type, title, message, entityType, entityId }) {
  if (!userId || !type || !title || !message) return;

  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        entityType: entityType || null,
        entityId: entityId || null,
        isRead: false,
      },
    });
  } catch (err) {
    console.error("[Notify] Failed to create notification:", err.message);
  }
}

export async function createNotifications(userIds, senderId, notifData) {
  const recipients = [...new Set(userIds)].filter((id) => id && id !== senderId);
  if (!recipients.length) return;

  try {
    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type: notifData.type,
        title: notifData.title,
        message: notifData.message,
        entityType: notifData.entityType || null,
        entityId: notifData.entityId || null,
        isRead: false,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    console.error("[Notify] Failed to create bulk notifications:", err.message);
  }
}

export function extractMentions(text) {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}
