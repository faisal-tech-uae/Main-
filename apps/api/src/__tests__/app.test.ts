import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("app", () => {
  it("responds to health checks", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("rejects protected routes without a bearer token", async () => {
    const res = await request(app).get("/api/resumes");
    expect(res.status).toBe(401);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });
});
