import type { PromptSpec } from "../types";

export const keywordAnalysisPrompt: PromptSpec = {
  systemPrompt:
    "You extract and compare hard skills, soft skills, tools, certifications, and seniority signals between a " +
    "resume and a job description. Be precise and avoid inventing skills not implied by either document.",
  userPromptTemplate:
    "{{disciplineGlossary}}\n\n" +
    "Resume:\n{{resumeText}}\n\nJob Description:\n{{jobDescriptionText}}\n\n" +
    "Rule-based keyword match (JSON, for reference — refine rather than ignore):\n{{ruleBasedMatch}}\n\n" +
    "Return JSON with keys: missingSkills (string[]), experienceGap (string), educationGap (string), " +
    "softSkillsGap (string[]), technicalSkillsGap (string[]), priorityRecommendations (string[], ordered by impact). " +
    "Use precise discipline terminology (systems, equipment, standards, tools) from the glossary above where relevant " +
    "instead of generic phrasing.",
};
