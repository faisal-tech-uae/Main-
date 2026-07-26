import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from "docx";
import type { ResumeDocument } from "@resumeai/shared";

function formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
  const end = current ? "Present" : (endDate ?? "");
  return end ? `${startDate} - ${end}` : startDate;
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" } },
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22 })],
  });
}

function entryHeading(title: string, dateRange: string): Paragraph {
  return new Paragraph({
    spacing: { before: 100 },
    children: [
      new TextRun({ text: title, bold: true, size: 21 }),
      ...(dateRange ? [new TextRun({ text: `   ${dateRange}`, size: 20 })] : []),
    ],
  });
}

function bulletParagraphs(bullets: string[]): Paragraph[] {
  return bullets.map((bullet) => new Paragraph({ text: bullet, bullet: { level: 0 } }));
}

/** Single-column, table-free DOCX — same ATS-safety constraints as the PDF exporter. */
export async function renderResumeDocx(doc: ResumeDocument): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: doc.personalInfo.fullName, bold: true, size: 32 })] }),
    new Paragraph({
      text: [doc.personalInfo.email, doc.personalInfo.phone, doc.personalInfo.location, doc.personalInfo.linkedinUrl]
        .filter(Boolean)
        .join("  |  "),
    }),
  ];

  if (doc.summary?.content) {
    children.push(sectionHeading("Summary"), new Paragraph({ text: doc.summary.content }));
  }

  if (doc.experience.length) {
    children.push(sectionHeading("Experience"));
    for (const exp of doc.experience) {
      children.push(entryHeading(`${exp.jobTitle} — ${exp.employer}`, formatDateRange(exp.startDate, exp.endDate, exp.current)));
      children.push(...bulletParagraphs(exp.bullets));
    }
  }

  if (doc.projects.length) {
    children.push(sectionHeading("Projects"));
    for (const proj of doc.projects) {
      children.push(entryHeading(proj.name, formatDateRange(proj.startDate, proj.endDate, proj.current)));
      children.push(...bulletParagraphs(proj.bullets));
    }
  }

  if (doc.education.length) {
    children.push(sectionHeading("Education"));
    for (const edu of doc.education) {
      children.push(
        entryHeading(
          `${edu.degree}${edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""} — ${edu.institution}`,
          formatDateRange(edu.startDate, edu.endDate, edu.current)
        )
      );
    }
  }

  if (doc.certifications.length) {
    children.push(sectionHeading("Certifications"));
    for (const cert of doc.certifications) {
      children.push(new Paragraph({ text: `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ""}` }));
    }
  }

  if (doc.skills.length) {
    children.push(sectionHeading("Skills"));
    for (const group of doc.skills) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${group.category}: `, bold: true }), new TextRun({ text: group.items.join(", ") })],
        })
      );
    }
  }

  if (doc.languages.length) {
    children.push(sectionHeading("Languages"));
    children.push(new Paragraph({ text: doc.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ") }));
  }

  if (doc.awards.length) {
    children.push(sectionHeading("Awards"));
    for (const award of doc.awards) {
      children.push(new Paragraph({ text: `${award.title}${award.issuer ? ` — ${award.issuer}` : ""}` }));
    }
  }

  if (doc.volunteer.length) {
    children.push(sectionHeading("Volunteer Experience"));
    for (const v of doc.volunteer) {
      children.push(entryHeading(`${v.role ?? ""} ${v.organization}`.trim(), formatDateRange(v.startDate, v.endDate, v.current)));
      children.push(...bulletParagraphs(v.bullets));
    }
  }

  for (const custom of doc.customSections) {
    children.push(sectionHeading(custom.title));
    for (const item of custom.items) {
      if (item.heading) children.push(entryHeading(item.heading, item.date ?? ""));
      children.push(...bulletParagraphs(item.bullets));
    }
  }

  const document = new Document({ sections: [{ children }] });
  return Packer.toBuffer(document);
}
