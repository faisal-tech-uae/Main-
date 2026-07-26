/**
 * Domain glossary for MEP (Mechanical, Electrical, Plumbing) and related
 * building-services disciplines, tuned for the UAE construction/facilities
 * market. Used to:
 *  - let the resume builder offer a discipline picker with the right
 *    keyword suggestions per role
 *  - inject the correct terminology into AI prompts (resume analysis,
 *    rewrite, keyword/JD matching) instead of generic corporate phrasing
 *  - improve keyword matching in the ATS engine for MEP job descriptions
 */

export interface DisciplineGlossary {
  id: string;
  label: string;
  /** Alternate titles/phrases used to fuzzy-match a free-text job title to this discipline. */
  aliases: string[];
  /** Systems, equipment, and tools a resume in this discipline should reference. */
  keywords: string[];
  /** Software/tools commonly expected for this discipline in the UAE market. */
  tools: string[];
}

export const MEP_DISCIPLINES: DisciplineGlossary[] = [
  {
    id: "mechanical",
    label: "Mechanical Engineer",
    aliases: ["mechanical engineer", "mechanical design engineer", "piping engineer"],
    keywords: [
      "HVAC systems", "chilled water systems", "chillers", "AHU", "FAHU", "FCU", "VRF/VRV systems",
      "package units", "cooling load calculation (HAP/Carrier/Elite)", "ductwork design", "piping design",
      "pump sizing", "fire fighting systems", "plumbing and drainage", "domestic water systems",
      "LEED/Estidama compliance", "as-built drawings", "shop drawings", "method statements", "MEP coordination",
    ],
    tools: ["AutoCAD MEP", "Revit MEP", "Carrier HAP", "Elite CHVAC", "Ductulator", "Navisworks", "Primavera P6"],
  },
  {
    id: "electrical",
    label: "Electrical Engineer",
    aliases: ["electrical engineer", "electrical design engineer", "power systems engineer"],
    keywords: [
      "LV/MV distribution", "power distribution", "load calculation", "cable sizing", "voltage drop calculation",
      "single line diagrams (SLD)", "lighting design", "earthing and lightning protection", "generators",
      "UPS systems", "transformers", "switchgear", "DEWA/ADDC/FEWA/SEWA approvals", "ELV coordination",
      "fire alarm systems", "as-built drawings", "shop drawings", "MEP coordination",
    ],
    tools: ["AutoCAD Electrical", "Revit MEP", "ETAP", "Dialux/Relux", "Amtech/Trimble", "Primavera P6"],
  },
  {
    id: "hvac",
    label: "HVAC Engineer",
    aliases: ["hvac engineer", "hvac design engineer", "hvac site engineer", "air conditioning engineer"],
    keywords: [
      "chilled water systems", "chillers", "cooling towers", "AHU/FAHU/FCU", "VRF/VRV systems", "ductwork",
      "BMS integration", "cooling load calculation", "duct sizing", "refrigerant systems", "testing & balancing (TAB)",
      "ASHRAE standards", "SMACNA standards", "energy efficiency (Estidama/LEED)",
    ],
    tools: ["Carrier HAP", "Elite CHVAC", "Ductulator", "AutoCAD MEP", "Revit MEP"],
  },
  {
    id: "mep-engineer",
    label: "MEP Engineer",
    aliases: ["mep engineer", "mep design engineer", "mep coordination engineer", "mep project engineer"],
    keywords: [
      "mechanical, electrical & plumbing coordination", "clash detection (BIM)", "shop drawings", "as-built drawings",
      "method statements", "material submittals", "HVAC systems", "fire fighting & fire alarm systems",
      "electrical distribution", "plumbing & drainage", "BMS", "ELV systems", "NFPA/ASHRAE/SMACNA compliance",
      "civil defence approvals", "DEWA/ADDC approvals", "QA/QC inspections",
    ],
    tools: ["AutoCAD MEP", "Revit MEP", "Navisworks", "Primavera P6", "MS Project"],
  },
  {
    id: "site-engineer",
    label: "Site Engineer (MEP)",
    aliases: ["site engineer", "mep site engineer", "field engineer", "site supervisor"],
    keywords: [
      "site supervision", "installation inspection", "method statements", "material submittals", "RFI management",
      "snag list management", "testing & commissioning", "HSE compliance", "subcontractor coordination",
      "progress reporting", "as-built drawings", "quality checks", "civil defence inspection coordination",
    ],
    tools: ["AutoCAD", "Primavera P6", "MS Project", "Aconex", "MS Excel"],
  },
  {
    id: "facilities-manager",
    label: "Facilities Manager",
    aliases: ["facilities manager", "facility manager", "fm manager", "hard services manager"],
    keywords: [
      "hard services management", "soft services management", "planned preventive maintenance (PPM)",
      "reactive maintenance", "CAFM systems", "SLA/KPI management", "vendor management", "budget management",
      "energy management", "building management systems (BMS)", "asset management", "compliance & risk management",
      "civil defence compliance", "helpdesk management",
    ],
    tools: ["CAFM (Concept/MRI/Maximo)", "MS Excel", "BMS platforms", "Power BI"],
  },
  {
    id: "facilities-engineer",
    label: "Facilities Engineer",
    aliases: ["facilities engineer", "facility engineer", "maintenance engineer", "mep maintenance engineer"],
    keywords: [
      "planned preventive maintenance (PPM)", "reactive maintenance", "HVAC maintenance", "electrical maintenance",
      "plumbing maintenance", "fire & safety systems maintenance", "BMS monitoring", "asset lifecycle management",
      "energy efficiency initiatives", "spare parts management", "vendor coordination", "CAFM systems",
    ],
    tools: ["CAFM (Concept/MRI/Maximo)", "BMS platforms", "MS Excel"],
  },
  {
    id: "fire-fighting",
    label: "Fire Fighting & Fire Alarm Engineer",
    aliases: ["fire fighting engineer", "fire alarm engineer", "fire protection engineer"],
    keywords: [
      "fire fighting systems", "sprinkler systems", "fire pumps", "fire alarm & detection systems",
      "NFPA standards", "civil defence approvals", "hydraulic calculations", "fire suppression systems",
      "as-built drawings", "testing & commissioning",
    ],
    tools: ["AutoCAD", "Hydraulic calculation software", "Revit MEP"],
  },
  {
    id: "plumbing",
    label: "Plumbing Engineer",
    aliases: ["plumbing engineer", "public health engineer"],
    keywords: [
      "domestic water supply systems", "drainage & sewerage systems", "storm water systems", "water pumps",
      "sanitary systems", "grey water/recycled water systems", "pipe sizing calculations", "shop drawings",
    ],
    tools: ["AutoCAD MEP", "Revit MEP"],
  },
  {
    id: "elv",
    label: "ELV/BMS Engineer",
    aliases: ["elv engineer", "bms engineer", "low current engineer", "ict engineer"],
    keywords: [
      "extra low voltage (ELV) systems", "building management systems (BMS)", "CCTV & access control",
      "structured cabling", "public address systems", "fire alarm integration", "SCADA", "PLC programming",
      "network infrastructure",
    ],
    tools: ["AutoCAD", "BMS platforms (Honeywell/Siemens/Schneider)", "Revit MEP"],
  },
  {
    id: "qaqc",
    label: "QA/QC Engineer (MEP)",
    aliases: ["qa/qc engineer", "quality engineer", "mep qa qc engineer"],
    keywords: [
      "quality assurance", "quality control", "inspection & test plans (ITP)", "non-conformance reports (NCR)",
      "material submittals", "method statements", "ISO 9001 compliance", "site inspections", "snag list management",
    ],
    tools: ["MS Excel", "Aconex", "AutoCAD"],
  },
];

/** UAE-specific regulatory bodies, utilities, and certifications worth referencing on an MEP CV. */
export const UAE_MEP_AUTHORITIES_AND_CERTIFICATIONS = [
  "DEWA (Dubai Electricity & Water Authority)",
  "ADDC / AADC (Abu Dhabi Distribution Companies)",
  "FEWA (Federal Electricity & Water Authority)",
  "SEWA (Sharjah Electricity & Water Authority)",
  "Dubai Civil Defence approval",
  "Abu Dhabi Civil Defence approval",
  "Trakhees (Dubai Ports, Customs & Free Zone Corporation) approval",
  "Dubai Municipality approval",
  "Estidama Pearl Rating System",
  "LEED (Leadership in Energy & Environmental Design)",
  "NFPA (National Fire Protection Association) standards",
  "ASHRAE standards",
  "SMACNA standards",
  "NEBOSH IGC",
  "IOSH Managing Safely",
  "PMP (Project Management Professional)",
  "UAE driving license",
];

/** Best-effort match of a free-text job title (e.g. "Senior MEP Site Engineer") to a discipline. */
export function matchDiscipline(freeTextTitle: string): DisciplineGlossary | null {
  const normalized = freeTextTitle.trim().toLowerCase();
  if (!normalized) return null;

  let best: { discipline: DisciplineGlossary; score: number } | null = null;

  for (const discipline of MEP_DISCIPLINES) {
    for (const alias of [discipline.label, ...discipline.aliases]) {
      const aliasLower = alias.toLowerCase();
      if (normalized === aliasLower) {
        return discipline;
      }
      if (normalized.includes(aliasLower)) {
        const score = aliasLower.length;
        if (!best || score > best.score) {
          best = { discipline, score };
        }
      }
    }
  }

  return best?.discipline ?? null;
}

export function findDisciplineById(id: string): DisciplineGlossary | undefined {
  return MEP_DISCIPLINES.find((d) => d.id === id);
}

/** Renders a compact glossary block to splice into an AI prompt for the given discipline. */
export function buildDisciplineGlossaryText(discipline: DisciplineGlossary | null): string {
  if (!discipline) return "";
  return [
    `Target discipline: ${discipline.label}.`,
    `Relevant systems/terminology to use where accurate: ${discipline.keywords.join(", ")}.`,
    `Relevant tools/software: ${discipline.tools.join(", ")}.`,
    `This CV targets the UAE market. Where relevant and truthful, reference UAE authorities/certifications such as: ${UAE_MEP_AUTHORITIES_AND_CERTIFICATIONS.slice(0, 8).join(", ")}.`,
    "Never invent a certification, approval, or system the candidate has not stated they have experience with.",
  ].join(" ");
}
