import type { ResumeDocument } from "@resumeai/shared";
import type { BulletRewriteRequestInput } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { createAiClientForUser } from "../lib/ai";
import { ApiError } from "../lib/errors";

export async function rewriteBullet(userId: string, input: BulletRewriteRequestInput) {
  const aiClient = await createAiClientForUser(userId);
  return aiClient.rewriteBullet(input);
}

/**
 * One-click full-resume rewrite. Facts (employers, titles, dates, years of
 * experience) live in structured fields we never touch — only free-text
 * bullets and the summary are rewritten, bullet-by-bullet, through the same
 * fact-preserving prompt used by the single-bullet rewriter. This is more
 * reliable than asking the model to rewrite the whole document as prose and
 * re-parsing it back into structured fields.
 */
export async function rewriteEntireResume(userId: string, resumeId: string) {
  const resume = await resumeService.getById(resumeId, userId);
  const doc = resume.currentVersion?.data as unknown as ResumeDocument;
  if (!doc) throw ApiError.badRequest("Resume has no content yet");

  const aiClient = await createAiClientForUser(userId);

  const rewriteList = async (bullets: string[], roleTitle?: string) =>
    Promise.all(
      bullets.map(async (bullet) => {
        try {
          const result = await aiClient.rewriteBullet({ bulletText: bullet, roleTitle });
          return result.rewritten;
        } catch {
          return bullet; // fall back to the original bullet if the AI call fails
        }
      })
    );

  const [rewrittenExperience, rewrittenProjects, rewrittenVolunteer, rewrittenSummary] = await Promise.all([
    Promise.all(doc.experience.map(async (e) => ({ ...e, bullets: await rewriteList(e.bullets, e.jobTitle) }))),
    Promise.all(doc.projects.map(async (p) => ({ ...p, bullets: await rewriteList(p.bullets, p.role) }))),
    Promise.all(doc.volunteer.map(async (v) => ({ ...v, bullets: await rewriteList(v.bullets, v.role) }))),
    doc.summary?.content
      ? aiClient
          .rewriteBullet({ bulletText: doc.summary.content, roleTitle: doc.personalInfo.jobTitle })
          .then((r) => r.rewritten)
          .catch(() => doc.summary!.content)
      : Promise.resolve(doc.summary?.content ?? ""),
  ]);

  const rewrittenDoc: ResumeDocument = {
    ...doc,
    summary: { content: rewrittenSummary },
    experience: rewrittenExperience,
    projects: rewrittenProjects,
    volunteer: rewrittenVolunteer,
  };

  return resumeService.saveAiRewrite(resumeId, userId, rewrittenDoc);
}
