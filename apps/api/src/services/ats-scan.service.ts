import { analyzeResume, type AtsPlatform, type ParsedResumeStructure } from "@resumeai/ats-engine";
import type { ScanRequestInput } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { uploadedResumeRepository } from "../repositories/uploaded-resume.repository";
import { jobDescriptionRepository } from "../repositories/job-description.repository";
import { atsAnalysisRepository } from "../repositories/ats-analysis.repository";
import { createAiClientForUser } from "../lib/ai";
import {
  collectDateStrings,
  collectExperienceBullets,
  collectProjectBullets,
  collectSkillItems,
  collectVolunteerBullets,
  resumeDocumentToStructure,
} from "./resume-to-structure";
import { ApiError } from "../lib/errors";
import type { ResumeDocument } from "@resumeai/shared";
import { resolveDisciplineGlossary } from "../lib/discipline";

export async function runAtsScan(userId: string, input: ScanRequestInput) {
  if (!input.resumeId && !input.uploadedResumeId) {
    throw ApiError.badRequest("Provide either resumeId or uploadedResumeId to scan");
  }

  let structureInput: Parameters<typeof analyzeResume>[0];
  let resumeTextForAi: string;
  let disciplineGlossary: string;

  if (input.resumeId) {
    const resume = await resumeService.getById(input.resumeId, userId);
    const doc = resume.currentVersion?.data as unknown as ResumeDocument;
    if (!doc) throw ApiError.badRequest("Resume has no content yet");

    const structure = resumeDocumentToStructure(doc, resume.template?.layoutConfig as { columns?: number; font?: string } | undefined);
    structureInput = {
      structure,
      bulletsBySection: {
        experience: collectExperienceBullets(doc),
        projects: collectProjectBullets(doc),
        volunteer: collectVolunteerBullets(doc),
      },
      skillItems: collectSkillItems(doc),
      dateStrings: collectDateStrings(doc),
    };
    resumeTextForAi = structure.rawText;
    disciplineGlossary = resolveDisciplineGlossary({ targetDiscipline: resume.targetDiscipline, targetJobRole: resume.targetJobRole });
  } else {
    const uploaded = await uploadedResumeRepository.findById(input.uploadedResumeId!, userId);
    if (!uploaded) throw ApiError.notFound("Uploaded resume not found");
    const structure = uploaded.parsedStructure as unknown as ParsedResumeStructure;
    structureInput = { structure };
    resumeTextForAi = uploaded.rawText ?? "";
    disciplineGlossary = resolveDisciplineGlossary({ targetDiscipline: input.targetDiscipline });
  }

  let jobDescriptionText = input.jobDescriptionText;
  const jobDescriptionId = input.jobDescriptionId;
  if (jobDescriptionId && !jobDescriptionText) {
    const jd = await jobDescriptionRepository.findById(jobDescriptionId, userId);
    if (!jd) throw ApiError.notFound("Job description not found");
    jobDescriptionText = jd.rawText;
  }

  const targetPlatform: AtsPlatform = input.targetPlatform;

  const ruleResult = analyzeResume({
    ...structureInput,
    jobDescriptionText,
    targetPlatform,
  });

  const aiClient = await createAiClientForUser(userId);

  const [resumeAnalysis, platformAnalysis, keywordAnalysis] = await Promise.all([
    aiClient
      .analyzeResume({ resumeText: resumeTextForAi, disciplineGlossary })
      .catch((error) => ({ error: error instanceof Error ? error.message : "AI analysis unavailable" })),
    aiClient
      .analyzeAtsPlatform({
        parsedStructure: JSON.stringify(structureInput.structure),
        ruleFindings: JSON.stringify(ruleResult.findings),
        platform: targetPlatform,
      })
      .catch((error) => ({ error: error instanceof Error ? error.message : "AI platform analysis unavailable" })),
    jobDescriptionText
      ? aiClient
          .analyzeKeywords({
            resumeText: resumeTextForAi,
            jobDescriptionText,
            ruleBasedMatch: JSON.stringify(ruleResult.keywordMatch),
            disciplineGlossary,
          })
          .catch((error) => ({ error: error instanceof Error ? error.message : "AI keyword analysis unavailable" }))
      : Promise.resolve(null),
  ]);

  const analysis = await atsAnalysisRepository.create({
    userId,
    resumeId: input.resumeId,
    uploadedResumeId: input.uploadedResumeId,
    jobDescriptionId,
    targetPlatform,
    overallScore: ruleResult.scores.overallScore,
    atsPassScore: ruleResult.scores.atsPassScore,
    recruiterAppealScore: ruleResult.scores.recruiterAppealScore,
    roleMatchScore: ruleResult.scores.roleMatchScore,
    formattingScore: ruleResult.scores.formattingScore,
    keywordScore: ruleResult.scores.keywordScore,
    experienceScore: ruleResult.scores.experienceScore,
    educationScore: ruleResult.scores.educationScore,
    skillsScore: ruleResult.scores.skillsScore,
    grammarScore: ruleResult.scores.grammarScore,
    atsCompatibilityScore: ruleResult.scores.atsCompatibilityScore,
    recruiterReadabilityScore: ruleResult.scores.recruiterReadabilityScore,
    ruleFindings: ruleResult.findings as never,
    keywordMatch: (ruleResult.keywordMatch ?? {}) as never,
    aiAnalysis: { resumeAnalysis, keywordAnalysis } as never,
    platformNotes: { primary: ruleResult.primaryPlatformSimulation, all: ruleResult.platformSimulations, ai: platformAnalysis } as never,
    interviewProbability: "estimatedInterviewProbability" in resumeAnalysis ? resumeAnalysis.estimatedInterviewProbability : undefined,
    estimatedRecruiterReadTimeSec: Math.round(ruleResult.wordCount / 3.3), // ~200 wpm skim reading estimate
  });

  return { analysis, ruleResult, resumeAnalysis, platformAnalysis, keywordAnalysis };
}
