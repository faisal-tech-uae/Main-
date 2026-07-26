"use client";

import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CoverLetterRecord, ResumeSummary } from "@/types/api";

export default function CoverLettersPage() {
  const api = useApi();
  const { data: resumes } = useResource<ResumeSummary[]>("/api/resumes");
  const { data: letters, refetch } = useResource<CoverLetterRecord[]>("/api/cover-letters");

  const [resumeId, setResumeId] = useState("");
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [tone, setTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      await api.post("/api/cover-letters", { resumeId, company, roleTitle, jobDescriptionText, tone });
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "This feature requires a Premium plan.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Cover Letter Generator</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generate a new cover letter</CardTitle>
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
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["professional", "enthusiastic", "concise", "executive"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role Title</Label>
              <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Job Description (optional)</Label>
            <Textarea rows={5} value={jobDescriptionText} onChange={(e) => setJobDescriptionText(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button disabled={!resumeId || !company || !roleTitle || generating} onClick={handleGenerate}>
            <Sparkles className="h-4 w-4" /> {generating ? "Generating…" : "Generate Cover Letter"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {(letters ?? []).map((letter) => (
          <Card key={letter.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" /> {letter.roleTitle} at {letter.company}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm">{letter.content}</pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
