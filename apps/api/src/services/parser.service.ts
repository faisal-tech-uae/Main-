import type { ParsedResumeStructure } from "@resumeai/ats-engine";
import { extractPdfStructure } from "./parser/pdf-parser";
import { extractDocxStructure } from "./parser/docx-parser";
import { detectSections } from "./parser/section-detector";
import { extractContactInfo } from "./parser/contact-extractor";
import { ApiError } from "../lib/errors";

export type SupportedUploadType = "PDF" | "DOCX" | "TXT";

export function inferUploadType(originalName: string, mimeType: string): SupportedUploadType {
  const ext = originalName.split(".").pop()?.toLowerCase();
  if (mimeType === "application/pdf" || ext === "pdf") return "PDF";
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  )
    return "DOCX";
  if (mimeType === "text/plain" || ext === "txt") return "TXT";
  throw ApiError.badRequest("Unsupported file type. Upload a PDF, DOCX, or TXT resume.");
}

export async function parseResumeFile(buffer: Buffer, uploadType: SupportedUploadType): Promise<ParsedResumeStructure> {
  if (uploadType === "PDF") {
    const pdf = await extractPdfStructure(buffer);
    return {
      rawText: pdf.rawText,
      sourceType: "PDF",
      pageCount: pdf.pageCount,
      detectedFonts: pdf.detectedFonts,
      hasTables: pdf.hasTables,
      hasMultipleColumns: pdf.hasMultipleColumns,
      hasImages: pdf.hasImages,
      hasHeaderContent: false, // not reliably detectable from pdf.js text layer alone
      hasFooterContent: false,
      hasTextBoxes: false,
      unsupportedCharacterCount: pdf.unsupportedCharacterCount,
      detectedSections: detectSections(pdf.rawText),
      contact: extractContactInfo(pdf.rawText),
    };
  }

  if (uploadType === "DOCX") {
    const docx = await extractDocxStructure(buffer);
    return {
      rawText: docx.rawText,
      sourceType: "DOCX",
      pageCount: estimatePageCount(docx.rawText),
      detectedFonts: docx.detectedFonts,
      hasTables: docx.hasTables,
      hasMultipleColumns: docx.hasMultipleColumns,
      hasImages: docx.hasImages,
      hasHeaderContent: docx.hasHeaderContent,
      hasFooterContent: docx.hasFooterContent,
      hasTextBoxes: docx.hasTextBoxes,
      unsupportedCharacterCount: 0,
      detectedSections: detectSections(docx.rawText),
      contact: extractContactInfo(docx.rawText),
    };
  }

  const rawText = buffer.toString("utf-8");
  return {
    rawText,
    sourceType: "TXT",
    pageCount: estimatePageCount(rawText),
    detectedFonts: [],
    hasTables: false,
    hasMultipleColumns: false,
    hasImages: false,
    hasHeaderContent: false,
    hasFooterContent: false,
    hasTextBoxes: false,
    unsupportedCharacterCount: 0,
    detectedSections: detectSections(rawText),
    contact: extractContactInfo(rawText),
  };
}

function estimatePageCount(text: string): number {
  const wordsPerPage = 500;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerPage));
}
