import type { PromptSpec } from "../types";

export const interviewPrepPrompt: PromptSpec = {
  systemPrompt:
    "You generate realistic interview questions tailored to a candidate's resume and target role, with STAR-method " +
    "model answers grounded only in facts present in the resume.",
  userPromptTemplate:
    "Resume:\n{{resumeText}}\n\nTarget role: {{roleTitle}}\n\nJob description (if provided):\n{{jobDescriptionText}}\n\n" +
    "Generate 5 technical questions, 5 behavioral questions, and 3 HR questions. Return JSON with key \"questions\": " +
    "an array of objects each with: type (\"TECHNICAL\"|\"BEHAVIORAL\"|\"HR\"), question (string), " +
    "suggestedStarAnswer (string, using Situation/Task/Action/Result framing, grounded in the resume).",
};
