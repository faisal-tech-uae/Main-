import { prisma } from "../lib/prisma";

export const privacyRepository = {
  findByUserId(userId: string) {
    return prisma.privacySetting.findUnique({ where: { userId } });
  },

  upsert(userId: string, data: { allowAiTraining?: boolean; allowAnalytics?: boolean; dataRetentionDays?: number }) {
    return prisma.privacySetting.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },
};
