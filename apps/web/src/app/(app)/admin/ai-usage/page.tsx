"use client";

import { useResource } from "@/hooks/use-resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AiUsageSummary {
  totalCostMicros: number;
  totalRequests: number;
  successRate: number;
  byFeature: Record<string, number>;
}

interface AiUsageLog {
  id: string;
  feature: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costMicros: number;
  success: boolean;
  createdAt: string;
}

export default function AdminAiUsagePage() {
  const { data: summary } = useResource<AiUsageSummary>("/api/admin/ai-usage/summary");
  const { data: recent } = useResource<AiUsageLog[]>("/api/admin/ai-usage/recent");

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Estimated Cost (30d)</p>
              <p className="mt-1 text-2xl font-semibold">${(summary.totalCostMicros / 1_000_000).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="mt-1 text-2xl font-semibold">{summary.totalRequests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="mt-1 text-2xl font-semibold">{Math.round(summary.successRate * 100)}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent AI Calls</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-3">Feature</th>
                <th className="p-3">Provider / Model</th>
                <th className="p-3">Tokens</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Status</th>
                <th className="p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).map((log) => (
                <tr key={log.id} className="border-b border-border/50">
                  <td className="p-3">{log.feature}</td>
                  <td className="p-3">
                    {log.provider} / {log.model}
                  </td>
                  <td className="p-3">
                    {log.promptTokens}+{log.completionTokens}
                  </td>
                  <td className="p-3">${(log.costMicros / 1_000_000).toFixed(4)}</td>
                  <td className="p-3">
                    <Badge variant={log.success ? "success" : "destructive"}>{log.success ? "OK" : "Failed"}</Badge>
                  </td>
                  <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
