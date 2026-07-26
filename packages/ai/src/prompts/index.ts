import type { AiFeature, PromptSpec } from "../types";
import { resumeAnalysisPrompt } from "./resume-analysis";
import { atsAnalysisPrompt } from "./ats-analysis";
import { keywordAnalysisPrompt } from "./keyword-analysis";
import { coverLetterPrompt } from "./cover-letter";
import { interviewPrepPrompt } from "./interview-prep";
import { linkedinOptimizationPrompt } from "./linkedin-optimization";
import { resumeRewritePrompt, bulletRewritePrompt } from "./resume-rewrite";
import { resumeStructuringPrompt } from "./resume-structuring";

export const DEFAULT_PROMPTS: Record<AiFeature, PromptSpec> = {
  RESUME_ANALYSIS: resumeAnalysisPrompt,
  ATS_ANALYSIS: atsAnalysisPrompt,
  KEYWORD_ANALYSIS: keywordAnalysisPrompt,
  COVER_LETTER: coverLetterPrompt,
  INTERVIEW_PREP: interviewPrepPrompt,
  LINKEDIN_OPTIMIZATION: linkedinOptimizationPrompt,
  RESUME_REWRITE: resumeRewritePrompt,
  BULLET_REWRITE: bulletRewritePrompt,
  RESUME_STRUCTURING: resumeStructuringPrompt,
};

export * from "./resume-analysis";
export * from "./ats-analysis";
export * from "./keyword-analysis";
export * from "./cover-letter";
export * from "./interview-prep";
export * from "./linkedin-optimization";
export * from "./resume-rewrite";
export * from "./resume-structuring";
