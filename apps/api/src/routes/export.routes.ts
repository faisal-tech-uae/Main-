import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/async-handler";
import { exportResumeAsDocx, exportResumeAsPdf, exportResumeAsVisualPdf } from "../services/export.service";
import { auditLogRepository } from "../repositories/audit-log.repository";

export const exportRouter = Router();
exportRouter.use(requireAuth);

exportRouter.get(
  "/:id/pdf",
  asyncHandler(async (req, res) => {
    const visual = req.query.variant === "visual";
    const buffer = visual
      ? await exportResumeAsVisualPdf(req.params.id, req.currentUser!.id)
      : await exportResumeAsPdf(req.params.id, req.currentUser!.id);
    await auditLogRepository.record({
      userId: req.currentUser!.id,
      action: "resume_download",
      targetType: "resume",
      targetId: req.params.id,
      metadata: { format: "pdf", variant: visual ? "visual" : "ats" },
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="resume${visual ? "-visual" : ""}.pdf"`);
    res.send(buffer);
  })
);

exportRouter.get(
  "/:id/docx",
  asyncHandler(async (req, res) => {
    const buffer = await exportResumeAsDocx(req.params.id, req.currentUser!.id);
    await auditLogRepository.record({ userId: req.currentUser!.id, action: "resume_download", targetType: "resume", targetId: req.params.id, metadata: { format: "docx" } });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="resume.docx"`);
    res.send(buffer);
  })
);
