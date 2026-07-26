import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { createEmptyResumeDocument } from "@resumeai/shared";
import { renderResumeVisualPdf } from "../pdf-exporter-visual";

describe("renderResumeVisualPdf", () => {
  it("renders a valid PDF with an embedded photo", async () => {
    const photo = await sharp({ create: { width: 480, height: 600, channels: 3, background: { r: 180, g: 180, b: 180 } } })
      .jpeg()
      .toBuffer();

    const doc = createEmptyResumeDocument("Fatima Al Suwaidi", "fatima@example.com");
    doc.personalInfo.jobTitle = "HVAC Engineer";
    doc.summary = { content: "HVAC engineer with 8 years of experience across Dubai high-rise projects." };
    doc.experience = [
      {
        id: "1",
        jobTitle: "Senior HVAC Engineer",
        employer: "Gulf MEP Contracting",
        startDate: "2019-01",
        current: true,
        bullets: ["Led chiller plant commissioning for a 60-story tower", "Reduced energy consumption by 12% via VRF optimization"],
        technologies: [],
      },
    ];
    doc.skills = [{ id: "s1", category: "HVAC", items: ["Chillers", "AHU", "VRF"] }];

    const buffer = await renderResumeVisualPdf(doc, photo);

    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("renders without a photo (photo is optional)", async () => {
    const doc = createEmptyResumeDocument("No Photo Person", "nophoto@example.com");
    const buffer = await renderResumeVisualPdf(doc, null);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("paginates instead of drawing off the page for a long experience list", async () => {
    const doc = createEmptyResumeDocument("Long Resume Person", "long@example.com");
    doc.experience = Array.from({ length: 15 }, (_, i) => ({
      id: `exp-${i}`,
      jobTitle: "Site Engineer",
      employer: `Contractor ${i}`,
      startDate: "2015-01",
      endDate: "2016-01",
      current: false,
      bullets: ["Supervised MEP installation", "Coordinated with subcontractors", "Reviewed shop drawings"],
      technologies: [],
    }));

    const buffer = await renderResumeVisualPdf(doc, null);
    // A single A4 page can't fit 15 multi-bullet entries — this only holds if ensureSpace() actually added pages.
    const pageCountMarker = buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
    expect(pageCountMarker).toBeGreaterThan(1);
  });
});
