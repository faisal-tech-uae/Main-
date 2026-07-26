import { Router } from "express";
import multer from "multer";
import { createResumeSchema, updateResumeContentSchema, updateResumeMetaSchema } from "@resumeai/shared";
import { requireAuth } from "../middleware/auth";
import { requirePlanFeature } from "../middleware/plan-feature";
import { aiRateLimiter, uploadRateLimiter } from "../middleware/rate-limit";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { ApiError } from "../lib/errors";
import { env } from "../config/env";
import { resumeService } from "../services/resume.service";
import { rewriteEntireResume } from "../services/rewrite.service";
import { getResumePhoto, uploadResumePhoto } from "../services/photo.service";

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
});

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
  "/:id/meta",
  validateBody(updateResumeMetaSchema),
  asyncHandler(async (req, res) => {
    await resumeService.updateMeta(req.params.id, req.currentUser!.id, req.body);
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
  "/:id/photo",
  uploadRateLimiter,
  photoUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file uploaded. Attach a JPEG or PNG photo as 'file'.");
    const resume = await uploadResumePhoto(req.currentUser!.id, req.params.id, req.file.buffer);
    res.status(201).json({ data: resume });
  })
);

resumesRouter.get(
  "/:id/photo/:key",
  asyncHandler(async (req, res) => {
    const buffer = await getResumePhoto(req.currentUser!.id, req.params.id, req.params.key);
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.send(buffer);
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
