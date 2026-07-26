import type { ResumeDocument } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { renderResumePdf } from "./export/pdf-exporter";
import { renderResumeVisualPdf } from "./export/pdf-exporter-visual";
import { renderResumeDocx } from "./export/docx-exporter";
import { storage } from "../lib/storage";
import { ApiError } from "../lib/errors";

async function loadResumeDocument(resumeId: string, userId: string): Promise<ResumeDocument> {
  const resume = await resumeService.getById(resumeId, userId);
  const doc = resume.currentVersion?.data as unknown as ResumeDocument;
  if (!doc) throw ApiError.badRequest("Resume has no content yet");
  return doc;
}

/** photoUrl is shaped "/api/resumes/:id/photo/:key" — pull the storage key back out of it. */
async function loadPhotoBuffer(doc: ResumeDocument): Promise<Buffer | null> {
  if (!doc.personalInfo.photoUrl) return null;
  const storageKey = doc.personalInfo.photoUrl.split("/").pop();
  if (!storageKey) return null;
  try {
    return await storage.get(storageKey);
  } catch {
    return null; // photo file missing/moved — export without it rather than failing the whole export
  }
}

export async function exportResumeAsPdf(resumeId: string, userId: string): Promise<Buffer> {
  const doc = await loadResumeDocument(resumeId, userId);
  return renderResumePdf(doc);
}

/** The "non-ATS" visual export: photo + colored two-column layout, meant for emailing a recruiter directly. */
export async function exportResumeAsVisualPdf(resumeId: string, userId: string): Promise<Buffer> {
  const doc = await loadResumeDocument(resumeId, userId);
  const photoBuffer = await loadPhotoBuffer(doc);
  return renderResumeVisualPdf(doc, photoBuffer);
}

export async function exportResumeAsDocx(resumeId: string, userId: string): Promise<Buffer> {
  const doc = await loadResumeDocument(resumeId, userId);
  return renderResumeDocx(doc);
}
