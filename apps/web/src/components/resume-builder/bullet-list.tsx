"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Editable bullet list bound to `${basePath}.bullets` on the surrounding react-hook-form context. */
export function BulletListEditor({
  basePath,
  onRewrite,
}: {
  basePath: string;
  onRewrite?: (bulletText: string, index: number) => Promise<string>;
}) {
  const { register, control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `${basePath}.bullets` as never });
  const bullets: string[] = watch(`${basePath}.bullets`) ?? [];

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <Textarea
            rows={2}
            className="flex-1"
            placeholder="Led a team of 4 engineers to ship a payments platform serving 2M users"
            {...register(`${basePath}.bullets.${index}` as const)}
          />
          <div className="flex flex-col gap-1">
            {onRewrite && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Rewrite with AI"
                onClick={async () => {
                  const rewritten = await onRewrite(bullets[index] ?? "", index);
                  setValue(`${basePath}.bullets.${index}`, rewritten, { shouldDirty: true });
                }}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append("")}>
        <Plus className="h-4 w-4" /> Add bullet
      </Button>
    </div>
  );
}
