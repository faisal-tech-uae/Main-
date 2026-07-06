"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ScanSearch,
  LayoutTemplate,
  Mail,
  MessageSquareText,
  Linkedin,
  Briefcase,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resumes", label: "Resume Builder", icon: FileText },
  { href: "/scanner", label: "ATS Scanner", icon: ScanSearch },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/interview-prep", label: "Interview Prep", icon: MessageSquareText },
  { href: "/linkedin-optimizer", label: "LinkedIn Optimizer", icon: Linkedin },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-semibold tracking-tight">ResumeAI Pro</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
