import { describe, expect, it } from "vitest";
import { resumeDocumentSchema } from "@resumeai/shared";
import type { ResumeStructuringResult } from "@resumeai/ai";
import { toResumeDocument } from "../structuring.service";

function baseResult(overrides: Partial<ResumeStructuringResult> = {}): ResumeStructuringResult {
  return {
    personalInfo: { fullName: "Ahmed Al Marri", email: "ahmed@example.com", phone: "+971 50 123 4567" },
    summary: "HVAC engineer with 6 years of UAE experience.",
    experience: [
      {
        jobTitle: "HVAC Site Engineer",
        employer: "Acme MEP Contracting LLC",
        startDate: "2020-01",
        current: true,
        bullets: ["Supervised chiller plant installation for a 40-story tower in Dubai"],
      },
    ],
    projects: [],
    education: [{ institution: "American University of Sharjah", degree: "B.Sc. Mechanical Engineering", startDate: "2014-09", endDate: "2018-06", current: false }],
    certifications: [],
    skills: [{ category: "HVAC Systems", items: ["Chillers", "AHU", "VRF"] }],
    languages: [{ language: "English", proficiency: "Full Professional" }],
    awards: [],
    volunteer: [],
    detectedDiscipline: "HVAC Engineer",
    ...overrides,
  };
}

describe("toResumeDocument", () => {
  it("produces a schema-valid ResumeDocument with generated ids", () => {
    const doc = toResumeDocument(baseResult());
    expect(() => resumeDocumentSchema.parse(doc)).not.toThrow();
    expect(doc.experience[0].id).toBeTruthy();
    expect(doc.experience[0].employer).toBe("Acme MEP Contracting LLC");
    expect(doc.education[0].id).toBeTruthy();
  });

  it("falls back to a valid proficiency when the model returns something unrecognized", () => {
    const doc = toResumeDocument(baseResult({ languages: [{ language: "Arabic", proficiency: "very good" as never }] }));
    expect(doc.languages[0].proficiency).toBe("Professional Working");
  });

  it("defaults technologies/highlights arrays the AI extraction doesn't produce", () => {
    const doc = toResumeDocument(baseResult());
    expect(doc.experience[0].technologies).toEqual([]);
    expect(doc.education[0].highlights).toEqual([]);
  });

  it("handles a resume with every optional section omitted", () => {
    const doc = toResumeDocument(
      baseResult({ experience: [], education: [], skills: [], languages: [], awards: [], volunteer: [], summary: undefined })
    );
    expect(doc.summary?.content).toBe("");
    expect(doc.experience).toEqual([]);
    expect(() => resumeDocumentSchema.parse(doc)).not.toThrow();
  });
});
