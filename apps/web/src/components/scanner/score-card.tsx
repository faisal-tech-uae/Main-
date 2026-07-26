import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function ScoreCard({ label, score, description }: { label: string; score: number; description?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-4xl font-bold", scoreColor(score))}>{score}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function MiniScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", scoreColor(score))}>{score}</span>
    </div>
  );
}
