import type { InterviewPrepRequestInput } from "@resumeai/shared";
import type { ResumeDocument } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { resumeDocumentToStructure } from "./resume-to-structure";
import { interviewRepository } from "../repositories/interview.repository";
import { createAiClientForUser } from "../lib/ai";
import { ApiError } from "../lib/errors";
import { resolveDisciplineGlossary } from "../lib/discipline";

export async function generateInterviewPrep(userId: string, input: InterviewPrepRequestInput) {
  const resume = await resumeService.getById(input.resumeId, userId);
  const doc = resume.currentVersion?.data as unknown as ResumeDocument;
  if (!doc) throw ApiError.badRequest("Resume has no content yet");

  const { rawText } = resumeDocumentToStructure(doc);
  const aiClient = await createAiClientForUser(userId);
  const disciplineGlossary = resolveDisciplineGlossary({ targetDiscipline: resume.targetDiscipline, targetJobRole: resume.targetJobRole });

  const result = await aiClient.generateInterviewPrep({
    resumeText: rawText,
    roleTitle: input.roleTitle,
    jobDescriptionText: input.jobDescriptionText,
    disciplineGlossary,
  });

  return interviewRepository.create(userId, {
    roleTitle: input.roleTitle,
    jobDescriptionText: input.jobDescriptionText,
    questions: result.questions as never,
  });
}
