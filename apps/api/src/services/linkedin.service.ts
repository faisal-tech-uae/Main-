import type { ResumeDocument } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { resumeDocumentToStructure } from "./resume-to-structure";
import { linkedinRepository } from "../repositories/linkedin.repository";
import { createAiClientForUser } from "../lib/ai";
import { ApiError } from "../lib/errors";

export async function generateLinkedInOptimization(userId: string, resumeId: string) {
  const resume = await resumeService.getById(resumeId, userId);
  const doc = resume.currentVersion?.data as unknown as ResumeDocument;
  if (!doc) throw ApiError.badRequest("Resume has no content yet");

  const { rawText } = resumeDocumentToStructure(doc);
  const aiClient = await createAiClientForUser(userId);
  const result = await aiClient.optimizeLinkedIn({ resumeText: rawText });

  return linkedinRepository.create(userId, {
    headline: result.headline,
    about: result.about,
    experienceBullets: result.experienceBullets as never,
    skills: result.skills as never,
    featured: result.featured as never,
    keywords: result.keywords as never,
  });
}
