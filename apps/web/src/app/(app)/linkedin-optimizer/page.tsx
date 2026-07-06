"use client";

import { useState } from "react";
import { Linkedin, Sparkles } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { LinkedInOptimizationRecord, ResumeSummary } from "@/types/api";

export default function LinkedInOptimizerPage() {
  const api = useApi();
  const { data: resumes } = useResource<ResumeSummary[]>("/api/resumes");
  const { data: optimizations, refetch } = useResource<LinkedInOptimizationRecord[]>("/api/linkedin");

  const [resumeId, setResumeId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      await api.post("/api/linkedin", { resumeId });
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "This feature requires a Premium plan.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">LinkedIn Optimizer</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate LinkedIn content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-1.5">
            <Label>Resume</Label>
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a resume" />
              </SelectTrigger>
              <SelectContent>
                {(resumes ?? []).map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button disabled={!resumeId || generating} onClick={handleGenerate}>
            <Sparkles className="h-4 w-4" /> {generating ? "Generating…" : "Optimize LinkedIn Profile"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {(optimizations ?? []).map((opt) => (
          <Card key={opt.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Linkedin className="h-4 w-4" /> {new Date(opt.createdAt).toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">Headline</p>
                <p>{opt.headline}</p>
              </div>
              <div>
                <p className="font-semibold">About</p>
                <p className="whitespace-pre-wrap">{opt.about}</p>
              </div>
              {opt.experienceBullets.map((exp, i) => (
                <div key={i}>
                  <p className="font-semibold">{exp.title}</p>
                  <ul className="list-disc pl-5">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <p className="font-semibold">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {opt.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
