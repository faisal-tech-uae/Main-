import { describe, expect, it, vi } from "vitest";
import { AiClient } from "../client";
import { renderTemplate } from "../template";
import type { AiProviderClient, CompletionRequest, CompletionResult } from "../types";

describe("renderTemplate", () => {
  it("substitutes variables and leaves missing ones blank", () => {
    const output = renderTemplate("Hello {{name}}, role: {{role}}", { name: "Ada" });
    expect(output).toBe("Hello Ada, role: ");
  });
});

function stubProvider(content: string): AiProviderClient {
  return {
    provider: "OPENAI",
    model: "gpt-4o",
    complete: vi.fn(async (_req: CompletionRequest): Promise<CompletionResult> => ({
      content,
      usage: { promptTokens: 10, completionTokens: 20 },
      model: "gpt-4o",
      latencyMs: 5,
    })),
  };
}

describe("AiClient", () => {
  it("parses JSON responses wrapped in markdown fences", async () => {
    const fenced = "```json\n" + JSON.stringify({
      executiveSummary: "Strong candidate.",
      strengths: ["Clear metrics"],
      weaknesses: [],
      atsProblems: [],
      formattingProblems: [],
      missingKeywords: [],
      actionPlan: [],
      priorityFixes: [],
      estimatedInterviewProbability: 80,
      estimatedRecruiterReadability: 85,
      estimatedAtsPassProbability: 90,
    }) + "\n```";

    const client = new AiClient({ provider: stubProvider(fenced) });
    const result = await client.analyzeResume({ resumeText: "some resume text" });
    expect(result.executiveSummary).toBe("Strong candidate.");
    expect(result.estimatedAtsPassProbability).toBe(90);
  });

  it("invokes onUsage with token counts on success", async () => {
    const onUsage = vi.fn();
    const client = new AiClient({
      provider: stubProvider(JSON.stringify({ rewritten: "Led X", actionVerbUsed: "Led", rationale: "Stronger verb" })),
      onUsage,
    });

    await client.rewriteBullet({ bulletText: "Was responsible for leading X" });
    expect(onUsage).toHaveBeenCalledWith(
      expect.objectContaining({ feature: "BULLET_REWRITE", success: true, usage: { promptTokens: 10, completionTokens: 20 } })
    );
  });
});
