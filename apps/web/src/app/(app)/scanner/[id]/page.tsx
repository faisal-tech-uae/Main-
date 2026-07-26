"use client";

import { use } from "react";
import { useResource } from "@/hooks/use-resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCard, MiniScore } from "@/components/scanner/score-card";
import { FindingsList } from "@/components/scanner/findings-list";
import { PlatformTable } from "@/components/scanner/platform-table";
import type { AtsAnalysisRecord } from "@/types/api";

export default function ScanResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: scan, loading } = useResource<AtsAnalysisRecord>(`/api/scan/${id}`);

  if (loading || !scan) return <p className="text-muted-foreground">Loading analysis…</p>;

  const ai = scan.aiAnalysis?.resumeAnalysis;
  const keywordAi = scan.aiAnalysis?.keywordAnalysis;
  const keywordMatch = "matchPercent" in scan.keywordMatch ? scan.keywordMatch : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">ATS Scan Results</h1>
        <Badge variant="outline">{new Date(scan.createdAt).toLocaleString()}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard label="Overall Score" score={scan.overallScore} description="Weighted composite" />
        <ScoreCard label="ATS Pass Score" score={scan.atsPassScore} description="Machine parsability" />
        <ScoreCard label="Recruiter Appeal" score={scan.recruiterAppealScore} description="Human readability & impact" />
        <ScoreCard label="Role Match" score={scan.roleMatchScore} description="Fit vs. job description" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <MiniScore label="Formatting" score={scan.formattingScore} />
          <MiniScore label="Keywords" score={scan.keywordScore} />
          <MiniScore label="Experience" score={scan.experienceScore} />
          <MiniScore label="Education" score={scan.educationScore} />
          <MiniScore label="Skills" score={scan.skillsScore} />
          <MiniScore label="Grammar" score={scan.grammarScore} />
          <MiniScore label="ATS Compatibility" score={scan.atsCompatibilityScore} />
          <MiniScore label="Recruiter Readability" score={scan.recruiterReadabilityScore} />
        </CardContent>
      </Card>

      {ai && !("error" in ai) && (
        <Card>
          <CardHeader>
            <CardTitle>AI Executive Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{ai.executiveSummary}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <BulletBlock title="Strengths" items={ai.strengths} />
              <BulletBlock title="Weaknesses" items={ai.weaknesses} />
              <BulletBlock title="ATS Problems" items={ai.atsProblems} />
              <BulletBlock title="Formatting Problems" items={ai.formattingProblems} />
              <BulletBlock title="Missing Keywords" items={ai.missingKeywords} />
              <BulletBlock title="Priority Fixes" items={ai.priorityFixes} />
            </div>
            <BulletBlock title="Action Plan" items={ai.actionPlan} />
            <div className="grid gap-2 sm:grid-cols-3">
              <MiniScore label="Est. Interview Probability" score={ai.estimatedInterviewProbability ?? 0} />
              <MiniScore label="Est. Recruiter Readability" score={ai.estimatedRecruiterReadability ?? 0} />
              <MiniScore label="Est. ATS Pass Probability" score={ai.estimatedAtsPassProbability ?? 0} />
            </div>
          </CardContent>
        </Card>
      )}

      {keywordMatch && (
        <Card>
          <CardHeader>
            <CardTitle>Keyword Match — {keywordMatch.matchPercent}%</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <BulletBlock title="Matched Keywords" items={keywordMatch.matched} variant="success" />
            <BulletBlock title="Missing Keywords" items={keywordMatch.missing} variant="destructive" />
            {keywordAi && !("error" in keywordAi) && (
              <>
                <BulletBlock title="Missing Skills" items={keywordAi.missingSkills} />
                <BulletBlock title="Priority Recommendations" items={keywordAi.priorityRecommendations} />
                <BulletBlock title="Soft Skills Gap" items={keywordAi.softSkillsGap} />
                <BulletBlock title="Technical Skills Gap" items={keywordAi.technicalSkillsGap} />
                {keywordAi.experienceGap && <p className="text-sm"><strong>Experience Gap:</strong> {keywordAi.experienceGap}</p>}
                {keywordAi.educationGap && <p className="text-sm"><strong>Education Gap:</strong> {keywordAi.educationGap}</p>}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Structural & Rule-Based Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <FindingsList findings={scan.ruleFindings} />
        </CardContent>
      </Card>

      {scan.platformNotes?.all && (
        <Card>
          <CardHeader>
            <CardTitle>ATS Platform Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Heuristic simulation based on published ATS parsing best-practice guidance — not a guarantee of a specific employer&apos;s
              live configuration.
            </p>
            <PlatformTable platforms={scan.platformNotes.all} targetPlatform={scan.platformNotes.primary?.platform} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BulletBlock({ title, items, variant }: { title: string; items?: string[]; variant?: "success" | "destructive" }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{title}</p>
      <ul className="list-disc space-y-0.5 pl-5 text-sm">
        {items.map((item, i) => (
          <li key={i} className={variant === "success" ? "text-success" : variant === "destructive" ? "text-destructive" : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
