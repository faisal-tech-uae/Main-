import { runFormattingChecks } from "./checks/formatting";
import { detectMissingSections, runContactChecks } from "./checks/contact";
import {
  checkDateConsistency,
  checkDuplicateSkills,
  fleschReadingEase,
  runBulletQualityChecks,
  runMechanicalTextChecks,
  whitespaceRatio,
} from "./checks/content-quality";
import { matchKeywords } from "./checks/keywords";
import { simulateAllPlatforms, simulatePlatform } from "./platform-profiles";
import { computeHybridScores } from "./scoring";
import { REQUIRED_SECTIONS_FOR_ROLE_LEVEL } from "./wordlists";
import type { AtsPlatform, HybridScores, ParsedResumeStructure, PlatformSimulationNote, RuleFinding } from "./types";

export interface AnalyzeResumeInput {
  structure: ParsedResumeStructure;
  /** Bullet points broken out by section, so scoring can attribute issues correctly. */
  bulletsBySection?: {
    experience?: string[];
    projects?: string[];
    volunteer?: string[];
  };
  skillItems?: string[];
  dateStrings?: string[];
  jobDescriptionText?: string;
  targetPlatform?: AtsPlatform;
  jobLevelProfile?: keyof typeof REQUIRED_SECTIONS_FOR_ROLE_LEVEL;
}

export interface AnalyzeResumeResult {
  findings: RuleFinding[];
  keywordMatch: ReturnType<typeof matchKeywords> | null;
  scores: HybridScores;
  platformSimulations: PlatformSimulationNote[];
  primaryPlatformSimulation: PlatformSimulationNote;
  wordCount: number;
  whitespaceRatio: number;
  readabilityScore: number;
}

export function analyzeResume(input: AnalyzeResumeInput): AnalyzeResumeResult {
  const { structure } = input;
  const requiredSections = REQUIRED_SECTIONS_FOR_ROLE_LEVEL[input.jobLevelProfile ?? "default"];

  const findings: RuleFinding[] = [
    ...runFormattingChecks(structure),
    ...runContactChecks(structure),
    ...detectMissingSections(structure, requiredSections),
    ...runMechanicalTextChecks(structure.rawText),
    ...runBulletQualityChecks(input.bulletsBySection?.experience ?? [], "experience-content"),
    ...runBulletQualityChecks(input.bulletsBySection?.projects ?? [], "projects-content"),
    ...runBulletQualityChecks(input.bulletsBySection?.volunteer ?? [], "volunteer-content"),
    ...checkDateConsistency(input.dateStrings ?? []),
    ...checkDuplicateSkills(input.skillItems ?? []),
  ];

  const keywordMatch = input.jobDescriptionText ? matchKeywords(structure.rawText, input.jobDescriptionText) : null;

  const platformSimulations = simulateAllPlatforms(findings);
  const targetPlatform = input.targetPlatform ?? "GENERIC";
  const primaryPlatformSimulation =
    platformSimulations.find((p) => p.platform === targetPlatform) ?? simulatePlatform(targetPlatform, findings);

  const avgPlatformParseConfidence = Math.round(
    platformSimulations.reduce((sum, p) => sum + p.parseConfidence, 0) / platformSimulations.length
  );

  const readabilityScore = fleschReadingEase(structure.rawText);

  const scores = computeHybridScores({
    allFindings: findings,
    keywordMatch,
    readabilityScore,
    hasExperienceSection: structure.detectedSections.includes("experience") || (input.bulletsBySection?.experience?.length ?? 0) > 0,
    hasEducationSection: structure.detectedSections.includes("education"),
    hasSkillsSection: structure.detectedSections.includes("skills") || (input.skillItems?.length ?? 0) > 0,
    avgPlatformParseConfidence,
  });

  return {
    findings: findings.sort((a, b) => b.pointsDeducted - a.pointsDeducted),
    keywordMatch,
    scores,
    platformSimulations,
    primaryPlatformSimulation,
    wordCount: structure.rawText.split(/\s+/).filter(Boolean).length,
    whitespaceRatio: whitespaceRatio(structure.rawText),
    readabilityScore,
  };
}
