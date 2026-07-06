import { describe, expect, it } from "vitest";
import { analyzeResume } from "../analyze";
import type { ParsedResumeStructure } from "../types";

function baseStructure(overrides: Partial<ParsedResumeStructure> = {}): ParsedResumeStructure {
  return {
    rawText:
      "John Doe. Software Engineer with 5 years of experience building scalable APIs. " +
      "Increased throughput by 40% and reduced latency by 25% at Acme Corp. " +
      "Led a team of 4 engineers to deliver a payments platform serving 2M users.",
    sourceType: "TXT",
    pageCount: 1,
    detectedFonts: ["Inter"],
    hasTables: false,
    hasMultipleColumns: false,
    hasImages: false,
    hasHeaderContent: false,
    hasFooterContent: false,
    hasTextBoxes: false,
    unsupportedCharacterCount: 0,
    detectedSections: ["summary", "experience", "education", "skills"],
    contact: {
      emails: ["john.doe@example.com"],
      phones: ["+1 415-555-0132"],
      linkedinUrls: ["linkedin.com/in/johndoe"],
    },
    ...overrides,
  };
}

describe("analyzeResume", () => {
  it("scores a clean, well-formatted resume highly", () => {
    const result = analyzeResume({
      structure: baseStructure(),
      bulletsBySection: {
        experience: [
          "Increased API throughput by 40% by redesigning the caching layer",
          "Led a team of 4 engineers to deliver a payments platform serving 2M users",
        ],
      },
      skillItems: ["TypeScript", "Node.js", "PostgreSQL"],
    });

    expect(result.scores.overallScore).toBeGreaterThan(70);
    expect(result.findings.filter((f) => f.severity === "critical")).toHaveLength(0);
  });

  it("penalizes tables, columns, images, and missing contact info", () => {
    const result = analyzeResume({
      structure: baseStructure({
        hasTables: true,
        hasMultipleColumns: true,
        hasImages: true,
        contact: { emails: [], phones: [], linkedinUrls: [] },
        detectedSections: ["summary"],
      }),
    });

    const findingIds = result.findings.map((f) => f.id);
    expect(findingIds).toContain("fmt-tables");
    expect(findingIds).toContain("fmt-columns");
    expect(findingIds).toContain("fmt-images");
    expect(findingIds).toContain("contact-email-missing");
    expect(result.scores.atsPassScore).toBeLessThan(60);
  });

  it("flags weak verbs and missing quantification in bullets", () => {
    const result = analyzeResume({
      structure: baseStructure(),
      bulletsBySection: {
        experience: [
          "Responsible for managing the sales team",
          "Helped with onboarding new employees",
          "Worked on various projects across departments",
        ],
      },
    });

    const findingIds = result.findings.map((f) => f.id);
    expect(findingIds).toContain("experience-content-weak-verbs");
    expect(findingIds).toContain("experience-content-no-metrics");
  });

  it("computes keyword match against a job description", () => {
    const result = analyzeResume({
      structure: baseStructure(),
      jobDescriptionText:
        "We are looking for a Software Engineer with experience in TypeScript, Node.js, PostgreSQL, and Kubernetes.",
    });

    expect(result.keywordMatch).not.toBeNull();
    expect(result.keywordMatch!.matched.length).toBeGreaterThan(0);
    expect(result.scores.roleMatchScore).toBeGreaterThanOrEqual(0);
  });

  it("simulates stricter platforms deducting more for tables/columns", () => {
    const result = analyzeResume({
      structure: baseStructure({ hasTables: true, hasMultipleColumns: true }),
      targetPlatform: "ORACLE_TALEO",
    });

    const taleo = result.platformSimulations.find((p) => p.platform === "ORACLE_TALEO")!;
    const greenhouse = result.platformSimulations.find((p) => p.platform === "GREENHOUSE")!;
    expect(taleo.parseConfidence).toBeLessThan(greenhouse.parseConfidence);
  });
});
