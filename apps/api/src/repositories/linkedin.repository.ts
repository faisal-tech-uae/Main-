import { prisma } from "../lib/prisma";
import type { Prisma } from "@resumeai/db";

export const linkedinRepository = {
  create(userId: string, params: { headline: string; about: string; experienceBullets: Prisma.InputJsonValue; skills: Prisma.InputJsonValue; featured: Prisma.InputJsonValue; keywords: Prisma.InputJsonValue }) {
    return prisma.linkedInOptimization.create({ data: { userId, ...params } });
  },

  listForUser(userId: string) {
    return prisma.linkedInOptimization.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },
};
