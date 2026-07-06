import { Router } from "express";
import { coverLetterRequestSchema } from "@resumeai/shared";
import { requireAuth } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rate-limit";
import { requirePlanFeature } from "../middleware/plan-feature";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { generateCoverLetter } from "../services/cover-letter.service";
import { coverLetterRepository } from "../repositories/cover-letter.repository";

export const coverLettersRouter = Router();
coverLettersRouter.use(requireAuth);

coverLettersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const letters = await coverLetterRepository.listForUser(req.currentUser!.id);
    res.json({ data: letters });
  })
);

coverLettersRouter.post(
  "/",
  aiRateLimiter,
  requirePlanFeature("coverLetters"),
  validateBody(coverLetterRequestSchema),
  asyncHandler(async (req, res) => {
    const letter = await generateCoverLetter(req.currentUser!.id, req.body);
    res.status(201).json({ data: letter });
  })
);
