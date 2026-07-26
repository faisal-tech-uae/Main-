import type { AiProviderClient, AiProviderName } from "../types";
import { OpenAiProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { GeminiProvider } from "./gemini-provider";

export interface AiProviderConfig {
  provider: AiProviderName;
  apiKey: string;
  model?: string;
}

export function createProvider(config: AiProviderConfig): AiProviderClient {
  switch (config.provider) {
    case "OPENAI":
      return new OpenAiProvider(config.apiKey, config.model);
    case "ANTHROPIC":
      return new AnthropicProvider(config.apiKey, config.model);
    case "GEMINI":
      return new GeminiProvider(config.apiKey, config.model);
    default: {
      const exhaustive: never = config.provider;
      throw new Error(`Unsupported AI provider: ${exhaustive}`);
    }
  }
}

/** Builds a provider from environment variables, preferring OpenAI, then Anthropic, then Gemini. */
export function createProviderFromEnv(preferred?: AiProviderName): AiProviderClient {
  const order: AiProviderName[] = preferred
    ? [preferred, "OPENAI", "ANTHROPIC", "GEMINI"]
    : ["OPENAI", "ANTHROPIC", "GEMINI"];

  const seen = new Set<AiProviderName>();
  for (const provider of order) {
    if (seen.has(provider)) continue;
    seen.add(provider);

    const apiKey = readApiKey(provider);
    if (apiKey) {
      return createProvider({ provider, apiKey, model: readModel(provider) });
    }
  }

  throw new Error(
    "No AI provider API key configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY."
  );
}

function readApiKey(provider: AiProviderName): string | undefined {
  switch (provider) {
    case "OPENAI":
      return process.env.OPENAI_API_KEY;
    case "ANTHROPIC":
      return process.env.ANTHROPIC_API_KEY;
    case "GEMINI":
      return process.env.GEMINI_API_KEY;
  }
}

function readModel(provider: AiProviderName): string | undefined {
  switch (provider) {
    case "OPENAI":
      return process.env.OPENAI_MODEL;
    case "ANTHROPIC":
      return process.env.ANTHROPIC_MODEL;
    case "GEMINI":
      return process.env.GEMINI_MODEL;
  }
}
