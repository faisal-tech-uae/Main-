import type { PromptSpec } from "../types";

export const resumeStructuringPrompt: PromptSpec = {
  systemPrompt:
    "You convert unstructured resume/CV text (extracted from a PDF or DOCX upload, so line breaks and spacing may " +
    "be imperfect) into a clean structured JSON representation. Extract only what is actually present in the text — " +
    "never invent employers, dates, titles, schools, or skills. If a field isn't present, omit it or leave it blank; " +
    "do not guess.",
  userPromptTemplate:
    "Raw extracted resume text:\n{{resumeText}}\n\n" +
    "{{disciplineGlossary}}\n\n" +
    "Return a JSON object with keys: " +
    "personalInfo ({fullName, email, phone, location, linkedinUrl, githubUrl, portfolioUrl, jobTitle}), " +
    "summary (string), " +
    "experience (array of {jobTitle, employer, location, startDate, endDate, current (boolean), bullets (string[])}), " +
    "projects (array of {name, role, startDate, endDate, current, bullets (string[])}), " +
    "education (array of {institution, degree, fieldOfStudy, startDate, endDate, current, gpa}), " +
    "certifications (array of {name, issuer, issueDate}), " +
    "skills (array of {category, items (string[])}), " +
    "languages (array of {language, proficiency}), " +
    "awards (array of {title, issuer, date}), " +
    "volunteer (array of {organization, role, startDate, endDate, current, bullets (string[])}), " +
    "detectedDiscipline (string, your best-guess engineering discipline label if this looks like an engineering/MEP CV, e.g. " +
    "\"HVAC Engineer\", \"Electrical Engineer\", \"MEP Site Engineer\", \"Facilities Manager\" — omit if not applicable). " +
    "Dates should be normalized to \"YYYY-MM\" where a month is known, else \"YYYY\". " +
    "Split each experience/project/volunteer entry's responsibilities into separate one-line bullets rather than one " +
    "long paragraph.",
};
