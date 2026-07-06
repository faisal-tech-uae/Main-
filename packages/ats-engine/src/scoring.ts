import type { CategoryScores, HybridScores, KeywordMatchResult, RuleFinding } from "./types";

function scoreFromFindings(findings: RuleFinding[], predicate: (f: RuleFinding) => boolean): number {
  const total = findings.filter(predicate).reduce((sum, f) => sum + f.pointsDeducted, 0);
  return Math.max(0, Math.min(100, 100 - total));
}

export interface ScoringInput {
  allFindings: RuleFinding[];
  keywordMatch: KeywordMatchResult | null;
  readabilityScore: number; // 0-100, from fleschReadingEase
  hasExperienceSection: boolean;
  hasEducationSection: boolean;
  hasSkillsSection: boolean;
  avgPlatformParseConfidence: number; // 0-100, average across simulated platforms
}

export function computeCategoryScores(input: ScoringInput): CategoryScores {
  const { allFindings, keywordMatch, readabilityScore } = input;

  const formattingScore = scoreFromFindings(allFindings, (f) => f.category === "formatting");

  const keywordScore = keywordMatch ? keywordMatch.matchPercent : 100;

  const experienceScore = input.hasExperienceSection
    ? scoreFromFindings(allFindings, (f) => f.id.startsWith("experience-") || f.id === "structure-missing-experience")
    : 40;

  const educationScore = input.hasEducationSection
    ? scoreFromFindings(allFindings, (f) => f.id.startsWith("education-") || f.id === "structure-missing-education")
    : 50;

  const skillsScore = input.hasSkillsSection
    ? scoreFromFindings(allFindings, (f) => f.id.startsWith("skills-") || f.id === "content-duplicate-skills" || f.id === "structure-missing-skills")
    : 55;

  const grammarScore = scoreFromFindings(
    allFindings,
    (f) => f.category === "content" && (f.id.startsWith("grammar-") || f.id.endsWith("-weak-verbs") || f.id.endsWith("-passive-voice") || f.id.endsWith("-buzzwords"))
  );

  const atsCompatibilityScore = Math.round(
    formattingScore * 0.5 +
      scoreFromFindings(allFindings, (f) => f.category === "contact") * 0.2 +
      scoreFromFindings(allFindings, (f) => f.category === "structure") * 0.3
  );

  const recruiterReadabilityScore = Math.round(
    readabilityScore * 0.4 +
      scoreFromFindings(allFindings, (f) => f.id.endsWith("-long-bullets") || f.id.endsWith("-no-metrics")) * 0.3 +
      scoreFromFindings(allFindings, (f) => f.category === "content") * 0.3
  );

  return {
    formattingScore,
    keywordScore,
    experienceScore,
    educationScore,
    skillsScore,
    grammarScore,
    atsCompatibilityScore,
    recruiterReadabilityScore,
  };
}

export function computeHybridScores(input: ScoringInput): HybridScores {
  const category = computeCategoryScores(input);

  // ATS Pass Score: can a machine parser extract this cleanly? Weighted
  // toward structural/formatting compatibility and how simulated platforms
  // actually parsed it.
  const atsPassScore = Math.round(category.atsCompatibilityScore * 0.6 + input.avgPlatformParseConfidence * 0.4);

  // Recruiter Appeal Score: would a human reading this be impressed?
  // Weighted toward writing quality, readability, and grammar.
  const recruiterAppealScore = Math.round(
    category.recruiterReadabilityScore * 0.45 + category.grammarScore * 0.35 + category.experienceScore * 0.2
  );

  // Role Match Score: how well does this resume align to the specific job
  // description (keyword + experience/skills alignment). Falls back to a
  // generic quality signal when no JD was supplied.
  const roleMatchScore = input.keywordMatch
    ? Math.round(category.keywordScore * 0.6 + category.experienceScore * 0.25 + category.skillsScore * 0.15)
    : Math.round((category.experienceScore + category.skillsScore) / 2);

  const overallScore = Math.round(atsPassScore * 0.4 + recruiterAppealScore * 0.35 + roleMatchScore * 0.25);

  return {
    ...category,
    overallScore,
    atsPassScore,
    recruiterAppealScore,
    roleMatchScore,
  };
}
