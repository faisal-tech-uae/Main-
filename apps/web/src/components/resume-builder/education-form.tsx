"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { newId } from "@/lib/id";

export function EducationForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "education" });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Degree (e.g. B.Sc. Computer Science)" {...register(`education.${index}.degree`)} />
            <Input placeholder="Field of Study" {...register(`education.${index}.fieldOfStudy`)} />
            <Input placeholder="Institution" {...register(`education.${index}.institution`)} />
            <Input placeholder="GPA (optional)" {...register(`education.${index}.gpa`)} />
            <Input placeholder="Start (2018-09)" {...register(`education.${index}.startDate`)} />
            <Input placeholder="End (2022-06)" {...register(`education.${index}.endDate`)} />
            <div className="sm:col-span-2">
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), institution: "", degree: "", startDate: "", current: false, highlights: [] })}>
        <Plus className="h-4 w-4" /> Add education
      </Button>
    </div>
  );
}
