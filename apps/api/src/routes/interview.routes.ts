import { Router } from "express";
import { interviewPrepRequestSchema } from "@resumeai/shared";
import { requireAuth } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rate-limit";
import { requirePlanFeature } from "../middleware/plan-feature";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { generateInterviewPrep } from "../services/interview.service";
import { interviewRepository } from "../repositories/interview.repository";

export const interviewRouter = Router();
interviewRouter.use(requireAuth);

interviewRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const sessions = await interviewRepository.listForUser(req.currentUser!.id);
    res.json({ data: sessions });
  })
);

interviewRouter.post(
  "/",
  aiRateLimiter,
  requirePlanFeature("interviewCoach"),
  validateBody(interviewPrepRequestSchema),
  asyncHandler(async (req, res) => {
    const session = await generateInterviewPrep(req.currentUser!.id, req.body);
    res.status(201).json({ data: session });
  })
);
