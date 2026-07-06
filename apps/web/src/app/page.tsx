import Link from "next/link";
import { ArrowRight, ScanSearch, FileText, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description: "Every section — experience, projects, publications, patents, custom sections — with a live ATS-safe preview.",
  },
  {
    icon: ScanSearch,
    title: "ATS Scanner",
    description: "Upload a PDF, DOCX, or TXT resume and get a structural + AI analysis: tables, columns, fonts, missing sections, grammar, and more.",
  },
  {
    icon: Target,
    title: "Hybrid Scoring Engine",
    description: "Three distinct scores — ATS Pass, Recruiter Appeal, and Role Match — plus a simulation of how 11 major ATS platforms would parse your resume.",
  },
  {
    icon: Sparkles,
    title: "AI Career Toolkit",
    description: "Cover letters, LinkedIn optimization, interview prep with STAR answers, and fact-preserving resume rewrites.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" />
          ResumeAI Pro
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Resumes that pass the machine <span className="text-primary">and</span> impress the recruiter
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          A rule-based + AI hybrid scoring engine that simulates how Greenhouse, Workday, Oracle Taleo, and 8 other
          major ATS platforms actually parse your resume — then tells you exactly why points were deducted.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Build my resume <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-up">Scan an existing resume</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
            <feature.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ResumeAI Pro. All rights reserved.
      </footer>
    </div>
  );
}
