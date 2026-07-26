import PDFDocument from "pdfkit";
import type { ResumeDocument } from "@resumeai/shared";

const PAGE_WIDTH = 595.28; // A4 at 72dpi
const PAGE_HEIGHT = 841.89;
const SIDEBAR_WIDTH = 190;
const SIDEBAR_PADDING = 24;
const MAIN_X = SIDEBAR_WIDTH + 36;
const MAIN_WIDTH = PAGE_WIDTH - MAIN_X - 40;

function formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
  const end = current ? "Present" : (endDate ?? "");
  return end ? `${startDate} – ${end}` : startDate;
}

/**
 * A visually designed, human-recruiter-facing CV: photo, colored sidebar,
 * two columns. Deliberately NOT ATS-safe (columns + a photo are exactly what
 * the ATS engine flags elsewhere) — this is the "non-ATS" variant for
 * emailing directly to a hiring manager or printing, not for portal upload.
 */
export function renderResumeVisualPdf(doc: ResumeDocument, photoBuffer: Buffer | null, accentColor = "#1E3A5F"): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];
    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    pdf.rect(0, 0, SIDEBAR_WIDTH, PAGE_HEIGHT).fill(accentColor);

    let sidebarY = SIDEBAR_PADDING;

    if (photoBuffer) {
      const photoSize = SIDEBAR_WIDTH - SIDEBAR_PADDING * 2;
      pdf.save();
      pdf.image(photoBuffer, SIDEBAR_PADDING, sidebarY, { width: photoSize, height: photoSize * 1.25, fit: [photoSize, photoSize * 1.25] });
      pdf.restore();
      sidebarY += photoSize * 1.25 + 20;
    }

    sidebarY = sidebarSection(pdf, "Contact", sidebarY, [
      doc.personalInfo.email,
      doc.personalInfo.phone,
      doc.personalInfo.location,
      doc.personalInfo.linkedinUrl,
    ]);

    if (doc.skills.length) {
      sidebarY = sidebarSection(
        pdf,
        "Skills",
        sidebarY,
        doc.skills.flatMap((s) => s.items)
      );
    }

    if (doc.languages.length) {
      sidebarY = sidebarSection(
        pdf,
        "Languages",
        sidebarY,
        doc.languages.map((l) => `${l.language} (${l.proficiency})`)
      );
    }

    if (doc.certifications.length) {
      sidebarSection(
        pdf,
        "Certifications",
        sidebarY,
        doc.certifications.map((c) => c.name)
      );
    }

    // Main column
    let y = 40;
    pdf.fillColor("#111827").font("Helvetica-Bold").fontSize(24).text(doc.personalInfo.fullName || "Your Name", MAIN_X, y, { width: MAIN_WIDTH });
    y = pdf.y + 2;
    if (doc.personalInfo.jobTitle) {
      pdf.font("Helvetica").fontSize(13).fillColor(accentColor).text(doc.personalInfo.jobTitle, MAIN_X, y, { width: MAIN_WIDTH });
      y = pdf.y + 10;
    } else {
      y += 10;
    }

    if (doc.summary?.content) {
      y = mainSectionHeading(pdf, "Profile", y, accentColor);
      pdf.font("Helvetica").fontSize(10).fillColor("#1F2937").text(doc.summary.content, MAIN_X, y, { width: MAIN_WIDTH });
      y = pdf.y + 10;
    }

    if (doc.experience.length) {
      y = mainSectionHeading(pdf, "Experience", y, accentColor);
      for (const exp of doc.experience) {
        y = mainEntry(pdf, `${exp.jobTitle} — ${exp.employer}`, formatDateRange(exp.startDate, exp.endDate, exp.current), exp.bullets, y, accentColor);
      }
    }

    if (doc.projects.length) {
      y = mainSectionHeading(pdf, "Key Projects", y, accentColor);
      for (const proj of doc.projects) {
        y = mainEntry(pdf, proj.name, formatDateRange(proj.startDate, proj.endDate, proj.current), proj.bullets, y, accentColor);
      }
    }

    if (doc.education.length) {
      y = mainSectionHeading(pdf, "Education", y, accentColor);
      for (const edu of doc.education) {
        y = mainEntry(
          pdf,
          `${edu.degree}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""} — ${edu.institution}`,
          formatDateRange(edu.startDate, edu.endDate, edu.current),
          [],
          y,
          accentColor
        );
      }
    }

    if (doc.awards.length) {
      y = mainSectionHeading(pdf, "Awards", y, accentColor);
      for (const award of doc.awards) {
        y = mainEntry(pdf, `${award.title}${award.issuer ? ` — ${award.issuer}` : ""}`, award.date ?? "", [], y, accentColor);
      }
    }

    pdf.end();
  });
}

function sidebarSection(pdf: PDFKit.PDFDocument, title: string, startY: number, items: (string | undefined)[]): number {
  const filtered = items.filter((i): i is string => Boolean(i && i.trim()));
  if (filtered.length === 0) return startY;

  let y = startY;
  pdf
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(10.5)
    .text(title.toUpperCase(), SIDEBAR_PADDING, y, { width: SIDEBAR_WIDTH - SIDEBAR_PADDING * 2 });
  y = pdf.y + 4;

  pdf.font("Helvetica").fontSize(9).fillColor("#E5E7EB");
  for (const item of filtered) {
    pdf.text(item, SIDEBAR_PADDING, y, { width: SIDEBAR_WIDTH - SIDEBAR_PADDING * 2 });
    y = pdf.y + 3;
  }

  return y + 14;
}

/**
 * pdfkit doesn't auto-paginate content drawn at explicit x/y coordinates, so
 * every main-column write checks remaining space first. A continued page
 * gets a plain sidebar-color strip (no photo/contact repeat, matching how
 * printed multi-page CVs usually handle this) so the two-column look holds.
 */
function ensureSpace(pdf: PDFKit.PDFDocument, y: number, needed: number, accentColor: string): number {
  if (y + needed <= PAGE_HEIGHT - 40) return y;
  pdf.addPage();
  pdf.rect(0, 0, SIDEBAR_WIDTH, PAGE_HEIGHT).fill(accentColor);
  return 40;
}

function mainSectionHeading(pdf: PDFKit.PDFDocument, title: string, startY: number, accentColor: string): number {
  const y = ensureSpace(pdf, startY, 40, accentColor);
  pdf
    .fillColor(accentColor)
    .font("Helvetica-Bold")
    .fontSize(12.5)
    .text(title.toUpperCase(), MAIN_X, y, { width: MAIN_WIDTH });
  const lineY = pdf.y + 2;
  pdf.moveTo(MAIN_X, lineY).lineTo(MAIN_X + MAIN_WIDTH, lineY).strokeColor(accentColor).lineWidth(1).stroke();
  return lineY + 8;
}

function mainEntry(pdf: PDFKit.PDFDocument, title: string, dateRange: string, bullets: string[], startY: number, accentColor = "#1E3A5F"): number {
  const estimatedHeight = 24 + bullets.length * 14;
  const y = ensureSpace(pdf, startY, estimatedHeight, accentColor);

  pdf.font("Helvetica-Bold").fontSize(10.5).fillColor("#111827").text(title, MAIN_X, y, { width: MAIN_WIDTH, continued: false });
  let cursorY = pdf.y;
  if (dateRange) {
    pdf.font("Helvetica-Oblique").fontSize(9).fillColor("#6B7280").text(dateRange, MAIN_X, cursorY, { width: MAIN_WIDTH });
    cursorY = pdf.y;
  }
  cursorY += 2;

  pdf.font("Helvetica").fontSize(9.5).fillColor("#1F2937");
  for (const bullet of bullets) {
    pdf.text(`•  ${bullet}`, MAIN_X + 6, cursorY, { width: MAIN_WIDTH - 6 });
    cursorY = pdf.y + 1;
  }

  return cursorY + 8;
}
