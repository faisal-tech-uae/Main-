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

  it("structures an uploaded resume, defaulting fields the model omits", async () => {
    const client = new AiClient({
      provider: stubProvider(
        JSON.stringify({
          personalInfo: { fullName: "Ahmed Al Marri", email: "ahmed@example.com", phone: "+971 50 123 4567" },
          experience: [{ jobTitle: "HVAC Site Engineer", employer: "Acme MEP Contracting LLC", startDate: "2020-01", current: true, bullets: ["Supervised chiller plant installation"] }],
          detectedDiscipline: "HVAC Engineer",
          // education/skills/etc. intentionally omitted to exercise defaults
        })
      ),
    });

    const result = await client.structureResume({ resumeText: "raw cv text" });
    expect(result.personalInfo.fullName).toBe("Ahmed Al Marri");
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].employer).toBe("Acme MEP Contracting LLC");
    expect(result.education).toEqual([]);
    expect(result.skills).toEqual([]);
    expect(result.detectedDiscipline).toBe("HVAC Engineer");
  });
});
