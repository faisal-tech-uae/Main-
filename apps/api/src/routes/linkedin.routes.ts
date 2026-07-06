import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rate-limit";
import { requirePlanFeature } from "../middleware/plan-feature";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { generateLinkedInOptimization } from "../services/linkedin.service";
import { linkedinRepository } from "../repositories/linkedin.repository";

export const linkedinRouter = Router();
linkedinRouter.use(requireAuth);

const requestSchema = z.object({ resumeId: z.string() });

linkedinRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const optimizations = await linkedinRepository.listForUser(req.currentUser!.id);
    res.json({ data: optimizations });
  })
);

linkedinRouter.post(
  "/",
  aiRateLimiter,
  requirePlanFeature("linkedinOptimizer"),
  validateBody(requestSchema),
  asyncHandler(async (req, res) => {
    const result = await generateLinkedInOptimization(req.currentUser!.id, req.body.resumeId);
    res.status(201).json({ data: result });
  })
);
