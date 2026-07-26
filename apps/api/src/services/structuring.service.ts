import { randomUUID } from "node:crypto";
import { matchDiscipline, resumeDocumentSchema, type ResumeDocument } from "@resumeai/shared";
import type { ResumeStructuringResult } from "@resumeai/ai";
import { uploadedResumeRepository } from "../repositories/uploaded-resume.repository";
import { resumeRepository } from "../repositories/resume.repository";
import { createAiClientForUser } from "../lib/ai";
import { resolveDisciplineGlossary } from "../lib/discipline";
import { ApiError } from "../lib/errors";

/** Adds a fresh id to every entry of a structuring-result array, matching the builder's own entry shape. */
function withIds<T extends object>(entries: T[]): (T & { id: string })[] {
  return entries.map((entry) => ({ ...entry, id: randomUUID() }));
}

export function toResumeDocument(result: ResumeStructuringResult): ResumeDocument {
  // Intentionally untyped: this is fed straight into resumeDocumentSchema.parse()
  // below, which fills in fields the AI extraction doesn't produce (technologies,
  // highlights, etc.) via the schema's own defaults.
  const doc = {
    schemaVersion: 1,
    personalInfo: {
      fullName: result.personalInfo.fullName,
      email: result.personalInfo.email,
      phone: result.personalInfo.phone,
      location: result.personalInfo.location,
      linkedinUrl: result.personalInfo.linkedinUrl,
      githubUrl: result.personalInfo.githubUrl,
      portfolioUrl: result.personalInfo.portfolioUrl,
      jobTitle: result.personalInfo.jobTitle,
    },
    summary: { content: result.summary ?? "" },
    experience: withIds(result.experience),
    projects: withIds(result.projects),
    education: withIds(result.education),
    certifications: withIds(result.certifications),
    skills: withIds(result.skills),
    languages: withIds(
      result.languages.map((l) => ({
        language: l.language,
        proficiency: isValidProficiency(l.proficiency) ? l.proficiency : "Professional Working",
      }))
    ),
    awards: withIds(result.awards),
    volunteer: withIds(result.volunteer),
    references: [],
    publications: [],
    patents: [],
    research: [],
    customSections: [],
    sectionOrder: [
      "summary",
      "experience",
      "projects",
      "education",
      "certifications",
      "skills",
      "languages",
      "awards",
      "volunteer",
    ],
  };

  return resumeDocumentSchema.parse(doc);
}

const VALID_PROFICIENCIES = ["Elementary", "Limited Working", "Professional Working", "Full Professional", "Native/Bilingual"];
function isValidProficiency(value: string): value is (typeof VALID_PROFICIENCIES)[number] {
  return VALID_PROFICIENCIES.includes(value);
}

/**
 * Converts an already-uploaded, already-parsed CV (raw text extracted by
 * parser.service.ts) into a brand-new, fully editable Resume — the "upload
 * your old CV" entry point into the builder. Ties the upload flow to the
 * rest of the product: once this returns, the result is a normal Resume the
 * user can edit, re-scan, rewrite, and export like any other.
 */
export async function structureUploadedResume(userId: string, uploadedResumeId: string, targetDisciplineOverride?: string) {
  const uploaded = await uploadedResumeRepository.findById(uploadedResumeId, userId);
  if (!uploaded) throw ApiError.notFound("Uploaded resume not found");
  if (!uploaded.rawText?.trim()) throw ApiError.badRequest("Couldn't extract any text from this file");

  const aiClient = await createAiClientForUser(userId);
  const disciplineGlossary = resolveDisciplineGlossary({ targetDiscipline: targetDisciplineOverride });

  const structured = await aiClient.structureResume({ resumeText: uploaded.rawText, disciplineGlossary });
  const document = toResumeDocument(structured);

  const detectedDisciplineId = targetDisciplineOverride ?? matchDiscipline(structured.detectedDiscipline ?? "")?.id;

  const resume = await resumeRepository.create(
    userId,
    {
      title: `Imported from ${uploaded.fileName}`,
      targetDiscipline: detectedDisciplineId,
      targetJobRole: structured.detectedDiscipline || document.personalInfo.jobTitle,
      targetCountry: "United Arab Emirates",
    },
    document
  );

  return { resume, detectedDiscipline: structured.detectedDiscipline };
}
