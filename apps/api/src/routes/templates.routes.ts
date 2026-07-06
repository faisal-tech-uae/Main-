import { Router } from "express";
import { templateRepository } from "../repositories/template.repository";
import { asyncHandler } from "../lib/async-handler";

export const templatesRouter = Router();

templatesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === "string" ? (req.query.category as never) : undefined;
    const templates = await templateRepository.listActive(category);
    res.json({ data: templates });
  })
);
