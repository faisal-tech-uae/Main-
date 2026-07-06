import type { ResumeDocument } from "@resumeai/shared";

function formatDateRange(startDate: string, endDate?: string, current?: boolean) {
  const end = current ? "Present" : (endDate ?? "");
  return end ? `${startDate} – ${end}` : startDate;
}

/** Mirrors the server-side PDF/DOCX exporter layout: single column, no tables, no images. */
export function ResumePreview({ doc, accentColor = "#2563EB" }: { doc: ResumeDocument; accentColor?: string }) {
  return (
    <div className="mx-auto aspect-[8.5/11] w-full max-w-[680px] overflow-y-auto bg-white p-10 text-[13px] text-neutral-900 shadow-sm">
      <h1 className="text-2xl font-bold">{doc.personalInfo.fullName || "Your Name"}</h1>
      <p className="mt-1 text-neutral-600">
        {[doc.personalInfo.email, doc.personalInfo.phone, doc.personalInfo.location, doc.personalInfo.linkedinUrl].filter(Boolean).join("  |  ")}
      </p>

      {doc.summary?.content && (
        <Section title="Summary" accentColor={accentColor}>
          <p>{doc.summary.content}</p>
        </Section>
      )}

      {doc.experience.length > 0 && (
        <Section title="Experience" accentColor={accentColor}>
          {doc.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between font-semibold">
                <span>
                  {exp.jobTitle} — {exp.employer}
                </span>
                <span className="font-normal text-neutral-500">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</span>
              </div>
              <ul className="ml-4 list-disc">
                {exp.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {doc.projects.length > 0 && (
        <Section title="Projects" accentColor={accentColor}>
          {doc.projects.map((p) => (
            <div key={p.id} className="mb-3">
              <div className="font-semibold">{p.name}</div>
              <ul className="ml-4 list-disc">
                {p.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {doc.education.length > 0 && (
        <Section title="Education" accentColor={accentColor}>
          {doc.education.map((edu) => (
            <div key={edu.id} className="mb-2 flex justify-between">
              <span>
                {edu.degree}
                {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""} — {edu.institution}
              </span>
              <span className="text-neutral-500">{formatDateRange(edu.startDate, edu.endDate, edu.current)}</span>
            </div>
          ))}
        </Section>
      )}

      {doc.certifications.length > 0 && (
        <Section title="Certifications" accentColor={accentColor}>
          {doc.certifications.map((c) => (
            <div key={c.id}>
              {c.name}
              {c.issuer ? ` — ${c.issuer}` : ""}
            </div>
          ))}
        </Section>
      )}

      {doc.skills.length > 0 && (
        <Section title="Skills" accentColor={accentColor}>
          {doc.skills.map((s) => (
            <div key={s.id}>
              <span className="font-semibold">{s.category}: </span>
              {s.items.join(", ")}
            </div>
          ))}
        </Section>
      )}

      {doc.languages.length > 0 && (
        <Section title="Languages" accentColor={accentColor}>
          <p>{doc.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}</p>
        </Section>
      )}

      {doc.awards.length > 0 && (
        <Section title="Awards" accentColor={accentColor}>
          {doc.awards.map((a) => (
            <div key={a.id}>
              {a.title}
              {a.issuer ? ` — ${a.issuer}` : ""}
            </div>
          ))}
        </Section>
      )}

      {doc.volunteer.length > 0 && (
        <Section title="Volunteer Experience" accentColor={accentColor}>
          {doc.volunteer.map((v) => (
            <div key={v.id} className="mb-2">
              <div className="font-semibold">
                {v.role} {v.organization}
              </div>
              <ul className="ml-4 list-disc">
                {v.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {doc.publications.length > 0 && (
        <Section title="Publications" accentColor={accentColor}>
          {doc.publications.map((p) => (
            <div key={p.id}>{p.title}</div>
          ))}
        </Section>
      )}

      {doc.patents.length > 0 && (
        <Section title="Patents" accentColor={accentColor}>
          {doc.patents.map((p) => (
            <div key={p.id}>{p.title}</div>
          ))}
        </Section>
      )}

      {doc.research.length > 0 && (
        <Section title="Research" accentColor={accentColor}>
          {doc.research.map((r) => (
            <div key={r.id}>{r.title}</div>
          ))}
        </Section>
      )}

      {doc.references.length > 0 && (
        <Section title="References" accentColor={accentColor}>
          {doc.references.map((r) => (
            <div key={r.id}>
              {r.name} {r.title ? `— ${r.title}` : ""} {r.company ? `, ${r.company}` : ""}
            </div>
          ))}
        </Section>
      )}

      {doc.customSections.map((custom) => (
        <Section key={custom.id} title={custom.title} accentColor={accentColor}>
          {custom.items.map((item) => (
            <div key={item.id} className="mb-2">
              {item.heading && <div className="font-semibold">{item.heading}</div>}
              <ul className="ml-4 list-disc">
                {item.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      ))}
    </div>
  );
}

function Section({ title, accentColor, children }: { title: string; accentColor: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h2 className="border-b pb-1 text-sm font-bold uppercase tracking-wide" style={{ borderColor: accentColor, color: accentColor }}>
        {title}
      </h2>
      <div className="mt-1.5 space-y-1">{children}</div>
    </div>
  );
}
