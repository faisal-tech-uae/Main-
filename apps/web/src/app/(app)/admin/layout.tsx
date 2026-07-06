"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useResource } from "@/hooks/use-resource";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/prompts", label: "Prompt Management" },
  { href: "/admin/ai-usage", label: "AI Usage" },
  { href: "/admin/logs", label: "System Logs" },
];

interface MeResponse {
  user: { role: string };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: me, loading } = useResource<MeResponse>("/api/account/me");

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  if (!me || (me.user.role !== "ADMIN" && me.user.role !== "SUPER_ADMIN")) {
    return <p className="text-muted-foreground">You don&apos;t have access to the admin panel.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <nav className="flex flex-wrap gap-2 border-b border-border pb-2">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
