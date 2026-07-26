import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler";
import { validateBody } from "../../middleware/validate";
import { templateRepository } from "../../repositories/template.repository";

export const adminTemplatesRouter = Router();

adminTemplatesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const templates = await templateRepository.listAll();
    res.json({ data: templates });
  })
);

const createSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  isPremium: z.boolean().default(false),
  previewImage: z.string().optional(),
  layoutConfig: z.record(z.unknown()),
});

adminTemplatesRouter.post(
  "/",
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    const template = await templateRepository.create(req.body as never);
    res.status(201).json({ data: template });
  })
);

adminTemplatesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const template = await templateRepository.update(req.params.id, req.body);
    res.json({ data: template });
  })
);

adminTemplatesRouter.patch(
  "/:id/active",
  validateBody(z.object({ isActive: z.boolean() })),
  asyncHandler(async (req, res) => {
    const template = await templateRepository.setActive(req.params.id, req.body.isActive);
    res.json({ data: template });
  })
);
