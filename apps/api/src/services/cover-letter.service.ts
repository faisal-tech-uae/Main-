import type { CoverLetterRequestInput } from "@resumeai/shared";
import type { ResumeDocument } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { resumeDocumentToStructure } from "./resume-to-structure";
import { coverLetterRepository } from "../repositories/cover-letter.repository";
import { createAiClientForUser } from "../lib/ai";
import { ApiError } from "../lib/errors";
import { resolveDisciplineGlossary } from "../lib/discipline";

export async function generateCoverLetter(userId: string, input: CoverLetterRequestInput) {
  const resume = await resumeService.getById(input.resumeId, userId);
  const doc = resume.currentVersion?.data as unknown as ResumeDocument;
  if (!doc) throw ApiError.badRequest("Resume has no content yet");

  const { rawText } = resumeDocumentToStructure(doc);
  const aiClient = await createAiClientForUser(userId);
  const disciplineGlossary = resolveDisciplineGlossary({ targetDiscipline: resume.targetDiscipline, targetJobRole: resume.targetJobRole });

  const content = await aiClient.generateCoverLetter({
    resumeText: rawText,
    company: input.company,
    roleTitle: input.roleTitle,
    jobDescriptionText: input.jobDescriptionText,
    tone: input.tone,
    disciplineGlossary,
  });

  return coverLetterRepository.create(userId, {
    resumeId: input.resumeId,
    company: input.company,
    roleTitle: input.roleTitle,
    jobDescriptionText: input.jobDescriptionText,
    content,
    tone: input.tone,
  });
}
