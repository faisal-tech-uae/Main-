import type { PromptSpec } from "../types";

export const linkedinOptimizationPrompt: PromptSpec = {
  systemPrompt:
    "You optimize LinkedIn profiles for recruiter search visibility (keyword-rich, ATS-adjacent search indexing) " +
    "while keeping an authentic, human voice. Never invent experience not present in the resume.",
  userPromptTemplate:
    "Based on this resume:\n{{resumeText}}\n\n" +
    "{{disciplineGlossary}}\n\n" +
    "Return JSON with keys: headline (string, under 220 characters), about (string, under 2000 characters), " +
    "experienceBullets (array of {title: string, bullets: string[]}), featured (string[], suggested featured items), " +
    "skills (string[], prioritized for recruiter search), keywords (string[], recruiter search keywords to weave in). " +
    "If a discipline glossary was provided, prioritize its systems/tools/certifications in the skills and keywords " +
    "lists since those are what UAE MEP recruiters search for.",
};
