import type { ResumeDocument } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { renderResumePdf } from "./export/pdf-exporter";
import { renderResumeDocx } from "./export/docx-exporter";
import { ApiError } from "../lib/errors";

async function loadResumeDocument(resumeId: string, userId: string): Promise<ResumeDocument> {
  const resume = await resumeService.getById(resumeId, userId);
  const doc = resume.currentVersion?.data as unknown as ResumeDocument;
  if (!doc) throw ApiError.badRequest("Resume has no content yet");
  return doc;
}

export async function exportResumeAsPdf(resumeId: string, userId: string): Promise<Buffer> {
  const doc = await loadResumeDocument(resumeId, userId);
  return renderResumePdf(doc);
}

export async function exportResumeAsDocx(resumeId: string, userId: string): Promise<Buffer> {
  const doc = await loadResumeDocument(resumeId, userId);
  return renderResumeDocx(doc);
}
