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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
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
