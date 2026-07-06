import { Router } from "express";
import { bulletRewriteRequestSchema } from "@resumeai/shared";
import { requireAuth } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rate-limit";
import { requirePlanFeature } from "../middleware/plan-feature";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { rewriteBullet } from "../services/rewrite.service";

export const rewriteRouter = Router();
rewriteRouter.use(requireAuth, aiRateLimiter, requirePlanFeature("resumeRewrite"));

rewriteRouter.post(
  "/bullet",
  validateBody(bulletRewriteRequestSchema),
  asyncHandler(async (req, res) => {
    const result = await rewriteBullet(req.currentUser!.id, req.body);
    res.json({ data: result });
  })
);
