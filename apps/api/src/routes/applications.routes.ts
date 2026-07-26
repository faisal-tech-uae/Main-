import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../lib/async-handler";
import { applicationRepository } from "../repositories/application.repository";

export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);

const createSchema = z.object({
  company: z.string().min(1),
  roleTitle: z.string().min(1),
  resumeId: z.string().optional(),
  status: z.enum(["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]).optional(),
  notes: z.string().optional(),
});

const statusSchema = z.object({ status: z.enum(["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]) });

applicationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const applications = await applicationRepository.listForUser(req.currentUser!.id);
    res.json({ data: applications });
  })
);

applicationsRouter.post(
  "/",
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const application = await applicationRepository.create(req.currentUser!.id, req.body);
    res.status(201).json({ data: application });
  })
);

applicationsRouter.patch(
  "/:id/status",
  validateBody(statusSchema),
  asyncHandler(async (req, res) => {
    await applicationRepository.updateStatus(req.params.id, req.currentUser!.id, req.body.status);
    res.status(204).send();
  })
);
