import { Router } from "express";
import { Webhook } from "svix";
import { asyncHandler } from "../../lib/async-handler";
import { ApiError } from "../../lib/errors";
import { env } from "../../config/env";
import { userRepository } from "../../repositories/user.repository";
import { prisma } from "../../lib/prisma";

export const clerkWebhookRouter = Router();

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
}

/**
 * Mounted with express.raw() body parsing (see app.ts) — svix needs the raw
 * request body, not the JSON-parsed one, to verify the HMAC signature.
 */
clerkWebhookRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const secret = env.CLERK_WEBHOOK_SECRET;
    if (!secret) throw ApiError.badRequest("Clerk webhook secret is not configured");

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];
    if (!svixId || !svixTimestamp || !svixSignature) throw ApiError.badRequest("Missing svix headers");

    const webhook = new Webhook(secret);
    const event = webhook.verify(req.body as Buffer, {
      "svix-id": svixId as string,
      "svix-timestamp": svixTimestamp as string,
      "svix-signature": svixSignature as string,
    }) as ClerkWebhookEvent;

    if (event.type === "user.created" || event.type === "user.updated") {
      await userRepository.upsertFromClerk({
        clerkId: event.data.id,
        email: event.data.email_addresses?.[0]?.email_address ?? `${event.data.id}@unknown.local`,
        firstName: event.data.first_name,
        lastName: event.data.last_name,
        avatarUrl: event.data.image_url,
      });
    } else if (event.type === "user.deleted") {
      await prisma.user.updateMany({ where: { clerkId: event.data.id }, data: { deletedAt: new Date() } });
    }

    res.status(200).json({ received: true });
  })
);
