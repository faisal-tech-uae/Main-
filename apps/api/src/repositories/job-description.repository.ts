import { prisma } from "../lib/prisma";
import type { JobDescriptionInput } from "@resumeai/shared";

export const jobDescriptionRepository = {
  create(userId: string, input: JobDescriptionInput) {
    return prisma.jobDescription.create({
      data: { userId, company: input.company, roleTitle: input.roleTitle, rawText: input.rawText },
    });
  },

  findById(id: string, userId: string) {
    return prisma.jobDescription.findFirst({ where: { id, userId } });
  },

  listForUser(userId: string) {
    return prisma.jobDescription.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
  },

  saveExtractedKeywords(id: string, extractedKeywords: unknown) {
    return prisma.jobDescription.update({ where: { id }, data: { extractedKeywords: extractedKeywords as never } });
  },
};
