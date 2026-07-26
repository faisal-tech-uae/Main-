import type { CompletionUsage } from "./types";

/**
 * Approximate list pricing in USD per 1M tokens, as of the model's release
 * generation. Update alongside provider pricing pages — this only powers
 * internal cost dashboards, not customer billing.
 */
const PRICING_PER_MILLION_TOKENS: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-opus-4-8": { input: 15, output: 75 },
  "claude-haiku-4-5": { input: 0.8, output: 4 },
  "gemini-1.5-pro": { input: 1.25, output: 5 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
};

const DEFAULT_PRICING = { input: 2, output: 8 };

export function estimateCostMicros(model: string, usage: CompletionUsage): number {
  const pricing = PRICING_PER_MILLION_TOKENS[model] ?? DEFAULT_PRICING;
  const dollars = (usage.promptTokens * pricing.input + usage.completionTokens * pricing.output) / 1_000_000;
  return Math.round(dollars * 1_000_000); // to millionths of a dollar
}
