import PDFDocument from "pdfkit";
import type { ResumeDocument } from "@resumeai/shared";

const MARGIN = 50;

function formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
  const end = current ? "Present" : (endDate ?? "");
  return end ? `${startDate} - ${end}` : startDate;
}

/**
 * Renders a single-column, ATS-safe PDF: no tables, no text boxes, no
 * images, no multi-column layout, standard fonts only — everything the ATS
 * engine flags as risky is deliberately absent by construction.
 */
export function renderResumePdf(doc: ResumeDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ margin: MARGIN, size: "A4" });
    const chunks: Buffer[] = [];
    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    pdf.font("Helvetica-Bold").fontSize(20).text(doc.personalInfo.fullName);
    pdf.font("Helvetica").fontSize(10);
    const contactLine = [doc.personalInfo.email, doc.personalInfo.phone, doc.personalInfo.location, doc.personalInfo.linkedinUrl]
      .filter(Boolean)
      .join("  |  ");
    pdf.text(contactLine);
    pdf.moveDown(0.8);

    if (doc.summary?.content) {
      sectionHeading(pdf, "Summary");
      pdf.font("Helvetica").fontSize(10.5).text(doc.summary.content);
      pdf.moveDown(0.6);
    }

    if (doc.experience.length) {
      sectionHeading(pdf, "Experience");
      for (const exp of doc.experience) {
        entryHeading(pdf, `${exp.jobTitle} — ${exp.employer}`, formatDateRange(exp.startDate, exp.endDate, exp.current));
        bulletList(pdf, exp.bullets);
      }
    }

    if (doc.projects.length) {
      sectionHeading(pdf, "Projects");
      for (const proj of doc.projects) {
        entryHeading(pdf, proj.name, formatDateRange(proj.startDate, proj.endDate, proj.current));
        bulletList(pdf, proj.bullets);
      }
    }

    if (doc.education.length) {
      sectionHeading(pdf, "Education");
      for (const edu of doc.education) {
        entryHeading(pdf, `${edu.degree}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""} — ${edu.institution}`, formatDateRange(edu.startDate, edu.endDate, edu.current));
      }
    }

    if (doc.certifications.length) {
      sectionHeading(pdf, "Certifications");
      for (const cert of doc.certifications) {
        pdf.font("Helvetica").fontSize(10.5).text(`${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ""}`);
      }
    }

    if (doc.skills.length) {
      sectionHeading(pdf, "Skills");
      for (const group of doc.skills) {
        pdf.font("Helvetica-Bold").fontSize(10.5).text(`${group.category}: `, { continued: true });
        pdf.font("Helvetica").text(group.items.join(", "));
      }
    }

    if (doc.languages.length) {
      sectionHeading(pdf, "Languages");
      pdf.font("Helvetica").fontSize(10.5).text(doc.languages.map((l) => `${l.language} (${l.proficiency})`).join(", "));
    }

    if (doc.awards.length) {
      sectionHeading(pdf, "Awards");
      for (const award of doc.awards) {
        pdf.font("Helvetica").fontSize(10.5).text(`${award.title}${award.issuer ? ` — ${award.issuer}` : ""}`);
      }
    }

    if (doc.volunteer.length) {
      sectionHeading(pdf, "Volunteer Experience");
      for (const v of doc.volunteer) {
        entryHeading(pdf, `${v.role ?? ""} ${v.organization}`.trim(), formatDateRange(v.startDate, v.endDate, v.current));
        bulletList(pdf, v.bullets);
      }
    }

    if (doc.publications.length) {
      sectionHeading(pdf, "Publications");
      for (const p of doc.publications) {
        pdf.font("Helvetica").fontSize(10.5).text(`${p.title}${p.publisher ? ` — ${p.publisher}` : ""}`);
      }
    }

    if (doc.patents.length) {
      sectionHeading(pdf, "Patents");
      for (const p of doc.patents) {
        pdf.font("Helvetica").fontSize(10.5).text(p.title);
      }
    }

    if (doc.research.length) {
      sectionHeading(pdf, "Research");
      for (const r of doc.research) {
        entryHeading(pdf, r.title, formatDateRange(r.startDate, r.endDate, r.current));
      }
    }

    for (const custom of doc.customSections) {
      sectionHeading(pdf, custom.title);
      for (const item of custom.items) {
        if (item.heading) entryHeading(pdf, item.heading, item.date ?? "");
        bulletList(pdf, item.bullets);
      }
    }

    pdf.end();
  });
}

function sectionHeading(pdf: PDFKit.PDFDocument, title: string) {
  pdf.moveDown(0.4);
  pdf.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(title.toUpperCase());
  pdf.moveTo(MARGIN, pdf.y).lineTo(pdf.page.width - MARGIN, pdf.y).strokeColor("#D1D5DB").stroke();
  pdf.moveDown(0.3);
  pdf.fillColor("#000000");
}

function entryHeading(pdf: PDFKit.PDFDocument, title: string, dateRange: string) {
  pdf.font("Helvetica-Bold").fontSize(10.5).text(title, { continued: true });
  pdf.font("Helvetica").fontSize(10).text(dateRange ? `   ${dateRange}` : "", { align: "left" });
}

function bulletList(pdf: PDFKit.PDFDocument, bullets: string[]) {
  pdf.font("Helvetica").fontSize(10);
  for (const bullet of bullets) {
    pdf.text(`•  ${bullet}`, { indent: 10 });
  }
  pdf.moveDown(0.3);
}
