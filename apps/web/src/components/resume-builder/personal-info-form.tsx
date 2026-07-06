"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PersonalInfoForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const personalErrors = (errors.personalInfo ?? {}) as Record<string, { message?: string }>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full Name" error={personalErrors.fullName?.message}>
        <Input {...register("personalInfo.fullName")} />
      </Field>
      <Field label="Job Title" error={personalErrors.jobTitle?.message}>
        <Input {...register("personalInfo.jobTitle")} placeholder="Senior Software Engineer" />
      </Field>
      <Field label="Email" error={personalErrors.email?.message}>
        <Input type="email" {...register("personalInfo.email")} />
      </Field>
      <Field label="Phone" error={personalErrors.phone?.message}>
        <Input {...register("personalInfo.phone")} placeholder="+1 415 555 0132" />
      </Field>
      <Field label="Location" error={personalErrors.location?.message}>
        <Input {...register("personalInfo.location")} placeholder="San Francisco, CA" />
      </Field>
      <Field label="LinkedIn URL" error={personalErrors.linkedinUrl?.message}>
        <Input {...register("personalInfo.linkedinUrl")} placeholder="https://linkedin.com/in/you" />
      </Field>
      <Field label="GitHub URL" error={personalErrors.githubUrl?.message}>
        <Input {...register("personalInfo.githubUrl")} placeholder="https://github.com/you" />
      </Field>
      <Field label="Portfolio URL" error={personalErrors.portfolioUrl?.message}>
        <Input {...register("personalInfo.portfolioUrl")} placeholder="https://yourportfolio.com" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Professional Summary">
          <SummaryField />
        </Field>
      </div>
    </div>
  );
}

function SummaryField() {
  const { register } = useFormContext();
  return <Textarea rows={4} {...register("summary.content")} placeholder="A concise 2-4 sentence pitch tailored to your target role." />;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
