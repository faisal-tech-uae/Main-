"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppTopbar() {
  return (
    <header className="flex h-16 items-center justify-end gap-2 border-b border-border px-6">
      <ThemeToggle />
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
