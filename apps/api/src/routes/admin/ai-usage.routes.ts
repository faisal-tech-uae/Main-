import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { aiUsageRepository } from "../../repositories/ai-usage.repository";

export const adminAiUsageRouter = Router();

adminAiUsageRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const summary = await aiUsageRepository.summary(30);
    res.json({ data: summary });
  })
);

adminAiUsageRouter.get(
  "/recent",
  asyncHandler(async (_req, res) => {
    const logs = await aiUsageRepository.listRecent(100);
    res.json({ data: logs });
  })
);
