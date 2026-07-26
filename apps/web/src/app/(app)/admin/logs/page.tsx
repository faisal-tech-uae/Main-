"use client";

import { useResource } from "@/hooks/use-resource";
import { Card, CardContent } from "@/components/ui/card";

interface AuditLog {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  userId?: string;
  createdAt: string;
}

export default function AdminLogsPage() {
  const { data: logs } = useResource<AuditLog[]>("/api/admin/logs");

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
              <th className="p-3">User</th>
              <th className="p-3">When</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-b border-border/50">
                <td className="p-3">{log.action}</td>
                <td className="p-3">
                  {log.targetType ? `${log.targetType}:${log.targetId}` : "—"}
                </td>
                <td className="p-3">{log.userId ?? "—"}</td>
                <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
