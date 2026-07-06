import { prisma } from "../lib/prisma";
import type { User } from "@resumeai/db";

export interface ClerkUserSync {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export const userRepository = {
  findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { clerkId } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async upsertFromClerk(data: ClerkUserSync): Promise<User> {
    const user = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: {
        email: data.email,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
      },
      create: {
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        subscription: {
          create: { plan: "FREE", status: "ACTIVE", scanLimit: 5 },
        },
        privacySettings: { create: {} },
      },
      include: { subscription: true },
    });
    return user;
  },

  listPaginated(params: { page: number; pageSize: number; search?: string }) {
    const where = params.search
      ? {
          OR: [
            { email: { contains: params.search, mode: "insensitive" as const } },
            { firstName: { contains: params.search, mode: "insensitive" as const } },
            { lastName: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    return Promise.all([
      prisma.user.findMany({
        where,
        include: { subscription: true },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.user.count({ where }),
    ]);
  },

  softDelete(userId: string) {
    return prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  },
};
