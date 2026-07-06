import { z } from "zod";

// Every entry that represents a time range uses this shape. `current: true`
// means "present" and `endDate` should be omitted.
const dateRangeSchema = z.object({
  startDate: z.string().min(1, "Start date is required"), // ISO "YYYY-MM" or "YYYY-MM-DD"
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().optional(),
  country: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  jobTitle: z.string().optional(),
});

export const summarySchema = z.object({
  content: z.string().max(1000),
});

export const experienceEntrySchema = z.object({
  id: z.string(),
  jobTitle: z.string().min(1),
  employer: z.string().min(1),
  location: z.string().optional(),
  ...dateRangeSchema.shape,
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

export const projectEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  ...dateRangeSchema.shape,
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

export const educationEntrySchema = z.object({
  id: z.string(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  ...dateRangeSchema.shape,
  gpa: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const certificationEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal("")),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  category: z.string().min(1), // e.g. "Programming Languages"
  items: z.array(z.string()).default([]),
});

export const languageEntrySchema = z.object({
  id: z.string(),
  language: z.string().min(1),
  proficiency: z.enum(["Elementary", "Limited Working", "Professional Working", "Full Professional", "Native/Bilingual"]),
});

export const awardEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const volunteerEntrySchema = z.object({
  id: z.string(),
  organization: z.string().min(1),
  role: z.string().optional(),
  ...dateRangeSchema.shape,
  bullets: z.array(z.string()).default([]),
});

export const referenceEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  title: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

export const publicationEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  publisher: z.string().optional(),
  date: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const patentEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  patentNumber: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(["Filed", "Pending", "Granted"]).optional(),
  description: z.string().optional(),
});

export const researchEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  institution: z.string().optional(),
  ...dateRangeSchema.shape,
  description: z.string().optional(),
});

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  items: z.array(
    z.object({
      id: z.string(),
      heading: z.string().optional(),
      subheading: z.string().optional(),
      date: z.string().optional(),
      bullets: z.array(z.string()).default([]),
    })
  ),
});

export const SECTION_TYPES = [
  "summary",
  "experience",
  "projects",
  "education",
  "certifications",
  "skills",
  "languages",
  "awards",
  "volunteer",
  "references",
  "publications",
  "patents",
  "research",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const resumeDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  personalInfo: personalInfoSchema,
  summary: summarySchema.optional(),
  experience: z.array(experienceEntrySchema).default([]),
  projects: z.array(projectEntrySchema).default([]),
  education: z.array(educationEntrySchema).default([]),
  certifications: z.array(certificationEntrySchema).default([]),
  skills: z.array(skillCategorySchema).default([]),
  languages: z.array(languageEntrySchema).default([]),
  awards: z.array(awardEntrySchema).default([]),
  volunteer: z.array(volunteerEntrySchema).default([]),
  references: z.array(referenceEntrySchema).default([]),
  publications: z.array(publicationEntrySchema).default([]),
  patents: z.array(patentEntrySchema).default([]),
  research: z.array(researchEntrySchema).default([]),
  customSections: z.array(customSectionSchema).default([]),
  // Controls which sections render and in what order; entries not listed
  // fall back to a sensible default order.
  sectionOrder: z.array(z.string()).default([...SECTION_TYPES]),
});

export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
export type SkillCategory = z.infer<typeof skillCategorySchema>;
export type LanguageEntry = z.infer<typeof languageEntrySchema>;
export type AwardEntry = z.infer<typeof awardEntrySchema>;
export type VolunteerEntry = z.infer<typeof volunteerEntrySchema>;
export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;
export type PublicationEntry = z.infer<typeof publicationEntrySchema>;
export type PatentEntry = z.infer<typeof patentEntrySchema>;
export type ResearchEntry = z.infer<typeof researchEntrySchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;

export function createEmptyResumeDocument(fullName = "", email = ""): ResumeDocument {
  return {
    schemaVersion: 1,
    personalInfo: { fullName, email, phone: "" },
    summary: { content: "" },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    skills: [],
    languages: [],
    awards: [],
    volunteer: [],
    references: [],
    publications: [],
    patents: [],
    research: [],
    customSections: [],
    sectionOrder: [...SECTION_TYPES],
  };
}
