"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useResource } from "@/hooks/use-resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TemplateSummary } from "@/types/api";

const CATEGORIES = [
  "ALL", "ENGINEERING", "SOFTWARE", "HEALTHCARE", "FINANCE", "CONSTRUCTION", "ARCHITECTURE",
  "PROJECT_MANAGEMENT", "MECHANICAL", "ELECTRICAL", "MEP", "CIVIL", "HR", "MARKETING", "LEGAL",
  "HOSPITALITY", "SALES", "TEACHING", "ACADEMIC", "GOVERNMENT", "EXECUTIVE", "FRESHER", "INTERNSHIP", "GENERAL",
];

export default function TemplatesPage() {
  const [category, setCategory] = useState("ALL");
  const { data: templates, loading } = useResource<TemplateSummary[]>(
    category === "ALL" ? "/api/templates" : `/api/templates?category=${category}`
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading templates…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(templates ?? []).map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <div
                className="flex h-40 items-center justify-center text-white"
                style={{ backgroundColor: template.layoutConfig.accentColor ?? "#2563EB" }}
              >
                <span className="text-sm font-medium opacity-90">{template.name}</span>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  {template.name}
                  {template.isPremium && <Lock className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <Badge variant="outline">{template.category.replaceAll("_", " ")}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
