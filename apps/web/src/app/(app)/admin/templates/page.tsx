"use client";

import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { TemplateSummary } from "@/types/api";

export default function AdminTemplatesPage() {
  const api = useApi();
  const { data: templates, refetch } = useResource<(TemplateSummary & { isActive: boolean })[]>("/api/admin/templates");

  async function toggleActive(id: string, isActive: boolean) {
    await api.patch(`/api/admin/templates/${id}/active`, { isActive });
    refetch();
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Premium</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {(templates ?? []).map((t) => (
              <tr key={t.id} className="border-b border-border/50">
                <td className="p-3">{t.name}</td>
                <td className="p-3">
                  <Badge variant="outline">{t.category.replaceAll("_", " ")}</Badge>
                </td>
                <td className="p-3">{t.isPremium ? "Yes" : "No"}</td>
                <td className="p-3">
                  <Switch checked={t.isActive} onCheckedChange={(v) => toggleActive(t.id, v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
