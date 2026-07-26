import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { uploadRateLimiter } from "../middleware/rate-limit";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { ApiError } from "../lib/errors";
import { env } from "../config/env";
import { inferUploadType, parseResumeFile } from "../services/parser.service";
import { storage } from "../lib/storage";
import { uploadedResumeRepository } from "../repositories/uploaded-resume.repository";
import { structureUploadedResume } from "../services/structuring.service";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
});

export const uploadsRouter = Router();
uploadsRouter.use(requireAuth, uploadRateLimiter);

uploadsRouter.post(
  "/resume",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No file uploaded. Attach a PDF, DOCX, or TXT file as 'file'.");

    const uploadType = inferUploadType(req.file.originalname, req.file.mimetype);
    const parsedStructure = await parseResumeFile(req.file.buffer, uploadType);
    const storageKey = await storage.put(req.file.originalname, req.file.buffer);

    const uploaded = await uploadedResumeRepository.create(req.currentUser!.id, {
      fileName: req.file.originalname,
      fileType: uploadType,
      storageKey,
      rawText: parsedStructure.rawText,
      parsedStructure,
    });

    res.status(201).json({ data: uploaded });
  })
);

const convertSchema = z.object({ targetDiscipline: z.string().optional() });

uploadsRouter.post(
  "/:id/convert-to-resume",
  validateBody(convertSchema),
  asyncHandler(async (req, res) => {
    const result = await structureUploadedResume(req.currentUser!.id, req.params.id, req.body.targetDiscipline);
    res.status(201).json({ data: result });
  })
);
