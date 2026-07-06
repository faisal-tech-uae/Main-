import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";

/**
 * Minimal local-disk object storage. Swap this module for an S3/R2-backed
 * implementation in production by keeping the same `put`/`get` contract —
 * nothing else in the codebase should need to change.
 */
export const storage = {
  async put(originalName: string, buffer: Buffer): Promise<string> {
    await mkdir(env.UPLOAD_DIR, { recursive: true });
    const key = `${randomUUID()}-${sanitizeFileName(originalName)}`;
    await writeFile(path.join(env.UPLOAD_DIR, key), buffer);
    return key;
  },

  async get(key: string): Promise<Buffer> {
    return readFile(path.join(env.UPLOAD_DIR, key));
  },
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}
