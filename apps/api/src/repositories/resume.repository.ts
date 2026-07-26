import { prisma } from "../lib/prisma";
import type { CreateResumeInput, UpdateResumeMetaInput } from "@resumeai/shared";
import type { Prisma } from "@resumeai/db";

export const resumeRepository = {
  listForUser(userId: string) {
    return prisma.resume.findMany({
      where: { userId, deletedAt: null },
      include: { currentVersion: true, template: true },
      orderBy: { updatedAt: "desc" },
    });
  },

  findById(resumeId: string, userId: string) {
    return prisma.resume.findFirst({
      where: { id: resumeId, userId, deletedAt: null },
      include: { currentVersion: true, template: true, versions: { orderBy: { versionNumber: "desc" } } },
    });
  },

  async create(userId: string, input: CreateResumeInput, initialData: Prisma.InputJsonValue) {
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: input.title,
        templateId: input.templateId,
        targetCountry: input.targetCountry,
        targetIndustry: input.targetIndustry,
        targetJobLevel: input.targetJobLevel,
        targetJobRole: input.targetJobRole,
        targetDiscipline: input.targetDiscipline,
        yearsExperience: input.yearsExperience,
      },
    });

    const version = await prisma.resumeVersion.create({
      data: { resumeId: resume.id, versionNumber: 1, data: initialData, createdBy: "user" },
    });

    return prisma.resume.update({
      where: { id: resume.id },
      data: { currentVersionId: version.id },
      include: { currentVersion: true },
    });
  },

  async addVersion(resumeId: string, data: Prisma.InputJsonValue, changeNote: string | undefined, createdBy: string) {
    const latest = await prisma.resumeVersion.findFirst({ where: { resumeId }, orderBy: { versionNumber: "desc" } });
    const versionNumber = (latest?.versionNumber ?? 0) + 1;

    const version = await prisma.resumeVersion.create({
      data: { resumeId, versionNumber, data, changeNote, createdBy },
    });

    return prisma.resume.update({
      where: { id: resumeId },
      data: { currentVersionId: version.id },
      include: { currentVersion: true },
    });
  },

  restoreVersion(resumeId: string, versionId: string) {
    return prisma.resume.update({ where: { id: resumeId }, data: { currentVersionId: versionId } });
  },

  updateMeta(resumeId: string, userId: string, data: UpdateResumeMetaInput) {
    return prisma.resume.updateMany({ where: { id: resumeId, userId }, data });
  },

  softDelete(resumeId: string, userId: string) {
    return prisma.resume.updateMany({ where: { id: resumeId, userId }, data: { deletedAt: new Date() } });
  },

  countForUser(userId: string) {
    return prisma.resume.count({ where: { userId, deletedAt: null } });
  },
};
