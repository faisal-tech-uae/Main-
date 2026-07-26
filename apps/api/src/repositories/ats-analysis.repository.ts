import { prisma } from "../lib/prisma";
import type { Prisma, AtsPlatform } from "@resumeai/db";

export interface CreateAtsAnalysisInput {
  userId: string;
  resumeId?: string;
  uploadedResumeId?: string;
  jobDescriptionId?: string;
  targetPlatform: AtsPlatform;
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
  ruleFindings: Prisma.InputJsonValue;
  keywordMatch: Prisma.InputJsonValue;
  aiAnalysis?: Prisma.InputJsonValue;
  platformNotes?: Prisma.InputJsonValue;
  interviewProbability?: number;
  estimatedRecruiterReadTimeSec?: number;
}

export const atsAnalysisRepository = {
  create(input: CreateAtsAnalysisInput) {
    return prisma.atsAnalysis.create({ data: input });
  },

  findById(id: string, userId: string) {
    return prisma.atsAnalysis.findFirst({
      where: { id, userId },
      include: { resume: true, uploadedResume: true, jobDescription: true },
    });
  },

  listForUser(userId: string, limit = 20) {
    return prisma.atsAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  listForResume(resumeId: string, userId: string) {
    return prisma.atsAnalysis.findMany({ where: { resumeId, userId }, orderBy: { createdAt: "desc" } });
  },

  scoreTrend(userId: string, limit = 20) {
    return prisma.atsAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: { createdAt: true, overallScore: true, atsPassScore: true, recruiterAppealScore: true, roleMatchScore: true },
    });
  },
};
