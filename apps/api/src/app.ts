import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { clerkWebhookRouter } from "./routes/webhooks/clerk.routes";
import { globalRateLimiter } from "./middleware/rate-limit";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.WEB_APP_URL, credentials: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(globalRateLimiter);

  // Clerk webhooks need the raw body for signature verification, so this is
  // mounted before the global express.json() body parser.
  app.use("/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhookRouter);

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
