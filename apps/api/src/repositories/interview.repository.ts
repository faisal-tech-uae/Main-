import { prisma } from "../lib/prisma";
import type { Prisma } from "@resumeai/db";

export const interviewRepository = {
  create(userId: string, params: { roleTitle: string; jobDescriptionText?: string; questions: Prisma.InputJsonValue }) {
    return prisma.interviewSession.create({ data: { userId, ...params } });
  },

  listForUser(userId: string) {
    return prisma.interviewSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  findById(id: string, userId: string) {
    return prisma.interviewSession.findFirst({ where: { id, userId } });
  },
};
