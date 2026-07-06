export interface DashboardSummary {
  applicationsSent: number;
  resumeVersions: number;
  atsScoreTrend: Array<{ date: string; overall: number; atsPass: number; recruiterAppeal: number; roleMatch: number }>;
  interviewRate: number;
  resumeDownloads: number;
  profileCompletion: number;
  resumeCount: number;
  applications: Array<{ id: string; company: string; roleTitle: string; status: string; createdAt: string }>;
}

export interface ResumeSummary {
  id: string;
  title: string;
  targetIndustry?: string | null;
  targetJobRole?: string | null;
  targetCountry?: string | null;
  updatedAt: string;
  isPrimary: boolean;
  templateId?: string | null;
  currentVersion?: { id: string; data: unknown } | null;
}

export interface ResumeVersionRecord {
  id: string;
  versionNumber: number;
  data: unknown;
  changeNote?: string | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface ResumeDetail extends ResumeSummary {
  versions: ResumeVersionRecord[];
}

export interface TemplateSummary {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  isPremium: boolean;
  previewImage?: string | null;
  layoutConfig: { columns?: number; font?: string; accentColor?: string; sectionOrder?: string[] };
}

export interface AtsFinding {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  message: string;
  pointsDeducted: number;
}

export interface PlatformSimulationNote {
  platform: string;
  parseConfidence: number;
  deductions: Array<{ reason: string; points: number; relatedFindingId?: string }>;
  summary: string;
}

export interface AtsAnalysisRecord {
  id: string;
  overallScore: number;
  atsPassScore: number;
  recruiterAppealScore: number;
  roleMatchScore: number;
  formattingScore: number;
  keywordScore: number;
  experienceScore: number;
  educationScore: number;
  skillsScore: number;
  grammarScore: number;
  atsCompatibilityScore: number;
  recruiterReadabilityScore: number;
  ruleFindings: AtsFinding[];
  keywordMatch: { matched: string[]; missing: string[]; matchPercent: number } | Record<string, never>;
  aiAnalysis?: {
    resumeAnalysis?: {
      executiveSummary?: string;
      strengths?: string[];
      weaknesses?: string[];
      atsProblems?: string[];
      formattingProblems?: string[];
      missingKeywords?: string[];
      actionPlan?: string[];
      priorityFixes?: string[];
      estimatedInterviewProbability?: number;
      estimatedRecruiterReadability?: number;
      estimatedAtsPassProbability?: number;
    };
    keywordAnalysis?: {
      missingSkills?: string[];
      experienceGap?: string;
      educationGap?: string;
      softSkillsGap?: string[];
      technicalSkillsGap?: string[];
      priorityRecommendations?: string[];
    };
  } | null;
  platformNotes?: {
    primary?: PlatformSimulationNote;
    all?: PlatformSimulationNote[];
  } | null;
  interviewProbability?: number | null;
  estimatedRecruiterReadTimeSec?: number | null;
  createdAt: string;
}

export interface UploadedResumeRecord {
  id: string;
  fileName: string;
  fileType: "PDF" | "DOCX" | "TXT";
  rawText: string;
  createdAt: string;
}

export interface CoverLetterRecord {
  id: string;
  company?: string | null;
  roleTitle?: string | null;
  content: string;
  tone: string;
  createdAt: string;
}

export interface InterviewSessionRecord {
  id: string;
  roleTitle?: string | null;
  questions: Array<{ type: "TECHNICAL" | "BEHAVIORAL" | "HR"; question: string; suggestedStarAnswer: string }>;
  createdAt: string;
}

export interface LinkedInOptimizationRecord {
  id: string;
  headline?: string | null;
  about?: string | null;
  experienceBullets: Array<{ title: string; bullets: string[] }>;
  skills: string[];
  featured: string[];
  keywords: string[];
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  company: string;
  roleTitle: string;
  status: "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";
  notes?: string | null;
  createdAt: string;
}
