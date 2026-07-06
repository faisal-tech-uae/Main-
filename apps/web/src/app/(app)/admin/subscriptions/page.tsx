"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PlanConfig {
  id: string;
  plan: string;
  priceMonthlyCents: number;
  scanLimit: number;
}

interface SubscriptionRow {
  id: string;
  plan: string;
  status: string;
  scansUsedThisPeriod: number;
  scanLimit: number;
  user: { email: string };
}

export default function AdminSubscriptionsPage() {
  const api = useApi();
  const { data: plans, refetch: refetchPlans } = useResource<PlanConfig[]>("/api/admin/subscriptions/plans");
  const { data: subscriptions } = useResource<SubscriptionRow[]>("/api/admin/subscriptions");
  const [edits, setEdits] = useState<Record<string, number>>({});

  async function savePrice(plan: string) {
    const priceMonthlyCents = edits[plan];
    if (priceMonthlyCents === undefined) return;
    await api.put(`/api/admin/subscriptions/plans/${plan}`, { priceMonthlyCents });
    refetchPlans();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(plans ?? []).map((plan) => (
            <div key={plan.id} className="flex items-center gap-3">
              <Badge className="w-28 justify-center">{plan.plan}</Badge>
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                className="w-28"
                defaultValue={(plan.priceMonthlyCents / 100).toFixed(2)}
                onChange={(e) => setEdits((prev) => ({ ...prev, [plan.plan]: Math.round(Number(e.target.value) * 100) }))}
              />
              <span className="text-sm text-muted-foreground">/mo</span>
              <Button size="sm" variant="outline" onClick={() => savePrice(plan.plan)}>
                Save
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-3">User</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Scans Used</th>
              </tr>
            </thead>
            <tbody>
              {(subscriptions ?? []).map((sub) => (
                <tr key={sub.id} className="border-b border-border/50">
                  <td className="p-3">{sub.user.email}</td>
                  <td className="p-3">
                    <Badge variant="outline">{sub.plan}</Badge>
                  </td>
                  <td className="p-3">{sub.status}</td>
                  <td className="p-3">{sub.scanLimit === -1 ? `${sub.scansUsedThisPeriod} / ∞` : `${sub.scansUsedThisPeriod} / ${sub.scanLimit}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
