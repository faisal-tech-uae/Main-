"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScanSearch, Wand2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { FileDropzone } from "@/components/file-dropzone";
import { DisciplineSelect } from "@/components/discipline-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { AtsAnalysisRecord, ResumeSummary, UploadedResumeRecord } from "@/types/api";

const PLATFORMS = [
  "GENERIC", "GREENHOUSE", "LEVER", "WORKDAY", "ORACLE_TALEO", "SAP_SUCCESSFACTORS",
  "ICIMS", "SMARTRECRUITERS", "JAZZHR", "BAMBOOHR", "UKG", "DAYFORCE",
];

export default function ScannerPage() {
  const api = useApi();
  const router = useRouter();
  const { data: resumes } = useResource<ResumeSummary[]>("/api/resumes");
  const { data: pastScans, refetch: refetchScans } = useResource<AtsAnalysisRecord[]>("/api/scan");

  const [uploadedResume, setUploadedResume] = useState<UploadedResumeRecord | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("GENERIC");
  const [discipline, setDiscipline] = useState("none");
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await api.postForm<UploadedResumeRecord>("/api/uploads/resume", formData);
      setUploadedResume(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleScan() {
    setScanning(true);
    setError(null);
    try {
      const result = await api.post<{ analysis: { id: string } }>("/api/scan", {
        resumeId: selectedResumeId || undefined,
        uploadedResumeId: uploadedResume?.id,
        jobDescriptionText: jobDescriptionText || undefined,
        targetPlatform,
        targetDiscipline: discipline === "none" ? undefined : discipline,
      });
      router.push(`/scanner/${result.analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
      refetchScans();
    }
  }

  async function handleConvertToResume() {
    if (!uploadedResume) return;
    setConverting(true);
    setError(null);
    try {
      const result = await api.post<{ resume: { id: string } }>(`/api/uploads/${uploadedResume.id}/convert-to-resume`, {
        targetDiscipline: discipline === "none" ? undefined : discipline,
      });
      router.push(`/resumes/${result.resume.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't convert this file into an editable resume");
    } finally {
      setConverting(false);
    }
  }

  const canScan = (uploadedResume || selectedResumeId) && !scanning;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">ATS Scanner</h1>

      <Card>
        <CardHeader>
          <CardTitle>1. Choose a resume</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">Upload a file</TabsTrigger>
              <TabsTrigger value="existing">Use a saved resume</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <FileDropzone onFile={handleFile} />
              {uploading && <p className="mt-2 text-sm text-muted-foreground">Parsing your resume…</p>}
              {uploadedResume && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-success">Loaded: {uploadedResume.fileName}</p>
                  <Button type="button" size="sm" variant="outline" onClick={handleConvertToResume} disabled={converting}>
                    <Wand2 className="h-4 w-4" /> {converting ? "Converting…" : "Convert to editable resume"}
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="existing">
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Engineering discipline (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Improves keyword suggestions, interview questions, and rewrites with the right MEP/UAE terminology</Label>
          <DisciplineSelect value={discipline} onValueChange={setDiscipline} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Job description (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Paste the job description for role-match scoring and keyword gap analysis</Label>
          <Textarea rows={6} className="mt-2" value={jobDescriptionText} onChange={(e) => setJobDescriptionText(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Target ATS platform</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={targetPlatform} onValueChange={setTargetPlatform}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button size="lg" disabled={!canScan} onClick={handleScan}>
        <ScanSearch className="h-4 w-4" /> {scanning ? "Analyzing…" : "Run ATS Scan"}
      </Button>

      {pastScans && pastScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {pastScans.map((scan) => (
                <li key={scan.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/scanner/${scan.id}`} className="text-primary hover:underline">
                    Scan from {new Date(scan.createdAt).toLocaleString()}
                  </Link>
                  <span className="font-semibold">{scan.overallScore}/100</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
