"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { newId } from "@/lib/id";

export function SkillsForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="space-y-3 p-4">
            <Input placeholder="Category (e.g. Programming Languages)" {...register(`skills.${index}.category`)} />
            <Controller
              control={control}
              name={`skills.${index}.items`}
              render={({ field: itemsField }) => (
                <Input
                  placeholder="Comma-separated: TypeScript, Node.js, PostgreSQL"
                  defaultValue={(itemsField.value ?? []).join(", ")}
                  onBlur={(e) =>
                    itemsField.onChange(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                />
              )}
            />
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" /> Remove category
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), category: "", items: [] })}>
        <Plus className="h-4 w-4" /> Add skill category
      </Button>
    </div>
  );
}
