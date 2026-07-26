import type { NextFunction, Request, Response } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { env } from "../config/env";
import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../lib/errors";
import { asyncHandler } from "../lib/async-handler";

const clerkClient = env.CLERK_SECRET_KEY ? createClerkClient({ secretKey: env.CLERK_SECRET_KEY }) : null;

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

/**
 * Verifies the Clerk session JWT and syncs/loads the local User row.
 * Auth is required for every route this middleware guards.
 */
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);
  if (!token) throw ApiError.unauthorized("Missing bearer token");
  if (!env.CLERK_SECRET_KEY || !clerkClient) {
    throw ApiError.unauthorized("Authentication is not configured on this server");
  }

  let clerkUserId: string;
  try {
    const verified = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
    clerkUserId = verified.sub;
  } catch {
    throw ApiError.unauthorized("Invalid or expired session");
  }

  req.auth = { clerkUserId };

  let user = await userRepository.findByClerkId(clerkUserId);
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    user = await userRepository.upsertFromClerk({
      clerkId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUserId}@unknown.local`,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      avatarUrl: clerkUser.imageUrl,
    });
  }

  if (user.deletedAt) throw ApiError.forbidden("This account has been deleted");

  req.currentUser = user;
  next();
});

export const requireAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.currentUser || (req.currentUser.role !== "ADMIN" && req.currentUser.role !== "SUPER_ADMIN")) {
    throw ApiError.forbidden("Admin access required");
  }
  next();
});
