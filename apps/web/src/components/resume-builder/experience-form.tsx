"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { BulletListEditor } from "./bullet-list";
import { newId } from "@/lib/id";

export function ExperienceForm({ onRewriteBullet }: { onRewriteBullet: (text: string, roleTitle?: string) => Promise<string> }) {
  const { register, control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "experience" });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const current = watch(`experience.${index}.current`);
        const jobTitle = watch(`experience.${index}.jobTitle`);
        return (
          <Card key={field.id}>
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Job Title" {...register(`experience.${index}.jobTitle`)} />
                <Input placeholder="Employer" {...register(`experience.${index}.employer`)} />
                <Input placeholder="Location" {...register(`experience.${index}.location`)} />
                <div className="flex items-center gap-2">
                  <Input placeholder="Start (2022-01)" {...register(`experience.${index}.startDate`)} />
                  <Input placeholder="End (2024-06)" disabled={current} {...register(`experience.${index}.endDate`)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={`experience.${index}.current`}
                  render={({ field }) => <Switch checked={!!field.value} onCheckedChange={field.onChange} />}
                />
                <Label className="font-normal">I currently work here</Label>
              </div>
              <BulletListEditor basePath={`experience.${index}`} onRewrite={(text) => onRewriteBullet(text, jobTitle)} />
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" /> Remove role
              </Button>
            </CardContent>
          </Card>
        );
      })}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({ id: newId(), jobTitle: "", employer: "", startDate: "", current: false, bullets: [], technologies: [] })
        }
      >
        <Plus className="h-4 w-4" /> Add experience
      </Button>
    </div>
  );
}
