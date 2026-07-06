import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/errors";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Route not found" } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: { message: err.message, details: err.details } });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: { message: "Validation failed", details: err.flatten() } });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: { message: "Internal server error" } });
}
