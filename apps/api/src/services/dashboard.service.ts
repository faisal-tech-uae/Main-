import type { ResumeDocument } from "@resumeai/shared";
import { resumeRepository } from "../repositories/resume.repository";
import { atsAnalysisRepository } from "../repositories/ats-analysis.repository";
import { applicationRepository } from "../repositories/application.repository";
import { auditLogRepository } from "../repositories/audit-log.repository";

const PROFILE_SECTION_WEIGHTS: Array<{ key: keyof ResumeDocument; weight: number }> = [
  { key: "summary", weight: 15 },
  { key: "experience", weight: 30 },
  { key: "education", weight: 20 },
  { key: "skills", weight: 20 },
  { key: "certifications", weight: 5 },
  { key: "projects", weight: 10 },
];

function computeProfileCompletion(doc: ResumeDocument | null): number {
  if (!doc) return 0;
  let score = 0;
  for (const { key, weight } of PROFILE_SECTION_WEIGHTS) {
    const value = doc[key];
    const filled = Array.isArray(value) ? value.length > 0 : Boolean((value as { content?: string } | undefined)?.content);
    if (filled) score += weight;
  }
  if (doc.personalInfo.email && doc.personalInfo.phone) score = Math.min(100, score + 0);
  return Math.min(100, score);
}

export async function getDashboardSummary(userId: string) {
  const [resumes, scoreTrend, applications, applicationsByStatus, downloadCount] = await Promise.all([
    resumeRepository.listForUser(userId),
    atsAnalysisRepository.scoreTrend(userId, 30),
    applicationRepository.listForUser(userId),
    applicationRepository.countByStatus(userId),
    auditLogRepository.countByAction(userId, "resume_download"),
  ]);

  const statusCounts = Object.fromEntries(applicationsByStatus.map((s) => [s.status, s._count._all]));
  const applied = statusCounts.APPLIED ?? 0;
  const interviewing = statusCounts.INTERVIEWING ?? 0;
  const offer = statusCounts.OFFER ?? 0;
  const totalApplied = applied + interviewing + offer + (statusCounts.REJECTED ?? 0);
  const interviewRate = totalApplied === 0 ? 0 : Math.round(((interviewing + offer) / totalApplied) * 100);

  const primaryResume = resumes.find((r) => r.isPrimary) ?? resumes[0];
  const primaryDoc = (primaryResume?.currentVersion?.data as unknown as ResumeDocument) ?? null;

  const totalVersions = await Promise.all(resumes.map((r) => resumeRepository.findById(r.id, userId))).then((full) =>
    full.reduce((sum, r) => sum + (r?.versions.length ?? 0), 0)
  );

  return {
    applicationsSent: totalApplied,
    resumeVersions: totalVersions,
    atsScoreTrend: scoreTrend.map((s) => ({
      date: s.createdAt,
      overall: s.overallScore,
      atsPass: s.atsPassScore,
      recruiterAppeal: s.recruiterAppealScore,
      roleMatch: s.roleMatchScore,
    })),
    interviewRate,
    resumeDownloads: downloadCount,
    profileCompletion: computeProfileCompletion(primaryDoc),
    resumeCount: resumes.length,
    applications,
  };
}
