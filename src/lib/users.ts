import prisma from "@/lib/prisma";
import { cache } from "react";

export const getUsers = cache(async () => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      }
    });

    return users.map(user => ({
      id: user.id,
      name: user.fullName,
      username: user.email,
      role: user.role
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
});
