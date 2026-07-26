import { describe, expect, it } from "vitest";
import { createEmptyResumeDocument, resumeDocumentSchema } from "../schemas/resume";
import { createResumeSchema, scanRequestSchema } from "../schemas/dto";

describe("resumeDocumentSchema", () => {
  it("accepts a freshly created empty document", () => {
    const doc = createEmptyResumeDocument("Jane Doe", "jane@example.com");
    expect(() => resumeDocumentSchema.parse(doc)).not.toThrow();
  });

  it("rejects an invalid email in personalInfo", () => {
    const doc = createEmptyResumeDocument("Jane Doe", "not-an-email");
    expect(() => resumeDocumentSchema.parse(doc)).toThrow();
  });

  it("allows an in-progress draft with an empty name (autosave-friendly)", () => {
    const doc = createEmptyResumeDocument("", "");
    const result = resumeDocumentSchema.safeParse(doc);
    expect(result.success).toBe(true);
  });
});

describe("createResumeSchema", () => {
  it("defaults the title when omitted", () => {
    const parsed = createResumeSchema.parse({});
    expect(parsed.title).toBe("Untitled Resume");
  });
});

describe("scanRequestSchema", () => {
  it("defaults targetPlatform to GENERIC", () => {
    const parsed = scanRequestSchema.parse({ resumeId: "abc" });
    expect(parsed.targetPlatform).toBe("GENERIC");
  });

  it("rejects an unknown platform", () => {
    expect(() => scanRequestSchema.parse({ resumeId: "abc", targetPlatform: "NOT_REAL" })).toThrow();
  });
});
