import type { NextFunction, Request, Response } from "express";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { assertFeatureEnabled } from "../services/subscription.service";
import { ApiError } from "../lib/errors";
import { asyncHandler } from "../lib/async-handler";

type PremiumFeature = "coverLetters" | "interviewCoach" | "resumeRewrite" | "linkedinOptimizer";

/** Gates a route behind a Premium-only feature flag, based on the caller's current subscription plan. */
export function requirePlanFeature(feature: PremiumFeature) {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const subscription = await subscriptionRepository.findByUserId(req.currentUser!.id);
    if (!subscription) throw ApiError.forbidden("No subscription found for this account");
    assertFeatureEnabled(subscription.plan, feature);
    next();
  });
}
