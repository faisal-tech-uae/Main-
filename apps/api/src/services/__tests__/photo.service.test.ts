import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { processHeadshot } from "../photo.service";

describe("processHeadshot", () => {
  it("crops to the standard 4:5 headshot ratio and outputs a JPEG", async () => {
    // A synthetic 1200x1200 square "photo" to process — real uploads vary in
    // aspect ratio and orientation, this just needs to exercise the pipeline.
    const source = await sharp({
      create: { width: 1200, height: 1200, channels: 3, background: { r: 200, g: 150, b: 100 } },
    })
      .jpeg()
      .toBuffer();

    const result = await processHeadshot(source);
    const metadata = await sharp(result).metadata();

    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(480);
    expect(metadata.height).toBe(600);
  });

  it("rejects non-image input instead of hanging", async () => {
    await expect(processHeadshot(Buffer.from("not an image"))).rejects.toThrow();
  });
});
