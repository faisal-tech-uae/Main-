"use client";

import { useResource } from "@/hooks/use-resource";
import { Card, CardContent } from "@/components/ui/card";

interface ReportsOverview {
  userCount: number;
  resumeCount: number;
  scanCount: number;
  premiumCount: number;
  coverLetterCount: number;
  interviewSessionCount: number;
  estimatedMrrCents: number;
}

export default function AdminOverviewPage() {
  const { data } = useResource<ReportsOverview>("/api/admin/reports/overview");
  if (!data) return <p className="text-muted-foreground">Loading…</p>;

  const stats = [
    { label: "Total Users", value: data.userCount },
    { label: "Premium Subscribers", value: data.premiumCount },
    { label: "Estimated MRR", value: `$${(data.estimatedMrrCents / 100).toFixed(2)}` },
    { label: "Resumes Created", value: data.resumeCount },
    { label: "ATS Scans Run", value: data.scanCount },
    { label: "Cover Letters Generated", value: data.coverLetterCount },
    { label: "Interview Sessions", value: data.interviewSessionCount },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
