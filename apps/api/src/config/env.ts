import { z } from "zod";

/** Treats an empty string the same as an unset variable, so `KEY=` in a .env file doesn't fail `.optional()`. */
const optionalString = () =>
  z.preprocess((val) => (val === "" ? undefined : val), z.string().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: optionalString(),
  CLERK_PUBLISHABLE_KEY: optionalString(),
  WEB_APP_URL: z.string().default("http://localhost:3000"),
  OPENAI_API_KEY: optionalString(),
  ANTHROPIC_API_KEY: optionalString(),
  GEMINI_API_KEY: optionalString(),
  AI_PROVIDER: z.preprocess((val) => (val === "" ? undefined : val), z.enum(["OPENAI", "ANTHROPIC", "GEMINI"]).optional()),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(10),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}

export const env = loadEnv();
