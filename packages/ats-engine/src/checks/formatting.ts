import type { ParsedResumeStructure, RuleFinding } from "../types";

export function runFormattingChecks(structure: ParsedResumeStructure): RuleFinding[] {
  const findings: RuleFinding[] = [];

  if (structure.hasTables) {
    findings.push({
      id: "fmt-tables",
      category: "formatting",
      severity: "critical",
      message: "Resume uses tables. Many ATS parsers read table cells out of order or skip them entirely.",
      pointsDeducted: 15,
    });
  }

  if (structure.hasMultipleColumns) {
    findings.push({
      id: "fmt-columns",
      category: "formatting",
      severity: "critical",
      message: "Multi-column layout detected. Column text is frequently interleaved incorrectly during ATS parsing.",
      pointsDeducted: 15,
    });
  }

  if (structure.hasImages) {
    findings.push({
      id: "fmt-images",
      category: "formatting",
      severity: "warning",
      message: "Images or graphics detected. Any text inside images is invisible to ATS parsers.",
      pointsDeducted: 8,
    });
  }

  if (structure.hasTextBoxes) {
    findings.push({
      id: "fmt-textboxes",
      category: "formatting",
      severity: "critical",
      message: "Text boxes detected. Content inside text boxes is commonly dropped entirely by ATS parsers.",
      pointsDeducted: 12,
    });
  }

  if (structure.hasHeaderContent) {
    findings.push({
      id: "fmt-header",
      category: "formatting",
      severity: "warning",
      message: "Contact or content placed in the document header. Headers are ignored by several ATS platforms.",
      pointsDeducted: 8,
    });
  }

  if (structure.hasFooterContent) {
    findings.push({
      id: "fmt-footer",
      category: "formatting",
      severity: "warning",
      message: "Content placed in the document footer. Footers are ignored by several ATS platforms.",
      pointsDeducted: 6,
    });
  }

  const nonStandardFonts = structure.detectedFonts.filter((f) => !STANDARD_FONTS.has(normalizeFont(f)));
  if (nonStandardFonts.length > 0) {
    findings.push({
      id: "fmt-fonts",
      category: "formatting",
      severity: "info",
      message: `Non-standard font(s) detected: ${nonStandardFonts.join(", ")}. Stick to widely supported fonts (Arial, Calibri, Georgia, Times New Roman, Helvetica) for maximum compatibility.`,
      pointsDeducted: 4,
    });
  }

  if (structure.unsupportedCharacterCount > 0) {
    findings.push({
      id: "fmt-unsupported-chars",
      category: "formatting",
      severity: "warning",
      message: `${structure.unsupportedCharacterCount} unsupported/special character(s) found (e.g. decorative bullets, emoji, ligatures). These can render as garbage characters or "?" in ATS systems.`,
      pointsDeducted: Math.min(10, structure.unsupportedCharacterCount * 2),
    });
  }

  if (structure.pageCount > 2) {
    findings.push({
      id: "fmt-length",
      category: "formatting",
      severity: "warning",
      message: `Resume is ${structure.pageCount} pages. Most ATS/recruiter workflows favor 1 page (early career) or 2 pages (10+ years experience).`,
      pointsDeducted: 6,
    });
  }

  return findings;
}

const STANDARD_FONTS = new Set(
  [
    "arial", "calibri", "georgia", "times new roman", "helvetica", "verdana",
    "garamond", "cambria", "tahoma", "trebuchet ms", "inter", "roboto", "sourcesanspro",
  ].map(normalizeFont)
);

function normalizeFont(font: string): string {
  return font.toLowerCase().replace(/[^a-z]/g, "");
}
