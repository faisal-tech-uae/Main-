import { Router } from "express";
import { scanRequestSchema } from "@resumeai/shared";
import { requireAuth } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rate-limit";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { runAtsScan } from "../services/ats-scan.service";
import { assertScanQuotaAndIncrement } from "../services/subscription.service";
import { atsAnalysisRepository } from "../repositories/ats-analysis.repository";

export const scanRouter = Router();
scanRouter.use(requireAuth);

scanRouter.post(
  "/",
  aiRateLimiter,
  validateBody(scanRequestSchema),
  asyncHandler(async (req, res) => {
    const userId = req.currentUser!.id;
    await assertScanQuotaAndIncrement(userId);
    const result = await runAtsScan(userId, req.body);
    res.status(201).json({ data: result });
  })
);

scanRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const analyses = await atsAnalysisRepository.listForUser(req.currentUser!.id);
    res.json({ data: analyses });
  })
);

scanRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const analysis = await atsAnalysisRepository.findById(req.params.id, req.currentUser!.id);
    if (!analysis) {
      res.status(404).json({ error: { message: "Analysis not found" } });
      return;
    }
    res.json({ data: analysis });
  })
);
