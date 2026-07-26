import type { PromptSpec } from "../types";

export const atsAnalysisPrompt: PromptSpec = {
  systemPrompt:
    "You are an ATS parsing simulator familiar with Greenhouse, Lever, Workday, Oracle Taleo, SAP SuccessFactors, " +
    "iCIMS, SmartRecruiters, JazzHR, BambooHR, UKG, and Dayforce. Explain how a given platform would parse a resume " +
    "and where it would lose or misattribute information. Return structured JSON only.",
  userPromptTemplate:
    "Parsed resume structure (JSON):\n{{parsedStructure}}\n\n" +
    "Rule-engine findings already detected (JSON):\n{{ruleFindings}}\n\n" +
    "Simulate parsing behavior specifically for the \"{{platform}}\" platform. " +
    "Return JSON with keys: additionalRisks (string[], anything the rule engine may have missed), " +
    "explanation (string, 2-4 sentences on why this platform would behave this way), " +
    "confidenceNote (string, one sentence caveat that this is a heuristic simulation, not guaranteed vendor behavior).",
};
