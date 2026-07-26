import type { ResumeDocument } from "@resumeai/shared";
import type { ParsedResumeStructure } from "@resumeai/ats-engine";

export interface TemplateLayoutConfig {
  columns?: number;
  font?: string;
}

/** Converts a builder-authored ResumeDocument into the same structural contract the file parser produces. */
export function resumeDocumentToStructure(doc: ResumeDocument, layout?: TemplateLayoutConfig): ParsedResumeStructure {
  const detectedSections: string[] = [];
  if (doc.summary?.content) detectedSections.push("summary");
  if (doc.experience.length) detectedSections.push("experience");
  if (doc.projects.length) detectedSections.push("projects");
  if (doc.education.length) detectedSections.push("education");
  if (doc.certifications.length) detectedSections.push("certifications");
  if (doc.skills.length) detectedSections.push("skills");
  if (doc.languages.length) detectedSections.push("languages");
  if (doc.awards.length) detectedSections.push("awards");
  if (doc.volunteer.length) detectedSections.push("volunteer");
  if (doc.references.length) detectedSections.push("references");
  if (doc.publications.length) detectedSections.push("publications");
  if (doc.patents.length) detectedSections.push("patents");
  if (doc.research.length) detectedSections.push("research");

  return {
    rawText: serializeToPlainText(doc),
    sourceType: "BUILDER",
    pageCount: estimatePages(doc),
    detectedFonts: layout?.font ? [layout.font] : ["Inter"],
    hasTables: false,
    hasMultipleColumns: (layout?.columns ?? 1) > 1,
    hasImages: false,
    hasHeaderContent: false,
    hasFooterContent: false,
    hasTextBoxes: false,
    unsupportedCharacterCount: 0,
    detectedSections,
    contact: {
      emails: doc.personalInfo.email ? [doc.personalInfo.email] : [],
      phones: doc.personalInfo.phone ? [doc.personalInfo.phone] : [],
      linkedinUrls: doc.personalInfo.linkedinUrl ? [doc.personalInfo.linkedinUrl] : [],
    },
  };
}

export function collectExperienceBullets(doc: ResumeDocument): string[] {
  return doc.experience.flatMap((e) => e.bullets);
}

export function collectProjectBullets(doc: ResumeDocument): string[] {
  return doc.projects.flatMap((p) => p.bullets);
}

export function collectVolunteerBullets(doc: ResumeDocument): string[] {
  return doc.volunteer.flatMap((v) => v.bullets);
}

export function collectSkillItems(doc: ResumeDocument): string[] {
  return doc.skills.flatMap((s) => s.items);
}

export function collectDateStrings(doc: ResumeDocument): string[] {
  return [
    ...doc.experience.map((e) => e.startDate),
    ...doc.education.map((e) => e.startDate),
    ...doc.projects.map((p) => p.startDate),
  ].filter(Boolean);
}

function serializeToPlainText(doc: ResumeDocument): string {
  const parts: string[] = [doc.personalInfo.fullName, doc.summary?.content ?? ""];

  for (const exp of doc.experience) {
    parts.push(`${exp.jobTitle} at ${exp.employer}`, ...exp.bullets);
  }
  for (const proj of doc.projects) {
    parts.push(proj.name, ...proj.bullets);
  }
  for (const edu of doc.education) {
    parts.push(`${edu.degree} ${edu.fieldOfStudy ?? ""} ${edu.institution}`);
  }
  for (const skillGroup of doc.skills) {
    parts.push(skillGroup.category, skillGroup.items.join(", "));
  }
  for (const cert of doc.certifications) {
    parts.push(cert.name);
  }

  return parts.filter(Boolean).join("\n");
}

function estimatePages(doc: ResumeDocument): number {
  const wordCount = serializeToPlainText(doc).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 500));
}
