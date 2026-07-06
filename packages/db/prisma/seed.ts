import { PrismaClient, TemplateCategory, AiFeature } from "@prisma/client";

const prisma = new PrismaClient();

const PLAN_CONFIGS = [
  {
    plan: "FREE" as const,
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    scanLimit: 5,
    features: {
      resumeBuilder: true,
      atsScans: 5,
      coverLetters: false,
      interviewCoach: false,
      resumeRewrite: false,
      linkedinOptimizer: false,
    },
  },
  {
    plan: "PREMIUM" as const,
    priceMonthlyCents: 1999,
    priceYearlyCents: 19999,
    scanLimit: -1,
    features: {
      resumeBuilder: true,
      atsScans: -1,
      coverLetters: true,
      interviewCoach: true,
      resumeRewrite: true,
      linkedinOptimizer: true,
    },
  },
  {
    plan: "ENTERPRISE" as const,
    priceMonthlyCents: 4999,
    priceYearlyCents: 49999,
    scanLimit: -1,
    features: {
      resumeBuilder: true,
      atsScans: -1,
      coverLetters: true,
      interviewCoach: true,
      resumeRewrite: true,
      linkedinOptimizer: true,
      teamSeats: true,
      prioritySupport: true,
    },
  },
];

const TEMPLATES: Array<{
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string;
  isPremium: boolean;
  layoutConfig: Record<string, unknown>;
}> = [
  {
    slug: "classic-ats",
    name: "Classic ATS",
    category: "GENERAL",
    description: "Single-column, no tables/graphics — the safest baseline for every ATS.",
    isPremium: false,
    layoutConfig: { columns: 1, font: "Inter", accentColor: "#111827", sectionOrder: ["summary", "experience", "education", "skills"] },
  },
  {
    slug: "software-engineer",
    name: "Software Engineer",
    category: "SOFTWARE",
    description: "Optimized for engineering roles with prominent tech-stack and project sections.",
    isPremium: false,
    layoutConfig: { columns: 1, font: "Inter", accentColor: "#2563EB", sectionOrder: ["summary", "skills", "experience", "projects", "education"] },
  },
  {
    slug: "healthcare-professional",
    name: "Healthcare Professional",
    category: "HEALTHCARE",
    description: "Certification-forward layout for clinical and healthcare roles.",
    isPremium: false,
    layoutConfig: { columns: 1, font: "Source Sans Pro", accentColor: "#0F766E", sectionOrder: ["summary", "certifications", "experience", "education", "skills"] },
  },
  {
    slug: "finance-analyst",
    name: "Finance Analyst",
    category: "FINANCE",
    description: "Metrics-first layout that foregrounds quantifiable achievements.",
    isPremium: true,
    layoutConfig: { columns: 1, font: "Georgia", accentColor: "#1E3A8A", sectionOrder: ["summary", "experience", "skills", "education", "certifications"] },
  },
  {
    slug: "project-management",
    name: "Project Management",
    category: "PROJECT_MANAGEMENT",
    description: "Highlights methodologies (Agile/Scrum/PMP) and delivery outcomes.",
    isPremium: false,
    layoutConfig: { columns: 1, font: "Inter", accentColor: "#7C3AED", sectionOrder: ["summary", "certifications", "experience", "skills", "education"] },
  },
  {
    slug: "construction-civil",
    name: "Construction & Civil",
    category: "CONSTRUCTION",
    description: "Field-ready layout for construction, civil, and MEP professionals.",
    isPremium: false,
    layoutConfig: { columns: 1, font: "Inter", accentColor: "#B45309", sectionOrder: ["summary", "experience", "certifications", "skills", "education"] },
  },
  {
    slug: "hr-people-ops",
    name: "HR & People Ops",
    category: "HR",
    description: "People-first narrative style for HR and talent roles.",
    isPremium: false,
    layoutConfig: { columns: 1, font: "Inter", accentColor: "#BE185D", sectionOrder: ["summary", "experience", "skills", "education", "certifications"] },
  },
  {
    slug: "executive-leadership",
    name: "Executive Leadership",
    category: "EXECUTIVE",
    description: "Board-ready format for VP/C-suite candidates with a leadership summary.",
    isPremium: true,
    layoutConfig: { columns: 1, font: "Georgia", accentColor: "#111827", sectionOrder: ["summary", "experience", "education", "awards", "skills"] },
  },
  {
    slug: "fresher-graduate",
    name: "Fresher / New Graduate",
    category: "FRESHER",
    description: "Education and projects lead the page for candidates with limited work history.",
    isPremium: false,
    layoutConfig: { columns: 1, font: "Inter", accentColor: "#2563EB", sectionOrder: ["summary", "education", "projects", "skills", "experience"] },
  },
  {
    slug: "academic-cv",
    name: "Academic / Research CV",
    category: "ACADEMIC",
    description: "Supports publications, research, and patents for academic applications.",
    isPremium: true,
    layoutConfig: { columns: 1, font: "Georgia", accentColor: "#374151", sectionOrder: ["summary", "education", "publications", "research", "experience", "skills"] },
  },
];

async function main() {
  for (const cfg of PLAN_CONFIGS) {
    await prisma.planConfig.upsert({
      where: { plan: cfg.plan },
      update: cfg,
      create: cfg,
    });
  }

  for (const t of TEMPLATES) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }

  const prompts: Array<{ feature: AiFeature; name: string; systemPrompt: string; userPromptTemplate: string }> = [
    {
      feature: "RESUME_ANALYSIS",
      name: "Executive Resume Analysis",
      systemPrompt:
        "You are a senior recruiter and resume strategist with 15 years of experience across industries. Analyze resumes objectively and return structured, actionable JSON only.",
      userPromptTemplate:
        "Analyze the following resume for the target role \"{{targetRole}}\" in the \"{{targetIndustry}}\" industry ({{targetCountry}}). Resume:\n\n{{resumeText}}\n\nReturn JSON with: executiveSummary, strengths[], weaknesses[], atsProblems[], formattingProblems[], missingKeywords[], actionPlan[], priorityFixes[], estimatedInterviewProbability (0-100), estimatedRecruiterReadability (0-100), estimatedAtsPassProbability (0-100).",
    },
    {
      feature: "ATS_ANALYSIS",
      name: "ATS Compatibility Analysis",
      systemPrompt:
        "You are an ATS parsing simulator familiar with Greenhouse, Lever, Workday, Oracle Taleo, SAP SuccessFactors, iCIMS, SmartRecruiters, JazzHR, BambooHR, UKG, and Dayforce. Explain how each system would parse this document and where it would lose information.",
      userPromptTemplate:
        "Given this parsed resume structure:\n\n{{parsedStructure}}\n\nSimulate parsing behavior for platform \"{{platform}}\" and list specific fields at risk of misparse, with point deductions and reasons.",
    },
    {
      feature: "KEYWORD_ANALYSIS",
      name: "Job Description Keyword Matching",
      systemPrompt:
        "You extract and compare hard skills, soft skills, tools, certifications, and seniority signals between a resume and a job description.",
      userPromptTemplate:
        "Resume:\n{{resumeText}}\n\nJob Description:\n{{jobDescriptionText}}\n\nReturn JSON: matchedKeywords[], missingKeywords[], missingSkills[], experienceGap, educationGap, softSkillsGap[], technicalSkillsGap[], priorityRecommendations[], keywordMatchPercent.",
    },
    {
      feature: "COVER_LETTER",
      name: "ATS-Friendly Cover Letter",
      systemPrompt:
        "You write concise, specific, ATS-friendly cover letters that reference real resume achievements and avoid generic filler.",
      userPromptTemplate:
        "Write a cover letter for {{roleTitle}} at {{company}} using this resume:\n{{resumeText}}\n\nJob description:\n{{jobDescriptionText}}\n\nTone: {{tone}}. Keep it under 350 words, 3-4 paragraphs.",
    },
    {
      feature: "INTERVIEW_PREP",
      name: "Interview Question Generator",
      systemPrompt:
        "You generate realistic interview questions tailored to a candidate's resume and target role, with STAR-method model answers grounded in the candidate's real experience.",
      userPromptTemplate:
        "Resume:\n{{resumeText}}\n\nTarget role: {{roleTitle}}\n\nGenerate 5 technical, 5 behavioral, and 3 HR questions. For each, include a suggested STAR-format answer using only facts present in the resume.",
    },
    {
      feature: "LINKEDIN_OPTIMIZATION",
      name: "LinkedIn Profile Optimizer",
      systemPrompt:
        "You optimize LinkedIn profiles for recruiter search visibility while keeping an authentic, human voice.",
      userPromptTemplate:
        "Based on this resume:\n{{resumeText}}\n\nGenerate a LinkedIn headline (under 220 chars), an About section (under 2000 chars), 3 Featured suggestions, and a prioritized skills list with search keywords.",
    },
    {
      feature: "RESUME_REWRITE",
      name: "Full Resume Rewrite",
      systemPrompt:
        "You rewrite resumes to maximize clarity, impact, and ATS compatibility while preserving every fact: employers, dates, titles, and years of experience must never be altered or invented.",
      userPromptTemplate:
        "Rewrite the following resume content for maximum impact and ATS compatibility. Do not invent facts, change employers, dates, or titles. Use strong action verbs and quantify achievements only where numbers are already present or can be reasonably inferred from context.\n\n{{resumeText}}",
    },
    {
      feature: "BULLET_REWRITE",
      name: "Bullet Point Rewriter",
      systemPrompt:
        "You convert task-oriented resume bullets into accomplishment-oriented, quantified, ATS-friendly bullets using the STAR method and strong action verbs.",
      userPromptTemplate:
        "Rewrite this bullet point for a {{roleTitle}} resume. Keep it factually identical, one line, starting with a strong action verb:\n\n{{bulletText}}",
    },
  ];

  for (const p of prompts) {
    await prisma.promptTemplate.upsert({
      where: { feature: p.feature },
      update: { name: p.name, systemPrompt: p.systemPrompt, userPromptTemplate: p.userPromptTemplate },
      create: p,
    });
  }

  console.log(`Seeded ${PLAN_CONFIGS.length} plans, ${TEMPLATES.length} templates, ${prompts.length} prompts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
