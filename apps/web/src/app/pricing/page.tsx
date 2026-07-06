import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";

interface PlanConfig {
  id: string;
  plan: "FREE" | "PREMIUM" | "ENTERPRISE";
  priceMonthlyCents: number;
  scanLimit: number;
  features: Record<string, boolean | number>;
}

const FEATURE_LABELS: Record<string, string> = {
  resumeBuilder: "AI Resume Builder",
  atsScans: "ATS Scans",
  coverLetters: "AI Cover Letters",
  interviewCoach: "Interview Coach",
  resumeRewrite: "One-Click Resume Rewrite",
  linkedinOptimizer: "LinkedIn Optimizer",
  teamSeats: "Team Seats",
  prioritySupport: "Priority Support",
};

async function getPlans(): Promise<PlanConfig[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/plans`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div className="min-h-svh bg-background px-6 py-20">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-2 flex items-center justify-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" /> ResumeAI Pro
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Simple, transparent pricing</h1>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when you need unlimited scans and the full AI toolkit.</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(plans.length ? plans : FALLBACK_PLANS).map((plan) => (
          <Card key={plan.plan} className={plan.plan === "PREMIUM" ? "border-primary shadow-md" : undefined}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.plan}
                {plan.plan === "PREMIUM" && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Most popular</span>}
              </CardTitle>
              <p className="text-3xl font-semibold">
                ${(plan.priceMonthlyCents / 100).toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  {plan.scanLimit === -1 ? "Unlimited ATS scans" : `${plan.scanLimit} ATS scans / month`}
                </li>
                {Object.entries(plan.features)
                  .filter(([, v]) => v === true)
                  .map(([key]) => (
                    <li key={key} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {FEATURE_LABELS[key] ?? key}
                    </li>
                  ))}
              </ul>
              <Button asChild className="mt-4 w-full">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const FALLBACK_PLANS: PlanConfig[] = [
  { id: "free", plan: "FREE", priceMonthlyCents: 0, scanLimit: 5, features: { resumeBuilder: true } },
  { id: "premium", plan: "PREMIUM", priceMonthlyCents: 1999, scanLimit: -1, features: { resumeBuilder: true, coverLetters: true, interviewCoach: true, resumeRewrite: true, linkedinOptimizer: true } },
  { id: "enterprise", plan: "ENTERPRISE", priceMonthlyCents: 4999, scanLimit: -1, features: { resumeBuilder: true, coverLetters: true, interviewCoach: true, resumeRewrite: true, linkedinOptimizer: true, teamSeats: true, prioritySupport: true } },
];
