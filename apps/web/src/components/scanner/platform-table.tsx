import { cn } from "@/lib/utils";
import type { PlatformSimulationNote } from "@/types/api";

export function PlatformTable({ platforms, targetPlatform }: { platforms: PlatformSimulationNote[]; targetPlatform?: string }) {
  const sorted = [...platforms].sort((a, b) => b.parseConfidence - a.parseConfidence);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-4">Platform</th>
            <th className="py-2 pr-4">Parse Confidence</th>
            <th className="py-2">Top Deduction Reasons</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.platform} className={cn("border-b border-border/50", p.platform === targetPlatform && "bg-accent")}>
              <td className="py-2 pr-4 font-medium">{p.platform.replaceAll("_", " ")}</td>
              <td className="py-2 pr-4">
                <span
                  className={cn(
                    "font-semibold",
                    p.parseConfidence >= 80 ? "text-success" : p.parseConfidence >= 60 ? "text-warning" : "text-destructive"
                  )}
                >
                  {p.parseConfidence}%
                </span>
              </td>
              <td className="py-2 text-muted-foreground">
                {p.deductions.slice(0, 2).map((d) => d.reason).join("; ") || "No significant issues"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
