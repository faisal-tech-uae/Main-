import { z } from "zod";
import type { AiFeature, AiProviderClient, CompletionUsage, PromptSpec } from "./types";
import { renderTemplate } from "./template";
import { DEFAULT_PROMPTS } from "./prompts";
import {
  resumeAnalysisResultSchema,
  atsAnalysisAiResultSchema,
  keywordAnalysisResultSchema,
  interviewPrepResultSchema,
  linkedinOptimizationResultSchema,
  resumeRewriteResultSchema,
  bulletRewriteResultSchema,
  type ResumeAnalysisResult,
  type AtsAnalysisAiResult,
  type KeywordAnalysisResult,
  type InterviewPrepResult,
  type LinkedinOptimizationResult,
  type ResumeRewriteResult,
  type BulletRewriteResult,
} from "./schemas";

export interface AiUsageEvent {
  feature: AiFeature;
  provider: string;
  model: string;
  usage: CompletionUsage;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
}

export interface AiClientOptions {
  provider: AiProviderClient;
  /** Override default prompts per feature, e.g. with admin-managed PromptTemplate rows from the DB. */
  promptOverrides?: Partial<Record<AiFeature, PromptSpec>>;
  onUsage?: (event: AiUsageEvent) => void | Promise<void>;
}

/** Strips ```json fences some models add even in JSON mode. */
function extractJson(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

export class AiClient {
  constructor(private readonly options: AiClientOptions) {}

  private promptFor(feature: AiFeature): PromptSpec {
    return this.options.promptOverrides?.[feature] ?? DEFAULT_PROMPTS[feature];
  }

  private async runJson<T>(feature: AiFeature, variables: Record<string, string | number | undefined>, schema: z.ZodType<T>): Promise<T> {
    const prompt = this.promptFor(feature);
    const userPrompt = renderTemplate(prompt.userPromptTemplate, variables);
    const { provider } = this.options;

    try {
      const result = await provider.complete({
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        jsonMode: true,
      });

      await this.options.onUsage?.({
        feature,
        provider: provider.provider,
        model: result.model,
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
      });

      const parsed = JSON.parse(extractJson(result.content));
      return schema.parse(parsed);
    } catch (error) {
      await this.options.onUsage?.({
        feature,
        provider: provider.provider,
        model: provider.model,
        usage: { promptTokens: 0, completionTokens: 0 },
        latencyMs: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async runText(feature: AiFeature, variables: Record<string, string | number | undefined>): Promise<string> {
    const prompt = this.promptFor(feature);
    const userPrompt = renderTemplate(prompt.userPromptTemplate, variables);
    const { provider } = this.options;

    try {
      const result = await provider.complete({
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        jsonMode: false,
      });

      await this.options.onUsage?.({
        feature,
        provider: provider.provider,
        model: result.model,
        usage: result.usage,
        latencyMs: result.latencyMs,
        success: true,
      });

      return result.content.trim();
    } catch (error) {
      await this.options.onUsage?.({
        feature,
        provider: provider.provider,
        model: provider.model,
        usage: { promptTokens: 0, completionTokens: 0 },
        latencyMs: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  analyzeResume(vars: { resumeText: string; targetRole?: string; targetIndustry?: string; targetCountry?: string; jobLevel?: string }): Promise<ResumeAnalysisResult> {
    return this.runJson("RESUME_ANALYSIS", vars, resumeAnalysisResultSchema);
  }

  analyzeAtsPlatform(vars: { parsedStructure: string; ruleFindings: string; platform: string }): Promise<AtsAnalysisAiResult> {
    return this.runJson("ATS_ANALYSIS", vars, atsAnalysisAiResultSchema);
  }

  analyzeKeywords(vars: { resumeText: string; jobDescriptionText: string; ruleBasedMatch: string }): Promise<KeywordAnalysisResult> {
    return this.runJson("KEYWORD_ANALYSIS", vars, keywordAnalysisResultSchema);
  }

  generateCoverLetter(vars: { resumeText: string; company: string; roleTitle: string; jobDescriptionText?: string; tone?: string }): Promise<string> {
    return this.runText("COVER_LETTER", { ...vars, tone: vars.tone ?? "professional" });
  }

  generateInterviewPrep(vars: { resumeText: string; roleTitle: string; jobDescriptionText?: string }): Promise<InterviewPrepResult> {
    return this.runJson("INTERVIEW_PREP", vars, interviewPrepResultSchema);
  }

  optimizeLinkedIn(vars: { resumeText: string }): Promise<LinkedinOptimizationResult> {
    return this.runJson("LINKEDIN_OPTIMIZATION", vars, linkedinOptimizationResultSchema);
  }

  rewriteResume(vars: { resumeText: string }): Promise<ResumeRewriteResult> {
    return this.runJson("RESUME_REWRITE", vars, resumeRewriteResultSchema);
  }

  rewriteBullet(vars: { bulletText: string; roleTitle?: string }): Promise<BulletRewriteResult> {
    return this.runJson("BULLET_REWRITE", vars, bulletRewriteResultSchema);
  }
}
