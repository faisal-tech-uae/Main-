import { Router } from "express";
import { createResumeSchema, updateResumeContentSchema } from "@resumeai/shared";
import { requireAuth } from "../middleware/auth";
import { requirePlanFeature } from "../middleware/plan-feature";
import { aiRateLimiter } from "../middleware/rate-limit";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { resumeService } from "../services/resume.service";
import { rewriteEntireResume } from "../services/rewrite.service";

export const resumesRouter = Router();
resumesRouter.use(requireAuth);

resumesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const resumes = await resumeService.listForUser(req.currentUser!.id);
    res.json({ data: resumes });
  })
);

resumesRouter.post(
  "/",
  validateBody(createResumeSchema),
  asyncHandler(async (req, res) => {
    const user = req.currentUser!;
    const resume = await resumeService.create(user.id, req.body, `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(), user.email);
    res.status(201).json({ data: resume });
  })
);

resumesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const resume = await resumeService.getById(req.params.id, req.currentUser!.id);
    res.json({ data: resume });
  })
);

resumesRouter.put(
  "/:id/content",
  validateBody(updateResumeContentSchema),
  asyncHandler(async (req, res) => {
    const resume = await resumeService.updateContent(req.params.id, req.currentUser!.id, req.body.data, req.body.changeNote);
    res.json({ data: resume });
  })
);

resumesRouter.post(
  "/:id/rewrite",
  aiRateLimiter,
  requirePlanFeature("resumeRewrite"),
  asyncHandler(async (req, res) => {
    const resume = await rewriteEntireResume(req.currentUser!.id, req.params.id);
    res.json({ data: resume });
  })
);

resumesRouter.post(
  "/:id/versions/:versionId/restore",
  asyncHandler(async (req, res) => {
    const resume = await resumeService.restoreVersion(req.params.id, req.currentUser!.id, req.params.versionId);
    res.json({ data: resume });
  })
);

resumesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await resumeService.remove(req.params.id, req.currentUser!.id);
    res.status(204).send();
  })
);
