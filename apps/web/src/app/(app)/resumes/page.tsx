"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { MEP_DISCIPLINES } from "@resumeai/shared";
import { useResource } from "@/hooks/use-resource";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DisciplineSelect } from "@/components/discipline-select";
import type { ResumeSummary } from "@/types/api";

export default function ResumesPage() {
  const { data: resumes, loading, refetch } = useResource<ResumeSummary[]>("/api/resumes");
  const api = useApi();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Untitled Resume");
  const [discipline, setDiscipline] = useState("none");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const resume = await api.post<ResumeSummary>("/api/resumes", {
        title,
        targetDiscipline: discipline === "none" ? undefined : discipline,
        targetCountry: "United Arab Emirates",
      });
      setOpen(false);
      router.push(`/resumes/${resume.id}`);
    } finally {
      setCreating(false);
      refetch();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new resume</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Discipline</Label>
                <DisciplineSelect value={discipline} onValueChange={setDiscipline} />
              </div>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !resumes || resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">You haven&apos;t created any resumes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => {
            const disciplineLabel = MEP_DISCIPLINES.find((d) => d.id === resume.targetDiscipline)?.label;
            return (
              <Link key={resume.id} href={`/resumes/${resume.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">{resume.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {disciplineLabel && <Badge variant="secondary">{disciplineLabel}</Badge>}
                    {resume.targetJobRole && <p>{resume.targetJobRole}</p>}
                    <p>Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
