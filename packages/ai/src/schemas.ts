import { z } from "zod";

export const resumeAnalysisResultSchema = z.object({
  executiveSummary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  atsProblems: z.array(z.string()),
  formattingProblems: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  actionPlan: z.array(z.string()),
  priorityFixes: z.array(z.string()),
  estimatedInterviewProbability: z.number().min(0).max(100),
  estimatedRecruiterReadability: z.number().min(0).max(100),
  estimatedAtsPassProbability: z.number().min(0).max(100),
});
export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisResultSchema>;

export const atsAnalysisAiResultSchema = z.object({
  additionalRisks: z.array(z.string()),
  explanation: z.string(),
  confidenceNote: z.string(),
});
export type AtsAnalysisAiResult = z.infer<typeof atsAnalysisAiResultSchema>;

export const keywordAnalysisResultSchema = z.object({
  missingSkills: z.array(z.string()),
  experienceGap: z.string(),
  educationGap: z.string(),
  softSkillsGap: z.array(z.string()),
  technicalSkillsGap: z.array(z.string()),
  priorityRecommendations: z.array(z.string()),
});
export type KeywordAnalysisResult = z.infer<typeof keywordAnalysisResultSchema>;

export const interviewPrepResultSchema = z.object({
  questions: z.array(
    z.object({
      type: z.enum(["TECHNICAL", "BEHAVIORAL", "HR"]),
      question: z.string(),
      suggestedStarAnswer: z.string(),
    })
  ),
});
export type InterviewPrepResult = z.infer<typeof interviewPrepResultSchema>;

export const linkedinOptimizationResultSchema = z.object({
  headline: z.string(),
  about: z.string(),
  experienceBullets: z.array(z.object({ title: z.string(), bullets: z.array(z.string()) })),
  featured: z.array(z.string()),
  skills: z.array(z.string()),
  keywords: z.array(z.string()),
});
export type LinkedinOptimizationResult = z.infer<typeof linkedinOptimizationResultSchema>;

export const resumeRewriteResultSchema = z.object({
  rewrittenSections: z.array(z.object({ section: z.string(), original: z.string(), rewritten: z.string() })),
});
export type ResumeRewriteResult = z.infer<typeof resumeRewriteResultSchema>;

export const bulletRewriteResultSchema = z.object({
  rewritten: z.string(),
  actionVerbUsed: z.string(),
  rationale: z.string(),
});
export type BulletRewriteResult = z.infer<typeof bulletRewriteResultSchema>;
