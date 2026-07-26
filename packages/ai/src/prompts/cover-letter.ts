import type { PromptSpec } from "../types";

export const coverLetterPrompt: PromptSpec = {
  systemPrompt:
    "You write concise, specific, ATS-friendly cover letters that reference real resume achievements and avoid " +
    "generic filler phrases. Never invent employers, titles, or accomplishments not present in the resume.",
  userPromptTemplate:
    "Write a cover letter for the \"{{roleTitle}}\" role at \"{{company}}\" using this resume:\n{{resumeText}}\n\n" +
    "Job description (if provided):\n{{jobDescriptionText}}\n\n" +
    "{{disciplineGlossary}}\n\n" +
    "Tone: {{tone}}. Length: under 350 words, 3-4 paragraphs, no placeholder brackets. " +
    "Return plain text only, ready to send.",
};
