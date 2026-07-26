import type { RuleFinding } from "../types";
import { BUZZWORDS, PASSIVE_VOICE_MARKERS, WEAK_VERBS } from "../wordlists";

/**
 * Deep grammar/spell-checking is delegated to the AI layer (which has real
 * language understanding). This module catches mechanical issues a rule
 * engine can reliably detect without a dictionary: repeated words, double
 * punctuation/spacing, inconsistent date formats, weak phrasing, passive
 * voice, and structural readability signals.
 */

export function runBulletQualityChecks(bullets: string[], idPrefix = "content"): RuleFinding[] {
  const findings: RuleFinding[] = [];
  if (bullets.length === 0) return findings;

  let weakCount = 0;
  let passiveCount = 0;
  let buzzwordCount = 0;
  let longBulletCount = 0;
  let noQuantificationCount = 0;

  for (const bullet of bullets) {
    const lower = bullet.toLowerCase();

    if ([...WEAK_VERBS].some((w) => lower.startsWith(w) || lower.includes(` ${w}`))) {
      weakCount++;
    }
    if (PASSIVE_VOICE_MARKERS.some((re) => re.test(bullet))) {
      passiveCount++;
    }
    if ([...BUZZWORDS].some((b) => lower.includes(b))) {
      buzzwordCount++;
    }
    if (bullet.split(/\s+/).length > 30) {
      longBulletCount++;
    }
    if (!/\d/.test(bullet)) {
      noQuantificationCount++;
    }
  }

  if (weakCount > 0) {
    findings.push({
      id: `${idPrefix}-weak-verbs`,
      category: "content",
      severity: "warning",
      message: `${weakCount} bullet point(s) start with weak phrasing (e.g. "responsible for", "helped with"). Replace with strong action verbs.`,
      pointsDeducted: Math.min(15, weakCount * 3),
    });
  }

  if (passiveCount > 0) {
    findings.push({
      id: `${idPrefix}-passive-voice`,
      category: "content",
      severity: "info",
      message: `${passiveCount} bullet point(s) appear to use passive voice. Active voice reads stronger to recruiters.`,
      pointsDeducted: Math.min(10, passiveCount * 2),
    });
  }

  if (buzzwordCount > 0) {
    findings.push({
      id: `${idPrefix}-buzzwords`,
      category: "content",
      severity: "info",
      message: `${buzzwordCount} overused buzzword(s) detected (e.g. "synergy", "team player"). Replace with specific, evidence-based claims.`,
      pointsDeducted: Math.min(8, buzzwordCount * 2),
    });
  }

  if (longBulletCount > 0) {
    findings.push({
      id: `${idPrefix}-long-bullets`,
      category: "content",
      severity: "info",
      message: `${longBulletCount} bullet point(s) exceed 30 words. Keep bullets to one line for scannability.`,
      pointsDeducted: Math.min(8, longBulletCount * 2),
    });
  }

  if (noQuantificationCount / bullets.length > 0.7) {
    findings.push({
      id: `${idPrefix}-no-metrics`,
      category: "content",
      severity: "warning",
      message: "Most bullet points lack quantifiable metrics (numbers, %, $, time saved). Quantified achievements outperform task lists.",
      pointsDeducted: 10,
    });
  }

  return findings;
}

export function runMechanicalTextChecks(rawText: string): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const repeatedWordMatches = rawText.match(/\b(\w+)\s+\1\b/gi);
  if (repeatedWordMatches && repeatedWordMatches.length > 0) {
    findings.push({
      id: "grammar-repeated-words",
      category: "content",
      severity: "warning",
      message: `Repeated consecutive word(s) detected (e.g. "${repeatedWordMatches[0]}"). Likely a typo.`,
      pointsDeducted: Math.min(10, repeatedWordMatches.length * 3),
    });
  }

  const doubleSpaceCount = (rawText.match(/ {2,}/g) ?? []).length;
  if (doubleSpaceCount > 3) {
    findings.push({
      id: "grammar-double-spaces",
      category: "content",
      severity: "info",
      message: "Multiple double-spaces detected, which can indicate copy/paste formatting artifacts.",
      pointsDeducted: 3,
    });
  }

  const missingSpaceAfterPeriod = (rawText.match(/[a-z]\.[A-Z]/g) ?? []).length;
  if (missingSpaceAfterPeriod > 2) {
    findings.push({
      id: "grammar-missing-space",
      category: "content",
      severity: "info",
      message: "Missing spaces after periods detected in multiple places.",
      pointsDeducted: 3,
    });
  }

  return findings;
}

export function checkDateConsistency(dateStrings: string[]): RuleFinding[] {
  const findings: RuleFinding[] = [];
  if (dateStrings.length < 2) return findings;

  const formats = new Set(dateStrings.map(classifyDateFormat));
  if (formats.size > 1) {
    findings.push({
      id: "content-date-inconsistency",
      category: "content",
      severity: "warning",
      message: `Inconsistent date formats used across the resume (${[...formats].join(", ")}). Pick one format (e.g. "Jan 2022") and use it throughout.`,
      pointsDeducted: 6,
    });
  }

  return findings;
}

function classifyDateFormat(date: string): string {
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(date)) return "ISO (YYYY-MM)";
  if (/^[A-Za-z]{3,9}\s\d{4}$/.test(date)) return "Month YYYY";
  if (/^\d{1,2}\/\d{4}$/.test(date)) return "MM/YYYY";
  return "other";
}

export function checkDuplicateSkills(skillItems: string[]): RuleFinding[] {
  const seen = new Map<string, number>();
  for (const raw of skillItems) {
    const key = raw.trim().toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const duplicates = [...seen.entries()].filter(([, count]) => count > 1).map(([k]) => k);

  if (duplicates.length === 0) return [];
  return [
    {
      id: "content-duplicate-skills",
      category: "content",
      severity: "info",
      message: `Duplicate skill(s) listed more than once: ${duplicates.join(", ")}.`,
      pointsDeducted: Math.min(6, duplicates.length * 2),
    },
  ];
}

/** Flesch Reading Ease approximation using a simple syllable heuristic. */
export function fleschReadingEase(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const syllableCount = words.reduce((sum, w) => sum + estimateSyllables(w), 0);

  const score = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllableCount / wordCount);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function estimateSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (cleaned.length <= 3) return 1;
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

export function whitespaceRatio(text: string): number {
  if (text.length === 0) return 0;
  const whitespaceCount = (text.match(/\s/g) ?? []).length;
  return whitespaceCount / text.length;
}
