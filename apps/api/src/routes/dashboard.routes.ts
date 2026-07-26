import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../lib/async-handler";
import { getDashboardSummary } from "../services/dashboard.service";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const summary = await getDashboardSummary(req.currentUser!.id);
    res.json({ data: summary });
  })
);
