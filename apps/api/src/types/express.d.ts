import type { User } from "@resumeai/db";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        clerkUserId: string;
      };
      currentUser?: User;
    }
  }
}

export {};
