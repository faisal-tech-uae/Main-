import type { ParsedResumeStructure, RuleFinding } from "../types";
import { CANONICAL_SECTION_HEADINGS } from "../wordlists";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Accepts common international formats: +971 50 123 4567, (415) 555-0132, 415-555-0132, etc.
const PHONE_REGEX = /^\+?\d{1,3}?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/;
const LINKEDIN_REGEX = /linkedin\.com\/(in|pub)\/[a-zA-Z0-9-_%]+/i;

export function runContactChecks(structure: ParsedResumeStructure): RuleFinding[] {
  const findings: RuleFinding[] = [];
  const { emails, phones, linkedinUrls } = structure.contact;

  if (emails.length === 0) {
    findings.push({
      id: "contact-email-missing",
      category: "contact",
      severity: "critical",
      message: "No email address detected. This is a hard requirement for ATS contact extraction.",
      pointsDeducted: 20,
    });
  } else if (!emails.some((e) => EMAIL_REGEX.test(e.trim()))) {
    findings.push({
      id: "contact-email-invalid",
      category: "contact",
      severity: "critical",
      message: `Email address "${emails[0]}" does not look valid.`,
      pointsDeducted: 15,
    });
  }

  if (phones.length === 0) {
    findings.push({
      id: "contact-phone-missing",
      category: "contact",
      severity: "warning",
      message: "No phone number detected.",
      pointsDeducted: 10,
    });
  } else if (!phones.some((p) => PHONE_REGEX.test(p.trim()))) {
    findings.push({
      id: "contact-phone-invalid",
      category: "contact",
      severity: "warning",
      message: `Phone number "${phones[0]}" does not match a standard format.`,
      pointsDeducted: 6,
    });
  }

  if (linkedinUrls.length === 0) {
    findings.push({
      id: "contact-linkedin-missing",
      category: "contact",
      severity: "info",
      message: "No LinkedIn URL detected. Adding one improves recruiter cross-referencing.",
      pointsDeducted: 4,
    });
  } else if (!linkedinUrls.some((u) => LINKEDIN_REGEX.test(u))) {
    findings.push({
      id: "contact-linkedin-invalid",
      category: "contact",
      severity: "info",
      message: `LinkedIn URL "${linkedinUrls[0]}" doesn't match the expected linkedin.com/in/... format.`,
      pointsDeducted: 3,
    });
  }

  return findings;
}

export function detectMissingSections(structure: ParsedResumeStructure, requiredSections: string[]): RuleFinding[] {
  const findings: RuleFinding[] = [];
  const detected = new Set(structure.detectedSections.map((s) => s.toLowerCase()));

  for (const section of requiredSections) {
    const aliases = CANONICAL_SECTION_HEADINGS[section] ?? [section];
    const present = aliases.some((alias) => detected.has(alias));
    if (!present) {
      findings.push({
        id: `structure-missing-${section}`,
        category: "structure",
        severity: section === "experience" || section === "education" ? "critical" : "warning",
        message: `Missing or unrecognized "${section}" section. Use a standard heading so ATS parsers can extract it.`,
        pointsDeducted: section === "experience" || section === "education" ? 12 : 6,
      });
    }
  }

  return findings;
}
