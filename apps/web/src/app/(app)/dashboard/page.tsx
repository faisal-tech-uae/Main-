"use client";

import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { FileText, Send, TrendingUp, Download, Percent } from "lucide-react";
import { useResource } from "@/hooks/use-resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { DashboardSummary } from "@/types/api";

const STAT_ITEMS = (summary: DashboardSummary) => [
  { label: "Applications Sent", value: summary.applicationsSent, icon: Send },
  { label: "Resume Versions", value: summary.resumeVersions, icon: FileText },
  { label: "Interview Rate", value: `${summary.interviewRate}%`, icon: Percent },
  { label: "Resume Downloads", value: summary.resumeDownloads, icon: Download },
];

export default function DashboardPage() {
  const { data: summary, loading } = useResource<DashboardSummary>("/api/dashboard");

  if (loading) return <p className="text-muted-foreground">Loading dashboard…</p>;
  if (!summary) return <p className="text-muted-foreground">Couldn&apos;t load your dashboard.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/scanner">Run an ATS scan</Link>
          </Button>
          <Button asChild>
            <Link href="/resumes">Build a resume</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_ITEMS(summary).map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
              <item.icon className="h-8 w-8 text-primary/60" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> ATS Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {summary.atsScoreTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">Run an ATS scan to start tracking your score over time.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.atsScoreTrend}>
                  <defs>
                    <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} hide />
                  <YAxis domain={[0, 100]} width={30} />
                  <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                  <Area type="monotone" dataKey="overall" stroke="var(--color-primary)" fill="url(#overallGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={summary.profileCompletion} />
            <p className="text-sm text-muted-foreground">{summary.profileCompletion}% complete</p>
            <p className="text-xs text-muted-foreground">{summary.resumeCount} resume(s) in your account</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications tracked yet. Add one from the{" "}
              <Link href="/applications" className="text-primary underline">
                Applications
              </Link>{" "}
              tab.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {summary.applications.slice(0, 5).map((app) => (
                <li key={app.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {app.roleTitle} at {app.company}
                  </span>
                  <span className="text-muted-foreground">{app.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
