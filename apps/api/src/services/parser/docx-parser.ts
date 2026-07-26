import mammoth from "mammoth";
import JSZip from "jszip";

export interface DocxExtractionResult {
  rawText: string;
  hasTables: boolean;
  hasImages: boolean;
  hasHeaderContent: boolean;
  hasFooterContent: boolean;
  hasTextBoxes: boolean;
  hasMultipleColumns: boolean;
  detectedFonts: string[];
}

export async function extractDocxStructure(buffer: Buffer): Promise<DocxExtractionResult> {
  const [{ value: rawText }, zip] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    JSZip.loadAsync(buffer),
  ]);

  const documentXml = await zip.file("word/document.xml")?.async("string");
  const stylesXml = await zip.file("word/styles.xml")?.async("string");

  const hasHeaderContent = Object.keys(zip.files).some((name) => /word\/header\d*\.xml$/.test(name));
  const hasFooterContent = Object.keys(zip.files).some((name) => /word\/footer\d*\.xml$/.test(name));
  const hasImages = Object.keys(zip.files).some((name) => name.startsWith("word/media/"));

  const hasTables = documentXml?.includes("<w:tbl") ?? false;
  const hasTextBoxes = (documentXml?.includes("<w:txbxContent") || documentXml?.includes("<v:textbox")) ?? false;
  // <w:cols w:num="2".../> (num > 1) indicates a multi-column section.
  const columnsMatch = documentXml?.match(/<w:cols[^>]*w:num="(\d+)"/);
  const hasMultipleColumns = columnsMatch ? parseInt(columnsMatch[1], 10) > 1 : false;

  const fontMatches = stylesXml ? [...stylesXml.matchAll(/w:ascii="([^"]+)"/g)].map((m) => m[1]) : [];
  const detectedFonts = [...new Set(fontMatches)];

  return {
    rawText,
    hasTables,
    hasImages,
    hasHeaderContent,
    hasFooterContent,
    hasTextBoxes,
    hasMultipleColumns,
    detectedFonts,
  };
}
