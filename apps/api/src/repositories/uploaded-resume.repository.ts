import { prisma } from "../lib/prisma";
import type { ParsedResumeStructure } from "@resumeai/ats-engine";
import type { UploadSourceType } from "@resumeai/db";

export const uploadedResumeRepository = {
  create(userId: string, params: { fileName: string; fileType: UploadSourceType; storageKey: string; rawText: string; parsedStructure: ParsedResumeStructure }) {
    return prisma.uploadedResume.create({
      data: {
        userId,
        fileName: params.fileName,
        fileType: params.fileType,
        storageKey: params.storageKey,
        rawText: params.rawText,
        parsedStructure: params.parsedStructure as never,
      },
    });
  },

  findById(id: string, userId: string) {
    return prisma.uploadedResume.findFirst({ where: { id, userId } });
  },

  listForUser(userId: string) {
    return prisma.uploadedResume.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 });
  },
};
