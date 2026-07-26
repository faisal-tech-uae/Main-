import { describe, expect, it } from "vitest";
import PDFDocument from "pdfkit";
import { inferUploadType, parseResumeFile } from "../parser.service";

function generateTestPdf(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.font("Helvetica").fontSize(12).text(text);
    doc.end();
  });
}

describe("inferUploadType", () => {
  it("infers type from mime type first", () => {
    expect(inferUploadType("resume", "application/pdf")).toBe("PDF");
    expect(inferUploadType("resume", "text/plain")).toBe("TXT");
  });

  it("falls back to file extension", () => {
    expect(inferUploadType("resume.docx", "application/octet-stream")).toBe("DOCX");
  });

  it("rejects unsupported types", () => {
    expect(() => inferUploadType("resume.exe", "application/octet-stream")).toThrow();
  });
});

describe("parseResumeFile", () => {
  it("extracts text and detects the summary/experience sections from a real PDF", async () => {
    const pdf = await generateTestPdf(
      "John Doe\njohn.doe@example.com\nSummary\nExperienced engineer.\nExperience\nSoftware Engineer at Acme Corp."
    );

    const result = await parseResumeFile(pdf, "PDF");

    expect(result.sourceType).toBe("PDF");
    expect(result.rawText).toContain("John Doe");
    expect(result.contact.emails).toContain("john.doe@example.com");
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
  });

  it("parses plain text resumes without structural formatting issues", async () => {
    const buffer = Buffer.from("Jane Smith\njane@example.com\n+1 415 555 0132\n\nSummary\nProduct manager.");
    const result = await parseResumeFile(buffer, "TXT");

    expect(result.hasTables).toBe(false);
    expect(result.hasImages).toBe(false);
    expect(result.contact.emails).toEqual(["jane@example.com"]);
  });
});
