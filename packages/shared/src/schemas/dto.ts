import { z } from "zod";
import { resumeDocumentSchema } from "./resume";

export const createResumeSchema = z.object({
  title: z.string().min(1).max(120).default("Untitled Resume"),
  templateId: z.string().optional(),
  targetCountry: z.string().optional(),
  targetIndustry: z.string().optional(),
  targetJobLevel: z.string().optional(),
  targetJobRole: z.string().optional(),
  /** MEP discipline id from MEP_DISCIPLINES (packages/shared/src/constants/mep-disciplines.ts), e.g. "hvac". */
  targetDiscipline: z.string().optional(),
  yearsExperience: z.number().int().min(0).max(60).optional(),
});
export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export const updateResumeMetaSchema = createResumeSchema.partial();
export type UpdateResumeMetaInput = z.infer<typeof updateResumeMetaSchema>;

export const updateResumeContentSchema = z.object({
  data: resumeDocumentSchema,
  changeNote: z.string().optional(),
});
export type UpdateResumeContentInput = z.infer<typeof updateResumeContentSchema>;

export const jobDescriptionInputSchema = z.object({
  company: z.string().optional(),
  roleTitle: z.string().optional(),
  rawText: z.string().min(20, "Job description is too short"),
});
export type JobDescriptionInput = z.infer<typeof jobDescriptionInputSchema>;

export const atsPlatformSchema = z.enum([
  "GREENHOUSE",
  "LEVER",
  "WORKDAY",
  "ORACLE_TALEO",
  "SAP_SUCCESSFACTORS",
  "ICIMS",
  "SMARTRECRUITERS",
  "JAZZHR",
  "BAMBOOHR",
  "UKG",
  "DAYFORCE",
  "GENERIC",
]);
export type AtsPlatformName = z.infer<typeof atsPlatformSchema>;

export const scanRequestSchema = z.object({
  resumeId: z.string().optional(),
  uploadedResumeId: z.string().optional(),
  jobDescriptionId: z.string().optional(),
  jobDescriptionText: z.string().optional(),
  targetPlatform: atsPlatformSchema.default("GENERIC"),
  /** MEP discipline id (see MEP_DISCIPLINES) — only used when scanning an uploaded file without a linked resume. */
  targetDiscipline: z.string().optional(),
});
export type ScanRequestInput = z.infer<typeof scanRequestSchema>;

export const coverLetterRequestSchema = z.object({
  resumeId: z.string(),
  company: z.string().min(1),
  roleTitle: z.string().min(1),
  jobDescriptionText: z.string().optional(),
  tone: z.enum(["professional", "enthusiastic", "concise", "executive"]).default("professional"),
});
export type CoverLetterRequestInput = z.infer<typeof coverLetterRequestSchema>;

export const interviewPrepRequestSchema = z.object({
  resumeId: z.string(),
  roleTitle: z.string().min(1),
  jobDescriptionText: z.string().optional(),
});
export type InterviewPrepRequestInput = z.infer<typeof interviewPrepRequestSchema>;

export const bulletRewriteRequestSchema = z.object({
  bulletText: z.string().min(1),
  roleTitle: z.string().optional(),
  /** Optional owning resume id, used only to resolve discipline terminology for the rewrite — ownership isn't re-checked here. */
  resumeId: z.string().optional(),
});
export type BulletRewriteRequestInput = z.infer<typeof bulletRewriteRequestSchema>;
