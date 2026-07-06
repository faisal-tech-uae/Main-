/**
 * ParsedResumeStructure is the common contract between the file parser
 * (apps/api, using pdf.js / mammoth) and this rule engine. It captures both
 * the extracted text and structural signals the parser can detect from the
 * original file (fonts, tables, columns, images) that plain text cannot
 * carry on its own.
 */
export interface ParsedResumeStructure {
  rawText: string;
  sourceType: "PDF" | "DOCX" | "TXT" | "BUILDER";
  pageCount: number;
  detectedFonts: string[];
  hasTables: boolean;
  hasMultipleColumns: boolean;
  hasImages: boolean;
  hasHeaderContent: boolean;
  hasFooterContent: boolean;
  hasTextBoxes: boolean;
  unsupportedCharacterCount: number;
  detectedSections: string[]; // section headings found, normalized (e.g. "experience")
  contact: {
    emails: string[];
    phones: string[];
    linkedinUrls: string[];
  };
}

export interface RuleFinding {
  id: string;
  category: "formatting" | "contact" | "content" | "structure" | "keywords";
  severity: "critical" | "warning" | "info";
  message: string;
  pointsDeducted: number;
}

export interface KeywordMatchResult {
  matched: string[];
  missing: string[];
  matchPercent: number;
}

export interface CategoryScores {
  formattingScore: number;
  keywordScore: number;
  experienceScore: number;
  educationScore: number;
  skillsScore: number;
  grammarScore: number;
  atsCompatibilityScore: number;
  recruiterReadabilityScore: number;
}

export interface HybridScores extends CategoryScores {
  overallScore: number;
  atsPassScore: number;
  recruiterAppealScore: number;
  roleMatchScore: number;
}

export type AtsPlatform =
  | "GREENHOUSE"
  | "LEVER"
  | "WORKDAY"
  | "ORACLE_TALEO"
  | "SAP_SUCCESSFACTORS"
  | "ICIMS"
  | "SMARTRECRUITERS"
  | "JAZZHR"
  | "BAMBOOHR"
  | "UKG"
  | "DAYFORCE"
  | "GENERIC";

export interface PlatformSimulationNote {
  platform: AtsPlatform;
  parseConfidence: number; // 0-100, estimated probability the platform parses this cleanly
  deductions: Array<{ reason: string; points: number; relatedFindingId?: string }>;
  summary: string;
}
