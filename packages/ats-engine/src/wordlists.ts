export const STRONG_ACTION_VERBS = new Set(
  [
    "achieved", "accelerated", "architected", "automated", "built", "championed", "collaborated",
    "delivered", "designed", "developed", "directed", "drove", "engineered", "established",
    "executed", "expanded", "generated", "grew", "implemented", "improved", "increased",
    "initiated", "launched", "led", "managed", "mentored", "negotiated", "optimized",
    "orchestrated", "overhauled", "pioneered", "reduced", "resolved", "restructured",
    "scaled", "spearheaded", "streamlined", "strengthened", "transformed", "unified",
  ].map((v) => v.toLowerCase())
);

export const WEAK_VERBS = new Set(
  [
    "worked on", "helped with", "responsible for", "duties included", "assisted with",
    "involved in", "participated in", "was responsible", "handled", "dealt with",
    "tasked with", "in charge of", "worked with", "did", "made sure",
  ].map((v) => v.toLowerCase())
);

export const BUZZWORDS = new Set(
  [
    "synergy", "team player", "go-getter", "results-driven", "detail-oriented",
    "hard worker", "self-starter", "think outside the box", "dynamic", "proactive",
    "value add", "thought leader", "ninja", "rockstar", "guru", "hardworking",
    "passionate", "motivated individual", "people person", "bottom line",
  ].map((v) => v.toLowerCase())
);

export const PASSIVE_VOICE_MARKERS = [
  /\b(was|were|is|are|been|being)\s+\w+ed\b/i,
  /\b(was|were|is|are|been|being)\s+\w+en\b/i,
];

export const CANONICAL_SECTION_HEADINGS: Record<string, string[]> = {
  summary: ["summary", "professional summary", "profile", "objective", "about me"],
  experience: ["experience", "work experience", "employment history", "professional experience"],
  education: ["education", "academic background", "academic qualifications"],
  skills: ["skills", "technical skills", "core competencies", "key skills"],
  projects: ["projects", "personal projects", "key projects"],
  certifications: ["certifications", "certificates", "licenses"],
  languages: ["languages"],
  awards: ["awards", "honors", "achievements"],
  volunteer: ["volunteer", "volunteer experience", "community involvement"],
  references: ["references"],
  publications: ["publications"],
  patents: ["patents"],
  research: ["research", "research experience"],
};

export const REQUIRED_SECTIONS_FOR_ROLE_LEVEL: Record<string, string[]> = {
  default: ["summary", "experience", "education", "skills"],
  fresher: ["summary", "education", "skills", "projects"],
  executive: ["summary", "experience", "education"],
  academic: ["summary", "education", "publications", "research"],
};
