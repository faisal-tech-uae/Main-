import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler";
import { validateBody } from "../../middleware/validate";
import { subscriptionRepository } from "../../repositories/subscription.repository";
import { prisma } from "../../lib/prisma";

export const adminSubscriptionsRouter = Router();

adminSubscriptionsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const subscriptions = await subscriptionRepository.listAllWithUser();
    res.json({ data: subscriptions });
  })
);

adminSubscriptionsRouter.get(
  "/plans",
  asyncHandler(async (_req, res) => {
    const plans = await prisma.planConfig.findMany({ orderBy: { priceMonthlyCents: "asc" } });
    res.json({ data: plans });
  })
);

const updatePlanSchema = z.object({
  priceMonthlyCents: z.number().int().min(0).optional(),
  priceYearlyCents: z.number().int().min(0).optional(),
  scanLimit: z.number().int().optional(),
  features: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

adminSubscriptionsRouter.put(
  "/plans/:plan",
  validateBody(updatePlanSchema),
  asyncHandler(async (req, res) => {
    const plan = await prisma.planConfig.update({
      where: { plan: req.params.plan as never },
      data: req.body as never,
    });
    res.json({ data: plan });
  })
);

const changeUserPlanSchema = z.object({ plan: z.enum(["FREE", "PREMIUM", "ENTERPRISE"]), scanLimit: z.number().int() });

adminSubscriptionsRouter.put(
  "/:userId",
  validateBody(changeUserPlanSchema),
  asyncHandler(async (req, res) => {
    const subscription = await subscriptionRepository.updatePlan(req.params.userId, req.body.plan, req.body.scanLimit);
    res.json({ data: subscription });
  })
);
