import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AtsFinding } from "@/types/api";

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, variant: "destructive" as const, label: "Critical" },
  warning: { icon: AlertTriangle, variant: "warning" as const, label: "Warning" },
  info: { icon: Info, variant: "secondary" as const, label: "Info" },
};

export function FindingsList({ findings }: { findings: AtsFinding[] }) {
  if (findings.length === 0) {
    return <p className="text-sm text-muted-foreground">No issues detected. Excellent work.</p>;
  }

  return (
    <ul className="space-y-2">
      {findings.map((finding) => {
        const config = SEVERITY_CONFIG[finding.severity];
        const Icon = config.icon;
        return (
          <li key={finding.id} className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p>{finding.message}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={config.variant}>{config.label}</Badge>
                <span className="text-xs text-muted-foreground">−{finding.pointsDeducted} pts</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
