"use client";

import { useState } from "react";
import { MessageSquareText, Sparkles } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InterviewSessionRecord, ResumeSummary } from "@/types/api";

export default function InterviewPrepPage() {
  const api = useApi();
  const { data: resumes } = useResource<ResumeSummary[]>("/api/resumes");
  const { data: sessions, refetch } = useResource<InterviewSessionRecord[]>("/api/interview-prep");

  const [resumeId, setResumeId] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      await api.post("/api/interview-prep", { resumeId, roleTitle, jobDescriptionText });
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "This feature requires a Premium plan.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">AI Interview Preparation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate interview questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label>Target Role</Label>
              <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Job Description (optional)</Label>
            <Textarea rows={4} value={jobDescriptionText} onChange={(e) => setJobDescriptionText(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button disabled={!resumeId || !roleTitle || generating} onClick={handleGenerate}>
            <Sparkles className="h-4 w-4" /> {generating ? "Generating…" : "Generate Questions"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {(sessions ?? []).map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareText className="h-4 w-4" /> {session.roleTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {session.questions.map((q, i) => (
                <div key={i} className="rounded-md border border-border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline">{q.type}</Badge>
                  </div>
                  <p className="font-medium">{q.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{q.suggestedStarAnswer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
