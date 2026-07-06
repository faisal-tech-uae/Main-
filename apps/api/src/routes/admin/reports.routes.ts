import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { prisma } from "../../lib/prisma";

export const adminReportsRouter = Router();

adminReportsRouter.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [userCount, resumeCount, scanCount, premiumCount, coverLetterCount, interviewSessionCount] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.resume.count({ where: { deletedAt: null } }),
      prisma.atsAnalysis.count(),
      prisma.subscription.count({ where: { plan: { in: ["PREMIUM", "ENTERPRISE"] }, status: "ACTIVE" } }),
      prisma.coverLetter.count(),
      prisma.interviewSession.count(),
    ]);

    const mrrCents = await prisma.subscription
      .findMany({ where: { status: "ACTIVE" }, include: { user: false } })
      .then(async (subs) => {
        const plans = await prisma.planConfig.findMany();
        const priceByPlan = Object.fromEntries(plans.map((p) => [p.plan, p.priceMonthlyCents]));
        return subs.reduce((sum, s) => sum + (priceByPlan[s.plan] ?? 0), 0);
      });

    res.json({
      data: {
        userCount,
        resumeCount,
        scanCount,
        premiumCount,
        coverLetterCount,
        interviewSessionCount,
        estimatedMrrCents: mrrCents,
      },
    });
  })
);
