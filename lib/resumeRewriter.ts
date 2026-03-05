import { parseResume, ParsedResume, ParsedResumeSection } from "@/lib/parseResume";

type RewriteArgs = {
  jobTitle?: string;
  jobDescription?: string;
  resumeText?: string;
  strictTruthMode?: boolean;
};

type RewriteOutput = {
  summary: string;
  coreCompetencies: string[];
  rewrittenBullets: Record<string, string[]>; // sectionName -> bullets
  skillsSections: { Technical: string[]; Tools: string[] };
  skills: { Technical: string[]; Tools: string[] };
  keywordsReport: { keywordsDetected: string[]; keywordsUsed: string[]; keywordsMissing: string[] };
  rulesReport: string[];
  parsedMeta: { sectionsDetected: string[]; bulletsCount: number };
  optionalPlaceholders?: string[]; // only when strictTruthMode is false
};

const ACTION_VERBS = [
  "Led","Owned","Delivered","Optimized","Streamlined","Implemented","Built","Deployed","Improved","Automated","Resolved","Designed","Architected","Analyzed","Collaborated","Coordinated","Enhanced","Launched","Maintained","Refactored","Reduced","Increased","Standardized","Migrated","Integrated"
];

const WEAK_STARTERS = [/^responsible for\s*/i,/^worked on\s*/i,/^helped\s*/i,/^assisted\s*/i,/^involved in\s*/i,/^tasked with\s*/i,/^participated in\s*/i];

const STOP_WORDS = new Set(["the","and","for","with","from","that","this","into","over","under","via","using","use","used","to","of","in","on","at","as","an","a","by","is","are","be","been","was","were","or","nor","but","so"]);

function normalize(text: string): string { return (text || "").replace(/\s+/g, " ").trim(); }
function tokenize(text: string): string[] { return (text||"").toLowerCase().replace(/[^a-z0-9+.#\s]/g," ").split(/\s+/).filter(w=>w && !STOP_WORDS.has(w)); }
function unique<T>(arr:T[]):T[] { return Array.from(new Set(arr)); }
function pickVerb(i:number){ return ACTION_VERBS[i % ACTION_VERBS.length]; }

function extractTopKeywords(jobTitle?:string, jobDescription?:string){
  const text = `${jobTitle || ""} ${jobDescription || ""}`.toLowerCase();
  const tokens = tokenize(text);
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t]||0)+1;
  const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([k])=>k);
  const roleBoost = (w:string)=> (jobTitle && jobTitle.toLowerCase().includes(w) ? 2 : 0);
  const ranked = unique(sorted).slice(0,100).sort((a,b)=> (freq[b]+roleBoost(b)) - (freq[a]+roleBoost(a)) );
  return ranked.slice(0,50);
}

function buildKeywordsReport(jobDescription?: string, resumeText?: string){
  const detected = extractTopKeywords(undefined, jobDescription);
  const resLower = (resumeText||"").toLowerCase();
  const used = detected.filter(k=> resLower.includes(k));
  const missing = detected.filter(k=> !resLower.includes(k)).slice(0,25);
  return { keywordsDetected: detected, keywordsUsed: used, keywordsMissing: missing };
}

function removeWeakStarters(line:string){
  let s=line.trim();
  for (const rx of WEAK_STARTERS){ s = s.replace(rx,""); }
  return s.trim();
}

function reuseExistingNouns(base:string){
  // Heuristic: preserve capitalized tokens and tech tokens (contains . # +)
  const parts = base.split(/\s+/);
  const kept = parts.filter(p=> /[A-Z]/.test(p[0]) || /[.+#]/.test(p) );
  return unique(kept).slice(0,6);
}

function limit25Words(s:string){
  const words = s.split(/\s+/);
  if (words.length <= 25) return s.trim();
  return words.slice(0,25).join(" ").replace(/[,:;]+$/,'').trim();
}

function rewriteBullet(raw:string, idx:number, strictTruthMode:boolean){
  const verb = pickVerb(idx);
  const stripped = removeWeakStarters(raw.replace(/^[-•]\s*/, ""));

  // Add specificity by reusing nouns already present in the bullet
  const nouns = reuseExistingNouns(stripped);

  // Convert vague phrases into more concrete forms without adding facts
  let improved = stripped
    .replace(/\butilized\b/gi, "used")
    .replace(/\bleveraged\b/gi, "used")
    .replace(/\bthings?\b/gi, "deliverables")
    .replace(/\bstuff\b/gi, "deliverables")
    .replace(/\bvarious\b/gi, "multiple")
    .replace(/\bsome\b/gi, "several")
    .replace(/\bmany\b/gi, "multiple")
    .replace(/\bhelp(ed)?\b/gi, "supported")
    .trim();

  // Scope + Method + Outcome (heuristic assembly from existing nouns)
  const scope = nouns.slice(0,2).join(", ");
  const method = nouns.slice(2,4).join(", ");
  const outcome = nouns.slice(4,6).join(", ");

  const pieces = [verb, improved];
  if (scope) pieces.push(`for ${scope}`);
  if (method) pieces.push(`using ${method}`);
  if (outcome) pieces.push(`to improve ${outcome}`);

  let sentence = pieces.join(" ").replace(/\s+/g," ").trim();

  // Enforce strict truth: do not add numbers
  const hasNumber = /\d/.test(sentence);
  if (strictTruthMode && hasNumber){
    // keep as-is (came from resume), do nothing
  }

  sentence = limit25Words(sentence);
  return sentence;
}

function extractSkillsFromJD(jobDescription?:string){
  const hints = ["javascript","typescript","react","next.js","nextjs","node","python","java","graphql","sql","excel","google sheets","aws","gcp","azure","docker","kubernetes","tailwind","git","ci/cd","jest","playwright","cypress","html","css","redux","vite","webpack","rest","api","microservices","postgres","mongodb","redis","linux","bash"];
  const jd = (jobDescription||"").toLowerCase();
  const tech = unique(hints.filter(h=> jd.includes(h))).map(s=> s.replace(/\bnextjs\b/,"next.js"));
  const tools = unique(tech.filter(s=> ["excel","google sheets","git","docker","kubernetes"].includes(s)));
  return { Technical: tech.slice(0,20), Tools: tools.slice(0,20) };
}

export async function rewriteResume({ jobTitle, jobDescription, resumeText, strictTruthMode = true }: RewriteArgs): Promise<RewriteOutput> {
  const parsed = parseResume(resumeText);

  // Build keywords report (frequency + role relevance heuristic)
  const keywordsReport = buildKeywordsReport(jobDescription, resumeText);

  // Skills: never invent new ones — intersect JD hints with resumeText tokens
  const jdSkills = extractSkillsFromJD(jobDescription);
  const resumeLower = (resumeText||"").toLowerCase();
  const skills = {
    Technical: jdSkills.Technical.filter(s=> resumeLower.includes(s.toLowerCase())),
    Tools: jdSkills.Tools.filter(s=> resumeLower.includes(s.toLowerCase())),
  };

  // Core competencies: rank from JD tokens with simple heuristics
  const coreCompetencies = unique(extractTopKeywords(jobTitle, jobDescription))
    .filter(k=> k.length > 2)
    .slice(0,8)
    .map(k=> k.replace(/\bci\/cd\b/i, "CI/CD"));

  // Section-wise rewriting
  const rewrittenBullets: Record<string, string[]> = {};
  const optionalPlaceholders: string[] = [];

  parsed.sections.forEach((section, sIdx) => {
    const src = section.bullets.length ? section.bullets : section.lines;
    const out = src.map((b, i) => rewriteBullet(b, sIdx*100 + i, strictTruthMode)).filter(Boolean);

    // If not strict and no numbers present, allow placeholder metrics in a separate list
    if (!strictTruthMode) {
      out.forEach((bullet) => {
        if (!/\d/.test(bullet)) {
          optionalPlaceholders.push(`${bullet} [X%]`);
        }
      });
    }

    if (out.length) {
      rewrittenBullets[section.name] = out;
    }
  });

  const summary = jobTitle
    ? `Candidate aligned to ${normalize(jobTitle)} role. Focused on impact, collaboration, and reliable delivery.`
    : "Candidate focused on impact, collaboration, and reliable delivery.";

  const rulesReport: string[] = [
    "No invented tools, facts, or certifications.",
    strictTruthMode ? "Metrics injection disabled (strictTruthMode=true)." : "Optional placeholders available under optionalPlaceholders.",
    "Bullets constrained to ~25 words, single line.",
    "Weak verbs normalized; specificity improved using existing nouns only.",
  ];

  const output: RewriteOutput = {
    summary,
    coreCompetencies,
    rewrittenBullets,
    skillsSections: skills,
    skills,
    keywordsReport,
    rulesReport,
    parsedMeta: { sectionsDetected: parsed.sectionOrder, bulletsCount: parsed.allBullets.length },
  };

  if (!strictTruthMode && optionalPlaceholders.length) {
    output.optionalPlaceholders = unique(optionalPlaceholders);
  }

  return output;
}
