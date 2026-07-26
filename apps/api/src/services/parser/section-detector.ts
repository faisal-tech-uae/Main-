import { CANONICAL_SECTION_HEADINGS } from "@resumeai/ats-engine";

/** Scans line-by-line for headings that match a known section alias (case-insensitive, short lines only). */
export function detectSections(rawText: string): string[] {
  const lines = rawText
    .split(/\r?\n|(?<=[a-z])(?=[A-Z]{2,})/) // also split on ALL-CAPS heading runs when PDF text has no newlines
    .map((l) => l.trim().toLowerCase())
    .filter((l) => l.length > 0 && l.length < 40);

  const detected = new Set<string>();

  for (const line of lines) {
    for (const [canonical, aliases] of Object.entries(CANONICAL_SECTION_HEADINGS)) {
      if (aliases.some((alias) => line === alias || line.startsWith(alias))) {
        detected.add(canonical);
      }
    }
  }

  return [...detected];
}
