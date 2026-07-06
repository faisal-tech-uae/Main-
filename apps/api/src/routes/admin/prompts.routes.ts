import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler";
import { validateBody } from "../../middleware/validate";
import { promptRepository } from "../../repositories/prompt.repository";

export const adminPromptsRouter = Router();

adminPromptsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const prompts = await promptRepository.listAll();
    res.json({ data: prompts });
  })
);

const updateSchema = z.object({
  systemPrompt: z.string().min(1).optional(),
  userPromptTemplate: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

adminPromptsRouter.put(
  "/:feature",
  validateBody(updateSchema),
  asyncHandler(async (req, res) => {
    const prompt = await promptRepository.update(req.params.feature as never, {
      ...req.body,
      updatedBy: req.currentUser!.id,
    });
    res.json({ data: prompt });
  })
);
