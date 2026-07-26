"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BulletListEditor } from "./bullet-list";
import { newId } from "@/lib/id";

export function ProjectsForm({ onRewriteBullet }: { onRewriteBullet: (text: string, role?: string) => Promise<string> }) {
  const { register, control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "projects" });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const role = watch(`projects.${index}.role`);
        return (
          <Card key={field.id}>
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Project Name" {...register(`projects.${index}.name`)} />
                <Input placeholder="Your Role" {...register(`projects.${index}.role`)} />
                <Input placeholder="URL" {...register(`projects.${index}.url`)} />
                <Input placeholder="Start (2023-01)" {...register(`projects.${index}.startDate`)} />
              </div>
              <BulletListEditor basePath={`projects.${index}`} onRewrite={(text) => onRewriteBullet(text, role)} />
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" /> Remove project
              </Button>
            </CardContent>
          </Card>
        );
      })}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), name: "", startDate: "", current: false, bullets: [], technologies: [] })}>
        <Plus className="h-4 w-4" /> Add project
      </Button>
    </div>
  );
}
