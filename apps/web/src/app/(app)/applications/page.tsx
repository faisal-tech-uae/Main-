"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ApplicationRecord } from "@/types/api";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"] as const;

export default function ApplicationsPage() {
  const api = useApi();
  const { data: applications, refetch } = useResource<ApplicationRecord[]>("/api/applications");
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");

  async function handleCreate() {
    await api.post("/api/applications", { company, roleTitle, status: "SAVED" });
    setOpen(false);
    setCompany("");
    setRoleTitle("");
    refetch();
  }

  async function handleStatusChange(id: string, status: string) {
    await api.patch(`/api/applications/${id}/status`, { status });
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Track Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Track a new application</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input placeholder="Role Title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
              <Button onClick={handleCreate} disabled={!company || !roleTitle}>
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {(applications ?? []).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No applications tracked yet.</p>
            </CardContent>
          </Card>
        ) : (
          applications!.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{app.roleTitle}</p>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                </div>
                <Select value={app.status} onValueChange={(v) => handleStatusChange(app.id, v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <Badge variant="outline">{s}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
