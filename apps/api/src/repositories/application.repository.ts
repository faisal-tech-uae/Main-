import { prisma } from "../lib/prisma";

export const applicationRepository = {
  listForUser(userId: string) {
    return prisma.application.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  countByStatus(userId: string) {
    return prisma.application.groupBy({ by: ["status"], where: { userId }, _count: { _all: true } });
  },

  create(userId: string, data: { company: string; roleTitle: string; resumeId?: string; status?: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED"; notes?: string }) {
    return prisma.application.create({ data: { userId, ...data } });
  },

  updateStatus(id: string, userId: string, status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED") {
    return prisma.application.updateMany({ where: { id, userId }, data: { status, appliedAt: status === "APPLIED" ? new Date() : undefined } });
  },
};
