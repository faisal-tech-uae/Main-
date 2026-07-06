// Uses pdf.js directly (legacy Node build) so we get access to per-item text
// position and font metadata — needed to detect columns/tables/fonts, which
// higher-level wrappers like pdf-parse don't expose.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfjs = require("pdfjs-dist/legacy/build/pdf.mjs");

interface TextItem {
  str: string;
  transform: number[]; // [a, b, c, d, e, f] — e/f are x/y position
  fontName: string;
  width: number;
  height: number;
}

export interface PdfExtractionResult {
  rawText: string;
  pageCount: number;
  detectedFonts: string[];
  hasMultipleColumns: boolean;
  hasImages: boolean;
  hasTables: boolean;
  unsupportedCharacterCount: number;
}

const UNSUPPORTED_CHAR_REGEX = /[^\x09\x0A\x0D\x20-\x7E -ɏ‘’“”–—]/g;

export async function extractPdfStructure(buffer: Buffer): Promise<PdfExtractionResult> {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const doc = await loadingTask.promise;

  const fontNames = new Set<string>();
  const textLines: string[] = [];
  let imageCount = 0;
  let columnSignalPages = 0;
  let tableSignalPages = 0;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const [textContent, operatorList] = await Promise.all([page.getTextContent(), page.getOperatorList()]);

    const items = textContent.items as TextItem[];
    for (const item of items) {
      if (item.fontName) fontNames.add(item.fontName);
      if (item.str) textLines.push(item.str);
    }

    // Column detection: cluster distinct left-edge (x) starting positions of
    // lines. Two or more well-separated, frequently reused x-clusters with
    // enough occurrences suggests a multi-column layout rather than ragged
    // paragraph text.
    const xPositions = items.filter((i) => i.str.trim().length > 0).map((i) => Math.round(i.transform[4] / 5) * 5);
    const clusters = clusterPositions(xPositions);
    if (clusters.length >= 2 && clusters[0].count > 5 && clusters[1].count > 5) {
      columnSignalPages++;
    }

    // Table detection: many items sharing near-identical y positions with
    // 3+ distinct x positions (row of cells) repeated across several rows.
    const rows = groupByY(items);
    const gridLikeRows = rows.filter((row) => row.length >= 3);
    if (gridLikeRows.length >= 3) {
      tableSignalPages++;
    }

    for (const op of operatorList.fnArray as number[]) {
      if (op === pdfjs.OPS.paintImageXObject || op === pdfjs.OPS.paintJpegXObject) {
        imageCount++;
      }
    }
  }

  const rawText = textLines.join(" ");
  const unsupportedMatches = rawText.match(UNSUPPORTED_CHAR_REGEX);

  return {
    rawText,
    pageCount: doc.numPages,
    detectedFonts: [...fontNames],
    hasMultipleColumns: columnSignalPages > 0,
    hasImages: imageCount > 0,
    hasTables: tableSignalPages > 0,
    unsupportedCharacterCount: unsupportedMatches?.length ?? 0,
  };
}

function clusterPositions(positions: number[]): Array<{ x: number; count: number }> {
  const counts = new Map<number, number>();
  for (const x of positions) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts.entries()].map(([x, count]) => ({ x, count })).sort((a, b) => b.count - a.count);
}

function groupByY(items: TextItem[]): TextItem[][] {
  const rows = new Map<number, TextItem[]>();
  for (const item of items) {
    if (!item.str.trim()) continue;
    const y = Math.round(item.transform[5]);
    const bucket = rows.get(y) ?? [];
    bucket.push(item);
    rows.set(y, bucket);
  }
  return [...rows.values()];
}
