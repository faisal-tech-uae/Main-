import type { AtsPlatform, PlatformSimulationNote, RuleFinding } from "./types";

/**
 * Sensitivity multipliers per platform, per finding category.
 *
 * These are heuristic weights derived from widely published ATS
 * parsing-best-practice guidance (recruiter/ATS vendor documentation and
 * industry parsing studies) about which platforms are more/less tolerant of
 * tables, columns, graphics, headers/footers, and non-standard formatting.
 * They are NOT reverse-engineered from proprietary vendor source and should
 * be read as an informed simulation, not a guarantee of how a specific
 * live tenant is configured (every employer configures parsing/scoring
 * differently on top of the base platform).
 */
const PLATFORM_SENSITIVITY: Record<AtsPlatform, Record<RuleFinding["category"], number>> = {
  GREENHOUSE: { formatting: 0.7, contact: 1.0, content: 0.8, structure: 0.9, keywords: 1.0 },
  LEVER: { formatting: 0.7, contact: 1.0, content: 0.8, structure: 0.9, keywords: 1.0 },
  WORKDAY: { formatting: 1.4, contact: 1.1, content: 0.9, structure: 1.2, keywords: 1.1 },
  ORACLE_TALEO: { formatting: 1.5, contact: 1.2, content: 0.9, structure: 1.3, keywords: 1.0 },
  SAP_SUCCESSFACTORS: { formatting: 1.3, contact: 1.1, content: 0.9, structure: 1.2, keywords: 1.0 },
  ICIMS: { formatting: 1.2, contact: 1.0, content: 0.9, structure: 1.1, keywords: 1.0 },
  SMARTRECRUITERS: { formatting: 0.8, contact: 1.0, content: 0.8, structure: 0.9, keywords: 1.0 },
  JAZZHR: { formatting: 1.0, contact: 1.0, content: 0.9, structure: 1.0, keywords: 1.0 },
  BAMBOOHR: { formatting: 0.9, contact: 1.0, content: 0.9, structure: 1.0, keywords: 0.9 },
  UKG: { formatting: 1.2, contact: 1.0, content: 0.9, structure: 1.1, keywords: 1.0 },
  DAYFORCE: { formatting: 1.2, contact: 1.0, content: 0.9, structure: 1.1, keywords: 1.0 },
  GENERIC: { formatting: 1.0, contact: 1.0, content: 1.0, structure: 1.0, keywords: 1.0 },
};

const PLATFORM_NOTES: Record<AtsPlatform, string> = {
  GREENHOUSE: "Greenhouse uses a modern parser with comparatively strong resilience to minor formatting issues, but still fails on tables and embedded text boxes.",
  LEVER: "Lever's parser is similarly modern to Greenhouse; single-column, standard-heading resumes parse near-perfectly.",
  WORKDAY: "Workday is notoriously strict — multi-column layouts and tables frequently cause section misattribution or field truncation.",
  ORACLE_TALEO: "Oracle Taleo is one of the least forgiving legacy platforms; graphics, columns, and non-standard headings often cause significant data loss.",
  SAP_SUCCESSFACTORS: "SAP SuccessFactors' parser struggles with complex layouts and can misfile experience entries when tables are used.",
  ICIMS: "iCIMS handles standard formats well but frequently drops content placed in headers/footers or inside graphics.",
  SMARTRECRUITERS: "SmartRecruiters uses a contemporary parsing engine, generally tolerant of minor formatting deviations.",
  JAZZHR: "JazzHR parses cleanly for standard single-column resumes; heavier formatting introduces moderate risk.",
  BAMBOOHR: "BambooHR is commonly used by SMBs and is relatively forgiving, though tables can still misalign fields.",
  UKG: "UKG (Ultimate Kronos Group) systems can mis-parse dates and section order when non-standard headings are used.",
  DAYFORCE: "Dayforce is sensitive to non-standard section headings and complex layouts, similar to other enterprise HRIS-linked ATS.",
  GENERIC: "Generic baseline profile representing an average ATS parser across the market.",
};

export function simulatePlatform(platform: AtsPlatform, findings: RuleFinding[]): PlatformSimulationNote {
  const weights = PLATFORM_SENSITIVITY[platform];
  const deductions = findings
    .filter((f) => f.pointsDeducted > 0)
    .map((f) => ({
      reason: f.message,
      points: Math.round(f.pointsDeducted * weights[f.category]),
      relatedFindingId: f.id,
    }))
    .filter((d) => d.points > 0)
    .sort((a, b) => b.points - a.points);

  const totalDeducted = deductions.reduce((sum, d) => sum + d.points, 0);
  const parseConfidence = Math.max(0, Math.min(100, 100 - totalDeducted));

  return {
    platform,
    parseConfidence,
    deductions,
    summary: PLATFORM_NOTES[platform],
  };
}

export function simulateAllPlatforms(findings: RuleFinding[]): PlatformSimulationNote[] {
  return (Object.keys(PLATFORM_SENSITIVITY) as AtsPlatform[]).map((p) => simulatePlatform(p, findings));
}
