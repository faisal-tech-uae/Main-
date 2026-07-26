import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import { prisma } from "../lib/prisma";

export const plansRouter = Router();

plansRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const plans = await prisma.planConfig.findMany({ where: { isActive: true }, orderBy: { priceMonthlyCents: "asc" } });
    res.json({ data: plans });
  })
);
