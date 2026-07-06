import { prisma } from "../lib/prisma";

export const subscriptionRepository = {
  findByUserId(userId: string) {
    return prisma.subscription.findUnique({ where: { userId } });
  },

  incrementScanUsage(userId: string) {
    return prisma.subscription.update({
      where: { userId },
      data: { scansUsedThisPeriod: { increment: 1 } },
    });
  },

  resetPeriod(userId: string, periodEnd: Date) {
    return prisma.subscription.update({
      where: { userId },
      data: { scansUsedThisPeriod: 0, periodStart: new Date(), periodEnd },
    });
  },

  updatePlan(userId: string, plan: "FREE" | "PREMIUM" | "ENTERPRISE", scanLimit: number) {
    return prisma.subscription.update({ where: { userId }, data: { plan, scanLimit } });
  },

  listAllWithUser() {
    return prisma.subscription.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  },
};
