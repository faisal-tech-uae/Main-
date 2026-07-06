import { prisma } from "../lib/prisma";
import type { AiFeature, AiProvider } from "@resumeai/db";

export const aiUsageRepository = {
  log(entry: {
    userId: string;
    feature: AiFeature;
    provider: AiProvider;
    model: string;
    promptTokens: number;
    completionTokens: number;
    costMicros: number;
    latencyMs: number;
    success: boolean;
    errorMessage?: string;
  }) {
    return prisma.aiUsageLog.create({ data: entry });
  },

  async summary(sinceDays = 30) {
    const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
    const logs = await prisma.aiUsageLog.findMany({ where: { createdAt: { gte: since } } });

    const totalCostMicros = logs.reduce((sum, l) => sum + l.costMicros, 0);
    const totalRequests = logs.length;
    const successRate = totalRequests === 0 ? 1 : logs.filter((l) => l.success).length / totalRequests;

    const byFeature = groupBy(logs, (l) => l.feature);

    return {
      totalCostMicros,
      totalRequests,
      successRate,
      byFeature: Object.fromEntries(
        Object.entries(byFeature).map(([feature, entries]) => [feature, (entries as unknown[])?.length ?? 0])
      ),
    };
  },

  listRecent(limit = 50) {
    return prisma.aiUsageLog.findMany({ orderBy: { createdAt: "desc" }, take: limit, include: { user: true } });
  },
};

function groupBy<T, K extends PropertyKey>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      (acc[key] ??= []).push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}
