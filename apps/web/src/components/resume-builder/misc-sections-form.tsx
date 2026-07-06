"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newId } from "@/lib/id";

const PROFICIENCIES = ["Elementary", "Limited Working", "Professional Working", "Full Professional", "Native/Bilingual"];

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onClick}>
      <Trash2 className="h-4 w-4" /> Remove
    </Button>
  );
}

export function CertificationsForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "certifications" });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Certification Name" {...register(`certifications.${index}.name`)} />
            <Input placeholder="Issuer" {...register(`certifications.${index}.issuer`)} />
            <Input placeholder="Issue Date" {...register(`certifications.${index}.issueDate`)} />
            <Input placeholder="Credential URL" {...register(`certifications.${index}.credentialUrl`)} />
            <div className="sm:col-span-2">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), name: "" })}>
        <Plus className="h-4 w-4" /> Add certification
      </Button>
    </div>
  );
}

export function LanguagesForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "languages" });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Language" {...register(`languages.${index}.language`)} />
            <Controller
              control={control}
              name={`languages.${index}.proficiency`}
              render={({ field: profField }) => (
                <Select value={profField.value} onValueChange={profField.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <div className="sm:col-span-2">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), language: "", proficiency: "Professional Working" })}>
        <Plus className="h-4 w-4" /> Add language
      </Button>
    </div>
  );
}

export function AwardsForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "awards" });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Award Title" {...register(`awards.${index}.title`)} />
            <Input placeholder="Issuer" {...register(`awards.${index}.issuer`)} />
            <Input placeholder="Date" {...register(`awards.${index}.date`)} />
            <div className="sm:col-span-2">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), title: "" })}>
        <Plus className="h-4 w-4" /> Add award
      </Button>
    </div>
  );
}

export function ReferencesForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "references" });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Name" {...register(`references.${index}.name`)} />
            <Input placeholder="Title" {...register(`references.${index}.title`)} />
            <Input placeholder="Company" {...register(`references.${index}.company`)} />
            <Input placeholder="Email" {...register(`references.${index}.email`)} />
            <Input placeholder="Phone" {...register(`references.${index}.phone`)} />
            <Input placeholder="Relationship" {...register(`references.${index}.relationship`)} />
            <div className="sm:col-span-2">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), name: "" })}>
        <Plus className="h-4 w-4" /> Add reference
      </Button>
    </div>
  );
}

export function PublicationsForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "publications" });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Title" {...register(`publications.${index}.title`)} />
            <Input placeholder="Publisher" {...register(`publications.${index}.publisher`)} />
            <Input placeholder="Date" {...register(`publications.${index}.date`)} />
            <Input placeholder="URL" {...register(`publications.${index}.url`)} />
            <div className="sm:col-span-2">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), title: "" })}>
        <Plus className="h-4 w-4" /> Add publication
      </Button>
    </div>
  );
}

export function PatentsForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "patents" });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Title" {...register(`patents.${index}.title`)} />
            <Input placeholder="Patent Number" {...register(`patents.${index}.patentNumber`)} />
            <Input placeholder="Date" {...register(`patents.${index}.date`)} />
            <div className="sm:col-span-2">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), title: "" })}>
        <Plus className="h-4 w-4" /> Add patent
      </Button>
    </div>
  );
}

export function ResearchForm() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "research" });
  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
            <Input placeholder="Title" {...register(`research.${index}.title`)} />
            <Input placeholder="Institution" {...register(`research.${index}.institution`)} />
            <Input placeholder="Start Date" {...register(`research.${index}.startDate`)} />
            <Input placeholder="End Date" {...register(`research.${index}.endDate`)} />
            <div className="sm:col-span-2">
              <RemoveButton onClick={() => remove(index)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: newId(), title: "", startDate: "", current: false })}>
        <Plus className="h-4 w-4" /> Add research
      </Button>
    </div>
  );
}
