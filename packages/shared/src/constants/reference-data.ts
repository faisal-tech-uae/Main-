export const INDUSTRIES = [
  "Software & Technology",
  "Engineering",
  "Healthcare",
  "Finance & Banking",
  "Construction",
  "Architecture",
  "Project Management",
  "Mechanical",
  "Electrical",
  "MEP",
  "Civil",
  "Human Resources",
  "Marketing",
  "Legal",
  "Hospitality",
  "Sales",
  "Teaching & Education",
  "Academic & Research",
  "Government & Public Sector",
  "Executive Leadership",
] as const;

export const JOB_LEVELS = [
  "Internship",
  "Entry Level / Fresher",
  "Associate",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "VP",
  "C-Level / Executive",
] as const;

// Non-exhaustive but broad list to seed country-specific formatting rules
// (e.g. photo/DOB expectations, date formats, spelling variants).
export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Saudi Arabia",
  "India",
  "Pakistan",
  "Germany",
  "France",
  "Singapore",
  "South Africa",
  "New Zealand",
  "Ireland",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type JobLevel = (typeof JOB_LEVELS)[number];
export type Country = (typeof COUNTRIES)[number];
