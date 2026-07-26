import rateLimit from "express-rate-limit";

/** General abuse protection for all API routes. */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later." } },
});

/** Tighter limit for expensive AI-backed endpoints, independent of plan quotas. */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many AI requests, slow down and try again shortly." } },
});

/** Stricter limit for unauthenticated/setup routes like file uploads. */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
