"use client";

import { use, useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeDocumentSchema, type ResumeDocument } from "@resumeai/shared";
import { Download, FileDown, History, Save, Wand2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useResource } from "@/hooks/use-resource";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PersonalInfoForm } from "@/components/resume-builder/personal-info-form";
import { PhotoUpload } from "@/components/resume-builder/photo-upload";
import { DisciplineSelect } from "@/components/discipline-select";
import { ExperienceForm } from "@/components/resume-builder/experience-form";
import { ProjectsForm } from "@/components/resume-builder/projects-form";
import { EducationForm } from "@/components/resume-builder/education-form";
import { SkillsForm } from "@/components/resume-builder/skills-form";
import { VolunteerForm } from "@/components/resume-builder/volunteer-form";
import {
  AwardsForm,
  CertificationsForm,
  LanguagesForm,
  PatentsForm,
  PublicationsForm,
  ReferencesForm,
  ResearchForm,
} from "@/components/resume-builder/misc-sections-form";
import { CustomSectionsForm } from "@/components/resume-builder/custom-sections-form";
import { ResumePreview } from "@/components/resume-builder/resume-preview";
import type { ResumeDetail } from "@/types/api";

export default function ResumeBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const api = useApi();
  const { data: resume, loading, refetch } = useResource<ResumeDetail>(`/api/resumes/${id}`);
  const [saving, setSaving] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const form = useForm<ResumeDocument>({
    resolver: zodResolver(resumeDocumentSchema),
    defaultValues: resume?.currentVersion?.data as ResumeDocument | undefined,
  });

  useEffect(() => {
    if (resume?.currentVersion?.data) {
      form.reset(resume.currentVersion.data as ResumeDocument);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.currentVersion?.id]);

  const liveDoc = useWatch({ control: form.control }) as ResumeDocument;

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(`/api/resumes/${id}/content`, { data: form.getValues(), changeNote: "Manual edit" });
      setSavedAt(new Date());
      refetch();
    } finally {
      setSaving(false);
    }
  }

  async function handleRewriteBullet(bulletText: string, roleTitle?: string): Promise<string> {
    if (!bulletText.trim()) return bulletText;
    try {
      const result = await api.post<{ rewritten: string }>("/api/rewrite/bullet", { bulletText, roleTitle });
      return result.rewritten;
    } catch {
      return bulletText;
    }
  }

  async function handleFullRewrite() {
    setRewriting(true);
    try {
      await api.post(`/api/resumes/${id}/rewrite`);
      await refetch();
    } finally {
      setRewriting(false);
    }
  }

  async function handleRestore(versionId: string) {
    await api.post(`/api/resumes/${id}/versions/${versionId}/restore`);
    await refetch();
  }

  async function handleExport(format: "pdf" | "docx", variant?: "visual") {
    const query = variant ? `?variant=${variant}` : "";
    const filename = variant ? `resume-visual.${format}` : `resume.${format}`;
    await api.downloadFile(`/api/export/${id}/${format}${query}`, filename);
  }

  async function handleDisciplineChange(value: string) {
    await api.put(`/api/resumes/${id}/meta`, { targetDiscipline: value === "none" ? undefined : value });
    refetch();
  }

  if (loading || !resume) return <p className="text-muted-foreground">Loading resume…</p>;

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="max-w-xs text-lg font-semibold"
              defaultValue={resume.title}
              onBlur={(e) => api.put(`/api/resumes/${id}/content`, { data: form.getValues(), changeNote: `Renamed to ${e.target.value}` })}
            />
            <div className="w-56">
              <DisciplineSelect
                value={resume.targetDiscipline ?? "none"}
                onValueChange={handleDisciplineChange}
                placeholder="Discipline"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {savedAt && <span className="text-xs text-muted-foreground">Saved {savedAt.toLocaleTimeString()}</span>}
            <Button variant="outline" onClick={handleFullRewrite} disabled={rewriting}>
              <Wand2 className="h-4 w-4" /> {rewriting ? "Rewriting…" : "AI Rewrite"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <History className="h-4 w-4" /> Versions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {resume.versions.map((v) => (
                  <DropdownMenuItem key={v.id} onClick={() => handleRestore(v.id)}>
                    v{v.versionNumber} — {v.changeNote ?? v.createdBy} ({new Date(v.createdAt).toLocaleString()})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="h-4 w-4" /> Export PDF
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>ATS-Safe (single column, no photo)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf", "visual")}>Visual / Non-ATS (photo, designed layout)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={() => handleExport("docx")}>
              <Download className="h-4 w-4" /> DOCX
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="flex h-auto flex-wrap justify-start gap-1">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <PhotoUpload
                resumeId={id}
                photoUrl={liveDoc?.personalInfo?.photoUrl}
                onUploaded={(newPhotoUrl) => form.setValue("personalInfo.photoUrl", newPhotoUrl, { shouldDirty: true })}
              />
              <PersonalInfoForm />
            </TabsContent>
            <TabsContent value="experience">
              <ExperienceForm onRewriteBullet={handleRewriteBullet} />
            </TabsContent>
            <TabsContent value="projects">
              <ProjectsForm onRewriteBullet={handleRewriteBullet} />
            </TabsContent>
            <TabsContent value="education">
              <EducationForm />
            </TabsContent>
            <TabsContent value="skills">
              <SkillsForm />
            </TabsContent>
            <TabsContent value="certifications">
              <CertificationsForm />
            </TabsContent>
            <TabsContent value="languages">
              <LanguagesForm />
            </TabsContent>
            <TabsContent value="awards">
              <AwardsForm />
            </TabsContent>
            <TabsContent value="volunteer">
              <VolunteerForm onRewriteBullet={handleRewriteBullet} />
            </TabsContent>
            <TabsContent value="references">
              <ReferencesForm />
            </TabsContent>
            <TabsContent value="publications">
              <PublicationsForm />
            </TabsContent>
            <TabsContent value="patents">
              <PatentsForm />
            </TabsContent>
            <TabsContent value="research">
              <ResearchForm />
            </TabsContent>
            <TabsContent value="custom">
              <CustomSectionsForm />
            </TabsContent>
          </Tabs>

          <div className="sticky top-6 h-fit rounded-xl bg-muted p-4">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Live Preview</p>
            {liveDoc && <ResumePreview doc={liveDoc} />}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

const TABS = [
  { value: "personal", label: "Personal & Summary" },
  { value: "experience", label: "Experience" },
  { value: "projects", label: "Projects" },
  { value: "education", label: "Education" },
  { value: "skills", label: "Skills" },
  { value: "certifications", label: "Certifications" },
  { value: "languages", label: "Languages" },
  { value: "awards", label: "Awards" },
  { value: "volunteer", label: "Volunteer" },
  { value: "references", label: "References" },
  { value: "publications", label: "Publications" },
  { value: "patents", label: "Patents" },
  { value: "research", label: "Research" },
  { value: "custom", label: "Custom Sections" },
];
