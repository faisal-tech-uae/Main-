import { createEmptyResumeDocument, resumeDocumentSchema, type CreateResumeInput, type ResumeDocument } from "@resumeai/shared";
import { resumeRepository } from "../repositories/resume.repository";
import { ApiError } from "../lib/errors";

export const resumeService = {
  listForUser(userId: string) {
    return resumeRepository.listForUser(userId);
  },

  async getById(resumeId: string, userId: string) {
    const resume = await resumeRepository.findById(resumeId, userId);
    if (!resume) throw ApiError.notFound("Resume not found");
    return resume;
  },

  create(userId: string, input: CreateResumeInput, seedFullName = "", seedEmail = "") {
    const initialDocument = createEmptyResumeDocument(seedFullName, seedEmail);
    return resumeRepository.create(userId, input, initialDocument);
  },

  async updateContent(resumeId: string, userId: string, data: ResumeDocument, changeNote?: string) {
    await this.getById(resumeId, userId); // ownership check
    const validated = resumeDocumentSchema.parse(data);
    return resumeRepository.addVersion(resumeId, validated, changeNote, "user");
  },

  async saveAiRewrite(resumeId: string, userId: string, data: ResumeDocument) {
    await this.getById(resumeId, userId);
    const validated = resumeDocumentSchema.parse(data);
    return resumeRepository.addVersion(resumeId, validated, "AI full-resume rewrite", "ai-rewrite");
  },

  async restoreVersion(resumeId: string, userId: string, versionId: string) {
    const resume = await this.getById(resumeId, userId);
    const version = resume.versions.find((v) => v.id === versionId);
    if (!version) throw ApiError.notFound("Resume version not found");
    return resumeRepository.restoreVersion(resumeId, versionId);
  },

  async remove(resumeId: string, userId: string) {
    await this.getById(resumeId, userId);
    return resumeRepository.softDelete(resumeId, userId);
  },
};
