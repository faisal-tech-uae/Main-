"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BulletListEditor } from "./bullet-list";
import { newId } from "@/lib/id";

export function CustomSectionsForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "customSections" });

  return (
    <div className="space-y-4">
      {fields.map((section, sectionIndex) => (
        <Card key={section.id}>
          <CardContent className="space-y-3 p-4">
            <Input placeholder="Section Title (e.g. Speaking Engagements)" {...register(`customSections.${sectionIndex}.title`)} />
            <CustomSectionItems sectionIndex={sectionIndex} />
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(sectionIndex)}>
              <Trash2 className="h-4 w-4" /> Remove section
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), title: "", items: [] })}>
        <Plus className="h-4 w-4" /> Add custom section
      </Button>
    </div>
  );
}

function CustomSectionItems({ sectionIndex }: { sectionIndex: number }) {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `customSections.${sectionIndex}.items` });

  return (
    <div className="space-y-3 border-l-2 border-border pl-4">
      {fields.map((item, itemIndex) => (
        <div key={item.id} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Heading" {...register(`customSections.${sectionIndex}.items.${itemIndex}.heading`)} />
            <Input placeholder="Date" {...register(`customSections.${sectionIndex}.items.${itemIndex}.date`)} />
          </div>
          <BulletListEditor basePath={`customSections.${sectionIndex}.items.${itemIndex}`} />
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(itemIndex)}>
            <Trash2 className="h-4 w-4" /> Remove item
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ id: newId(), bullets: [] })}>
        <Plus className="h-4 w-4" /> Add item
      </Button>
    </div>
  );
}
