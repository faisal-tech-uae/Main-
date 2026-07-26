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

// Lenient by design: this is a best-effort extraction from unstructured text,
// so every field defaults to an empty value rather than failing the whole
// parse when the model omits something. The API layer (structuring.service.ts)
// wraps the call in a try/catch and falls back to an empty document if the
// model's output doesn't validate at all — the builder UI lets the user fix
// anything mis-extracted either way.
const structuringDateRange = z.object({
  startDate: z.string().default(""),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});

export const resumeStructuringResultSchema = z.object({
  personalInfo: z
    .object({
      fullName: z.string().default(""),
      email: z.string().default(""),
      phone: z.string().default(""),
      location: z.string().optional(),
      linkedinUrl: z.string().optional(),
      githubUrl: z.string().optional(),
      portfolioUrl: z.string().optional(),
      jobTitle: z.string().optional(),
    })
    .default({ fullName: "", email: "", phone: "" }),
  summary: z.string().optional(),
  experience: z
    .array(
      structuringDateRange.extend({
        jobTitle: z.string().default(""),
        employer: z.string().default(""),
        location: z.string().optional(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  projects: z
    .array(
      structuringDateRange.extend({
        name: z.string().default(""),
        role: z.string().optional(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  education: z
    .array(
      structuringDateRange.extend({
        institution: z.string().default(""),
        degree: z.string().default(""),
        fieldOfStudy: z.string().optional(),
        gpa: z.string().optional(),
      })
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().optional(),
        issueDate: z.string().optional(),
      })
    )
    .default([]),
  skills: z.array(z.object({ category: z.string().default("Skills"), items: z.array(z.string()).default([]) })).default([]),
  languages: z
    .array(z.object({ language: z.string().default(""), proficiency: z.string().default("Professional Working") }))
    .default([]),
  awards: z
    .array(z.object({ title: z.string().default(""), issuer: z.string().optional(), date: z.string().optional() }))
    .default([]),
  volunteer: z
    .array(
      structuringDateRange.extend({
        organization: z.string().default(""),
        role: z.string().optional(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  detectedDiscipline: z.string().optional(),
});
export type ResumeStructuringResult = z.infer<typeof resumeStructuringResultSchema>;
