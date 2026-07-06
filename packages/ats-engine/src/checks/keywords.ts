import type { KeywordMatchResult } from "../types";

const STOPWORDS = new Set(
  [
    "the", "and", "a", "an", "to", "of", "in", "for", "with", "on", "at", "by", "is", "are",
    "be", "as", "or", "that", "this", "will", "you", "your", "we", "our", "their", "from",
    "have", "has", "it", "its", "into", "about", "across", "including", "etc", "role", "job",
    "team", "work", "experience", "years", "year", "ability", "strong", "excellent", "skills",
  ]
);

/** Extracts candidate keywords/phrases: nouns-ish tokens and 2-3 word technical phrases. */
export function extractKeywords(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = normalized.split(" ").filter((t) => t.length > 1 && !STOPWORDS.has(t));

  const unigrams = new Set(tokens);
  const bigrams = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!STOPWORDS.has(tokens[i]) && !STOPWORDS.has(tokens[i + 1])) {
      bigrams.add(`${tokens[i]} ${tokens[i + 1]}`);
    }
  }

  return [...new Set([...unigrams, ...bigrams])];
}

export function matchKeywords(resumeText: string, jobDescriptionText: string): KeywordMatchResult {
  const resumeKeywords = new Set(extractKeywords(resumeText));
  const jdKeywords = extractKeywords(jobDescriptionText);

  // Weight single-word JD keywords that also appear frequently (likely core requirements).
  const jdUnique = [...new Set(jdKeywords)];

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of jdUnique) {
    if (resumeKeywords.has(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const matchPercent = jdUnique.length === 0 ? 100 : Math.round((matched.length / jdUnique.length) * 100);

  return {
    matched: matched.slice(0, 100),
    missing: missing.slice(0, 100),
    matchPercent,
  };
}
