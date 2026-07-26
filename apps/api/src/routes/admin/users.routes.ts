import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler";
import { validateQuery } from "../../middleware/validate";
import { userRepository } from "../../repositories/user.repository";

export const adminUsersRouter = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

adminUsersRouter.get(
  "/",
  validateQuery(listQuerySchema),
  asyncHandler(async (req, res) => {
    const { page, pageSize, search } = req.query as unknown as z.infer<typeof listQuerySchema>;
    const [users, total] = await userRepository.listPaginated({ page, pageSize, search });
    res.json({ data: users, meta: { page, pageSize, total } });
  })
);

adminUsersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await userRepository.softDelete(req.params.id);
    res.status(204).send();
  })
);
