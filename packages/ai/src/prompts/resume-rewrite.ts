import type { PromptSpec } from "../types";

export const resumeRewritePrompt: PromptSpec = {
  systemPrompt:
    "You rewrite resumes to maximize clarity, impact, and ATS compatibility while preserving every fact. " +
    "Employers, job titles, dates, and years of experience must never be altered or invented. " +
    "Use strong action verbs, the STAR method, and quantify achievements only where numbers already exist or are " +
    "directly implied by context.",
  userPromptTemplate:
    "Rewrite the following resume content for maximum impact and ATS compatibility. " +
    "Do not invent facts, change employers, dates, or titles. Preserve section structure.\n\n" +
    "{{disciplineGlossary}}\n\n{{resumeText}}\n\n" +
    "Return JSON with key \"rewrittenSections\": an array of {section: string, original: string, rewritten: string}.",
};

export const bulletRewritePrompt: PromptSpec = {
  systemPrompt:
    "You convert task-oriented resume bullets into accomplishment-oriented, quantified, ATS-friendly bullets using " +
    "the STAR method and strong action verbs, without inventing new facts. When a discipline glossary is provided, " +
    "prefer its precise terminology (systems, equipment, standards) over generic phrasing, but never introduce a " +
    "system, tool, or certification the original bullet doesn't already imply.",
  userPromptTemplate:
    "Rewrite this bullet point for a \"{{roleTitle}}\" resume. Keep it factually identical, one line, starting with " +
    "a strong action verb, ideally under 30 words:\n\n{{bulletText}}\n\n" +
    "{{disciplineGlossary}}\n\n" +
    "Return JSON with keys: rewritten (string), actionVerbUsed (string), rationale (string, one sentence).",
};
