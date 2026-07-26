"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

export function AppTopbar() {
  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b border-border px-4 sm:px-6">
      <MobileNav />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
