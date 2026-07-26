import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middleware/auth";
import { adminUsersRouter } from "./users.routes";
import { adminSubscriptionsRouter } from "./subscriptions.routes";
import { adminTemplatesRouter } from "./templates.routes";
import { adminPromptsRouter } from "./prompts.routes";
import { adminLogsRouter } from "./logs.routes";
import { adminAiUsageRouter } from "./ai-usage.routes";
import { adminReportsRouter } from "./reports.routes";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/subscriptions", adminSubscriptionsRouter);
adminRouter.use("/templates", adminTemplatesRouter);
adminRouter.use("/prompts", adminPromptsRouter);
adminRouter.use("/logs", adminLogsRouter);
adminRouter.use("/ai-usage", adminAiUsageRouter);
adminRouter.use("/reports", adminReportsRouter);
