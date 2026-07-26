import { subscriptionRepository } from "../repositories/subscription.repository";
import { ApiError } from "../lib/errors";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Enforces the per-plan monthly ATS scan quota (Free: 5/month, Premium/
 * Enterprise: unlimited via scanLimit = -1). Rolls the usage counter over
 * automatically once the current period has elapsed.
 */
export async function assertScanQuotaAndIncrement(userId: string): Promise<void> {
  const subscription = await subscriptionRepository.findByUserId(userId);
  if (!subscription) throw ApiError.forbidden("No subscription found for this account");

  const periodExpired = subscription.periodEnd ? subscription.periodEnd.getTime() < Date.now() : false;
  const periodStaleByAge = Date.now() - subscription.periodStart.getTime() > ONE_MONTH_MS;

  if (periodExpired || periodStaleByAge) {
    await subscriptionRepository.resetPeriod(userId, new Date(Date.now() + ONE_MONTH_MS));
  }

  const current = periodExpired || periodStaleByAge ? 0 : subscription.scansUsedThisPeriod;

  if (subscription.scanLimit !== -1 && current >= subscription.scanLimit) {
    throw ApiError.tooManyRequests(
      `You've reached your plan's limit of ${subscription.scanLimit} ATS scans this month. Upgrade to Premium for unlimited scans.`
    );
  }

  await subscriptionRepository.incrementScanUsage(userId);
}

export function assertFeatureEnabled(plan: string, feature: "coverLetters" | "interviewCoach" | "resumeRewrite" | "linkedinOptimizer") {
  if (plan === "FREE") {
    throw ApiError.forbidden(`The "${feature}" feature requires a Premium subscription.`);
  }
}
