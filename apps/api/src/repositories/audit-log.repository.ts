import { prisma } from "../lib/prisma";

export const auditLogRepository = {
  record(params: { userId?: string; action: string; targetType?: string; targetId?: string; metadata?: unknown; ipAddress?: string }) {
    return prisma.auditLog.create({ data: { ...params, metadata: params.metadata as never } });
  },

  countByAction(userId: string, action: string) {
    return prisma.auditLog.count({ where: { userId, action } });
  },

  listRecent(limit = 100) {
    return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
  },
};
