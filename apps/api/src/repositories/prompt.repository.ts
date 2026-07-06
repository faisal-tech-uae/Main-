import { prisma } from "../lib/prisma";
import type { AiFeature } from "@resumeai/db";

export const promptRepository = {
  listActive() {
    return prisma.promptTemplate.findMany({ where: { isActive: true } });
  },

  findByFeature(feature: AiFeature) {
    return prisma.promptTemplate.findUnique({ where: { feature } });
  },

  listAll() {
    return prisma.promptTemplate.findMany({ orderBy: { feature: "asc" } });
  },

  update(feature: AiFeature, data: { systemPrompt?: string; userPromptTemplate?: string; isActive?: boolean; updatedBy?: string }) {
    return prisma.promptTemplate.update({
      where: { feature },
      data: { ...data, version: { increment: 1 } },
    });
  },
};
