import { buildDisciplineGlossaryText, findDisciplineById, matchDiscipline } from "@resumeai/shared";

/**
 * Resolves the MEP discipline glossary text to splice into AI prompts for a
 * given resume. Prefers the explicit `targetDiscipline` id (set via the
 * discipline picker or AI-detected on upload); falls back to fuzzy-matching
 * the free-text `targetJobRole`. Returns "" when nothing matches, in which
 * case the prompt template's `{{disciplineGlossary}}` placeholder renders
 * blank and the AI behaves exactly as it did before this feature existed.
 */
export function resolveDisciplineGlossary(resume: { targetDiscipline?: string | null; targetJobRole?: string | null }): string {
  const discipline = resume.targetDiscipline
    ? findDisciplineById(resume.targetDiscipline)
    : resume.targetJobRole
      ? matchDiscipline(resume.targetJobRole)
      : null;

  return buildDisciplineGlossaryText(discipline ?? null);
}
