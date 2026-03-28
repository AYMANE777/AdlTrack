import prisma from './prisma';

export async function createNotificationForAllUsers({
  title,
  message,
  excludeUserId,
}: {
  title: string;
  message: string;
  excludeUserId?: number;
}) {
  try {
    const users = await prisma.user.findMany({
      where: excludeUserId ? { id: { not: excludeUserId } } : undefined,
      select: { id: true },
    });

    if (users.length === 0) return [];

    const notifications = await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title,
        message,
      })),
    });

    return notifications;
  } catch (error) {
    console.error('Failed to create notifications:', error);
    return null;
  }
}

export async function createNotificationForUser({
  userId,
  title,
  message,
}: {
  userId: number;
  title: string;
  message: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
