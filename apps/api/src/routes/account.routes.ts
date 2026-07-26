import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { prisma } from "../lib/prisma";
import { privacyRepository } from "../repositories/privacy.repository";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { userRepository } from "../repositories/user.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";

export const accountRouter = Router();
accountRouter.use(requireAuth);

accountRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = req.currentUser!;
    const [subscription, privacy] = await Promise.all([
      subscriptionRepository.findByUserId(user.id),
      privacyRepository.findByUserId(user.id),
    ]);
    res.json({ data: { user, subscription, privacy } });
  })
);

const privacySchema = z.object({
  allowAiTraining: z.boolean().optional(),
  allowAnalytics: z.boolean().optional(),
  dataRetentionDays: z.number().int().min(30).max(3650).optional(),
});

accountRouter.put(
  "/me/privacy",
  validateBody(privacySchema),
  asyncHandler(async (req, res) => {
    const privacy = await privacyRepository.upsert(req.currentUser!.id, req.body);
    res.json({ data: privacy });
  })
);

/** GDPR data export: a full JSON dump of everything tied to this account. */
accountRouter.get(
  "/me/export",
  asyncHandler(async (req, res) => {
    const userId = req.currentUser!.id;
    const [resumes, uploadedResumes, jobDescriptions, atsAnalyses, coverLetters, linkedinOptimizations, interviewSessions, applications] =
      await Promise.all([
        prisma.resume.findMany({ where: { userId }, include: { versions: true } }),
        prisma.uploadedResume.findMany({ where: { userId } }),
        prisma.jobDescription.findMany({ where: { userId } }),
        prisma.atsAnalysis.findMany({ where: { userId } }),
        prisma.coverLetter.findMany({ where: { userId } }),
        prisma.linkedInOptimization.findMany({ where: { userId } }),
        prisma.interviewSession.findMany({ where: { userId } }),
        prisma.application.findMany({ where: { userId } }),
      ]);

    await auditLogRepository.record({ userId, action: "gdpr_data_export" });

    res.setHeader("Content-Disposition", `attachment; filename="resumeai-pro-data-export.json"`);
    res.json({
      exportedAt: new Date().toISOString(),
      user: req.currentUser,
      resumes,
      uploadedResumes,
      jobDescriptions,
      atsAnalyses,
      coverLetters,
      linkedinOptimizations,
      interviewSessions,
      applications,
    });
  })
);

/** GDPR right to erasure: soft-deletes the account; a scheduled job purges after the retention window. */
accountRouter.delete(
  "/me",
  asyncHandler(async (req, res) => {
    await userRepository.softDelete(req.currentUser!.id);
    await auditLogRepository.record({ userId: req.currentUser!.id, action: "gdpr_account_deletion_requested" });
    res.status(204).send();
  })
);
