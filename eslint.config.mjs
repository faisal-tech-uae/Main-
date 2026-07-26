// Shared flat-config lint baseline for the non-Next.js workspace packages
// (apps/web ships its own eslint.config.mjs via next/core-web-vitals).
// Each covered package/app re-exports this file directly.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.next/**", "**/coverage/**", "**/*.d.ts"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
