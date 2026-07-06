import { Router } from "express";
import { jobDescriptionInputSchema } from "@resumeai/shared";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { jobDescriptionRepository } from "../repositories/job-description.repository";

export const jobDescriptionsRouter = Router();
jobDescriptionsRouter.use(requireAuth);

jobDescriptionsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const jds = await jobDescriptionRepository.listForUser(req.currentUser!.id);
    res.json({ data: jds });
  })
);

jobDescriptionsRouter.post(
  "/",
  validateBody(jobDescriptionInputSchema),
  asyncHandler(async (req, res) => {
    const jd = await jobDescriptionRepository.create(req.currentUser!.id, req.body);
    res.status(201).json({ data: jd });
  })
);
