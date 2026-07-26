import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { auditLogRepository } from "../../repositories/audit-log.repository";

export const adminLogsRouter = Router();

adminLogsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const logs = await auditLogRepository.listRecent(200);
    res.json({ data: logs });
  })
);
