import sharp from "sharp";
import { resumeDocumentSchema, type ResumeDocument } from "@resumeai/shared";
import { resumeService } from "./resume.service";
import { storage } from "../lib/storage";
import { ApiError } from "../lib/errors";

// A 4:5 ratio (e.g. 480x600) is the standard professional headshot crop used
// on UAE CVs — tighter than a square selfie, taller than a passport photo.
const HEADSHOT_WIDTH = 480;
const HEADSHOT_HEIGHT = 600;
const JPEG_QUALITY = 90;

/**
 * "Good quality photo" here means: auto-orient (respect the phone's EXIF
 * rotation), crop/cover to a standard headshot ratio, sharpen, and normalize
 * exposure — real, deterministic image processing rather than a generative
 * AI re-paint of the person's face.
 */
export async function processHeadshot(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // auto-orient using EXIF, then strip it
    .resize(HEADSHOT_WIDTH, HEADSHOT_HEIGHT, { fit: "cover", position: "attention" })
    .normalize()
    .sharpen()
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

export async function uploadResumePhoto(userId: string, resumeId: string, fileBuffer: Buffer) {
  const resume = await resumeService.getById(resumeId, userId);
  const doc = resume.currentVersion?.data as unknown as ResumeDocument;
  if (!doc) throw ApiError.badRequest("Resume has no content yet");

  let processed: Buffer;
  try {
    processed = await processHeadshot(fileBuffer);
  } catch {
    throw ApiError.badRequest("Couldn't process this image — try a clearer JPEG or PNG photo");
  }

  const storageKey = await storage.put("headshot.jpg", processed);
  const photoUrl = `/api/resumes/${resumeId}/photo/${storageKey}`;

  const updatedDoc = resumeDocumentSchema.parse({
    ...doc,
    personalInfo: { ...doc.personalInfo, photoUrl },
  });

  return resumeService.updateContent(resumeId, userId, updatedDoc, "Uploaded profile photo");
}

export async function getResumePhoto(userId: string, resumeId: string, storageKey: string): Promise<Buffer> {
  const resume = await resumeService.getById(resumeId, userId); // ownership check
  const doc = resume.currentVersion?.data as unknown as ResumeDocument | undefined;
  const expectedUrl = `/api/resumes/${resumeId}/photo/${storageKey}`;
  if (!doc?.personalInfo.photoUrl || doc.personalInfo.photoUrl !== expectedUrl) {
    throw ApiError.notFound("Photo not found");
  }
  return storage.get(storageKey);
}
