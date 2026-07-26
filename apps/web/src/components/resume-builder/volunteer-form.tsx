"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BulletListEditor } from "./bullet-list";
import { newId } from "@/lib/id";

export function VolunteerForm({ onRewriteBullet }: { onRewriteBullet: (text: string, role?: string) => Promise<string> }) {
  const { register, control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "volunteer" });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const role = watch(`volunteer.${index}.role`);
        return (
          <Card key={field.id}>
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Organization" {...register(`volunteer.${index}.organization`)} />
                <Input placeholder="Role" {...register(`volunteer.${index}.role`)} />
                <Input placeholder="Start (2022-01)" {...register(`volunteer.${index}.startDate`)} />
                <Input placeholder="End (2023-01)" {...register(`volunteer.${index}.endDate`)} />
              </div>
              <BulletListEditor basePath={`volunteer.${index}`} onRewrite={(text) => onRewriteBullet(text, role)} />
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </CardContent>
          </Card>
        );
      })}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), organization: "", startDate: "", current: false, bullets: [] })}>
        <Plus className="h-4 w-4" /> Add volunteer experience
      </Button>
    </div>
  );
}
