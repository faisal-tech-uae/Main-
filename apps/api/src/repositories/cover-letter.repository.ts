import { prisma } from "../lib/prisma";

export const coverLetterRepository = {
  create(userId: string, params: { resumeId?: string; company: string; roleTitle: string; jobDescriptionText?: string; content: string; tone: string }) {
    return prisma.coverLetter.create({ data: { userId, ...params } });
  },

  listForUser(userId: string) {
    return prisma.coverLetter.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  findById(id: string, userId: string) {
    return prisma.coverLetter.findFirst({ where: { id, userId } });
  },
};
