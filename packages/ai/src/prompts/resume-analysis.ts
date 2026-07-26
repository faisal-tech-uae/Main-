import type { PromptSpec } from "../types";

export const resumeAnalysisPrompt: PromptSpec = {
  systemPrompt:
    "You are a senior recruiter and resume strategist with 15 years of experience hiring across industries. " +
    "Analyze resumes objectively, ground every claim in the resume text provided, and return structured JSON only.",
  userPromptTemplate:
    "Analyze the following resume for the target role \"{{targetRole}}\" in the \"{{targetIndustry}}\" industry ({{targetCountry}}, job level: {{jobLevel}}).\n\n" +
    "{{disciplineGlossary}}\n\n" +
    "Resume:\n{{resumeText}}\n\n" +
    "Return a JSON object with exactly these keys: " +
    "executiveSummary (string, 2-3 sentences), strengths (string[]), weaknesses (string[]), atsProblems (string[]), " +
    "formattingProblems (string[]), missingKeywords (string[]), actionPlan (string[]), priorityFixes (string[]), " +
    "estimatedInterviewProbability (integer 0-100), estimatedRecruiterReadability (integer 0-100), estimatedAtsPassProbability (integer 0-100). " +
    "If a discipline glossary was provided above, missingKeywords and priorityFixes should specifically call out relevant " +
    "missing terminology, systems, tools, or UAE certifications/approvals from that glossary — not generic advice.",
};
