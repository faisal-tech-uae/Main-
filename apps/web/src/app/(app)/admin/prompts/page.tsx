"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface PromptTemplate {
  feature: string;
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
  isActive: boolean;
  version: number;
}

export default function AdminPromptsPage() {
  const api = useApi();
  const { data: prompts, refetch } = useResource<PromptTemplate[]>("/api/admin/prompts");
  const [drafts, setDrafts] = useState<Record<string, { systemPrompt: string; userPromptTemplate: string }>>({});

  async function save(feature: string) {
    const draft = drafts[feature];
    if (!draft) return;
    await api.put(`/api/admin/prompts/${feature}`, draft);
    refetch();
  }

  async function toggleActive(feature: string, isActive: boolean) {
    await api.put(`/api/admin/prompts/${feature}`, { isActive });
    refetch();
  }

  return (
    <div className="space-y-4">
      {(prompts ?? []).map((prompt) => {
        const draft = drafts[prompt.feature] ?? { systemPrompt: prompt.systemPrompt, userPromptTemplate: prompt.userPromptTemplate };
        return (
          <Card key={prompt.feature}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {prompt.name} <Badge variant="outline" className="ml-2">v{prompt.version}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active</span>
                <Switch checked={prompt.isActive} onCheckedChange={(v) => toggleActive(prompt.feature, v)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">System Prompt</p>
                <Textarea
                  rows={3}
                  defaultValue={prompt.systemPrompt}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [prompt.feature]: { ...draft, systemPrompt: e.target.value } }))}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">User Prompt Template</p>
                <Textarea
                  rows={4}
                  defaultValue={prompt.userPromptTemplate}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [prompt.feature]: { ...draft, userPromptTemplate: e.target.value } }))}
                />
              </div>
              <Button size="sm" onClick={() => save(prompt.feature)}>
                Save Prompt
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
