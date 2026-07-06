"use client";

import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface MeResponse {
  user: { email: string; firstName?: string; lastName?: string; role: string };
  subscription: { plan: string; scanLimit: number; scansUsedThisPeriod: number } | null;
  privacy: { allowAiTraining: boolean; allowAnalytics: boolean; dataRetentionDays: number } | null;
}

export default function SettingsPage() {
  const api = useApi();
  const { data: me, refetch } = useResource<MeResponse>("/api/account/me");
  const [allowAiTraining, setAllowAiTraining] = useState(false);
  const [allowAnalytics, setAllowAnalytics] = useState(true);

  useEffect(() => {
    if (me?.privacy) {
      setAllowAiTraining(me.privacy.allowAiTraining);
      setAllowAnalytics(me.privacy.allowAnalytics);
    }
  }, [me?.privacy]);

  async function updatePrivacy(patch: Partial<{ allowAiTraining: boolean; allowAnalytics: boolean }>) {
    await api.put("/api/account/me/privacy", patch);
    refetch();
  }

  async function handleExport() {
    await api.downloadFile("/api/account/me/export", "resumeai-pro-data-export.json");
  }

  async function handleDelete() {
    await api.del("/api/account/me");
    window.location.href = "/";
  }

  if (!me) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{me.user.email}</p>
          {me.subscription && (
            <p className="flex items-center gap-2">
              Plan: <Badge>{me.subscription.plan}</Badge>
              <span className="text-muted-foreground">
                {me.subscription.scanLimit === -1
                  ? "Unlimited scans"
                  : `${me.subscription.scansUsedThisPeriod}/${me.subscription.scanLimit} scans this month`}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control how your data is used across ResumeAI Pro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow AI training on my data</p>
              <p className="text-xs text-muted-foreground">Off by default. We never use your resumes to train models unless you opt in.</p>
            </div>
            <Switch
              checked={allowAiTraining}
              onCheckedChange={(v) => {
                setAllowAiTraining(v);
                updatePrivacy({ allowAiTraining: v });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow product analytics</p>
              <p className="text-xs text-muted-foreground">Helps us improve the product. No resume content is included.</p>
            </div>
            <Switch
              checked={allowAnalytics}
              onCheckedChange={(v) => {
                setAllowAnalytics(v);
                updatePrivacy({ allowAnalytics: v });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Data (GDPR)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export all my data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" /> Delete my account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                This deactivates your account immediately and schedules your data for permanent deletion. This cannot be undone.
              </p>
              <Button variant="destructive" onClick={handleDelete}>
                Confirm deletion
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
