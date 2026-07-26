import { AiClient, createProviderFromEnv, estimateCostMicros, type AiFeature as AiClientFeature, type PromptSpec } from "@resumeai/ai";
import type { AiFeature as DbAiFeature, AiProvider as DbAiProvider } from "@resumeai/db";
import { promptRepository } from "../repositories/prompt.repository";
import { aiUsageRepository } from "../repositories/ai-usage.repository";
import { env } from "../config/env";

async function loadPromptOverrides(): Promise<Partial<Record<AiClientFeature, PromptSpec>>> {
  const rows = await promptRepository.listActive();
  const overrides: Partial<Record<AiClientFeature, PromptSpec>> = {};
  for (const row of rows) {
    overrides[row.feature as AiClientFeature] = {
      systemPrompt: row.systemPrompt,
      userPromptTemplate: row.userPromptTemplate,
    };
  }
  return overrides;
}

/** Builds a request-scoped AI client: DB-managed prompts + usage logging to AiUsageLog. */
export async function createAiClientForUser(userId: string): Promise<AiClient> {
  const provider = createProviderFromEnv(env.AI_PROVIDER);
  const promptOverrides = await loadPromptOverrides();

  return new AiClient({
    provider,
    promptOverrides,
    onUsage: async (event) => {
      const costMicros = estimateCostMicros(event.model, event.usage);
      await aiUsageRepository.log({
        userId,
        feature: event.feature as DbAiFeature,
        provider: event.provider as DbAiProvider,
        model: event.model,
        promptTokens: event.usage.promptTokens,
        completionTokens: event.usage.completionTokens,
        costMicros,
        latencyMs: event.latencyMs,
        success: event.success,
        errorMessage: event.errorMessage,
      });
    },
  });
}
