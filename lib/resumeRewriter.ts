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
  "led","owned","delivered","optimized","streamlined","implemented","built","deployed","improved","automated","resolved","designed","architected","analyzed","collaborated","coordinated","enhanced","launched","maintained","refactored","reduced","increased","standardized","migrated","integrated","developed","created","managed","tested","validated","documented","configured","orchestrated","monitored","supported","debugged","fixed","reviewed","planned","executed"
];

const VERB_SET = new Set(ACTION_VERBS);

const WEAK_STARTERS = [/^responsible for\s*/i,/^worked on\s*/i,/^helped\s*/i,/^assisted\s*/i,/^involved in\s*/i,/^tasked with\s*/i,/^participated in\s*/i];

const STOP_WORDS = new Set(["the","and","for","with","from","that","this","into","over","under","via","using","use","used","to","of","in","on","at","as","an","a","by","is","are","be","been","was","were","or","nor","but","so"]);

function normalize(text: string): string { return (text || "").replace(/\s+/g, " ").trim(); }
function tokenize(text: string): string[] { return (text||"").toLowerCase().replace(/[^a-z0-9+.#\s]/g," ").split(/\s+/).filter(w=>w && !STOP_WORDS.has(w)); }
function unique<T>(arr:T[]):T[] { return Array.from(new Set(arr)); }
function startsWithVerb(s:string){ const w=(s.trim().match(/^([A-Za-z]+)/)?.[1]||"").toLowerCase(); return VERB_SET.has(w); }

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
  let base = removeWeakStarters(raw.replace(/^[-•]\s*/, "")).trim();
  if (!base) return "";

  // If bullet already starts with a strong verb, keep it and avoid adding another
  const alreadyStartsWithVerb = startsWithVerb(base);

  // Normalize vague wording without adding new facts
  base = base
    .replace(/\butilized\b/gi, "used")
    .replace(/\bleveraged\b/gi, "used")
    .replace(/\bthings?\b/gi, "deliverables")
    .replace(/\bstuff\b/gi, "deliverables")
    .replace(/\bvarious\b/gi, "multiple")
    .replace(/\bsome\b/gi, "several")
    .replace(/\bmany\b/gi, "multiple")
    .replace(/\bhelp(ed)?\b/gi, "supported")
    .trim();

  // Build components: ActionVerb + WhatWasBuilt + PurposeOrImpact
  const nouns = reuseExistingNouns(base);
  const what = base; // keep original content (clarified), don't invent
  const purpose = nouns.slice(0,2).join(", ");

  let sentence = "";
  if (alreadyStartsWithVerb) {
    // Keep single leading verb, ensure grammar
    sentence = what;
  } else {
    const verb = pickVerb(idx);
    sentence = `${verb} ${what}`;
  }

  if (purpose) {
    // add a light purpose clause using existing nouns only
    sentence = `${sentence} to improve ${purpose}`.replace(/\s+/g, " ");
  }

  // Strict truth: do not add numbers; if numbers already exist, keep them
  if (strictTruthMode) {
    // no-op; we never inject metrics in this path
  }

  return limit25Words(sentence).replace(/[.;,:\s]+$/,'').trim();
}

function extractSkills(jobDescription?:string, resumeText?:string){
  // Categories per requirement
  const CATS: Record<string,string[]> = {
    Languages: ["javascript","typescript","python","java","c#","go","ruby","php","sql"],
    Frameworks: ["react","next.js","nextjs","node","express","django","flask","spring","redux","vite","webpack","jest","playwright","cypress"],
    Tools: ["git","docker","kubernetes","webpack","babel","eslint","prettier","excel","google sheets"],
    Platforms: ["aws","gcp","azure","linux","macos","windows"],
    Concepts: ["graphql","rest","microservices","ci/cd","tdd","oop","functional","design patterns"],
  };
  const jd = (jobDescription||"").toLowerCase();
  const res = (resumeText||"").toLowerCase();

  const clean = (s:string)=> s.replace(/\bnextjs\b/,"next.js").replace(/\bci\/cd\b/,'CI/CD');

  const out: Record<keyof typeof CATS, string[]> = {
    Languages: [], Frameworks: [], Tools: [], Platforms: [], Concepts: []
  } as any;

  (Object.keys(CATS) as (keyof typeof CATS)[]).forEach((k) => {
    const values = CATS[k]
      .filter(v => jd.includes(v) || res.includes(v))
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(clean)
      .filter(Boolean);
    // Only keep skills present in the resume text to avoid invention
    out[k] = values.filter(v => res.includes(v.toLowerCase()));
  });

  // Remove duplicates across categories while preserving category priority order
  const seen = new Set<string>();
  (Object.keys(out) as (keyof typeof out)[]).forEach((k) => {
    out[k] = out[k].filter(s => { const key=s.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; });
  });

  return out;
}

export async function rewriteResume({ jobTitle, jobDescription, resumeText, strictTruthMode = true }: RewriteArgs): Promise<RewriteOutput> {
  const parsed = parseResume(resumeText);

  // Build keywords report (frequency + role relevance heuristic)
  const keywordsReport = buildKeywordsReport(jobDescription, resumeText);

  // Skills: group and list cleanly without rewriting into sentences; never invent
  const groupedSkills = extractSkills(jobDescription, resumeText);
  const skills = { // maintain old shape for UI compatibility and provide richer categories in skillsSections
    Technical: [...groupedSkills.Languages, ...groupedSkills.Frameworks].slice(0, 20),
    Tools: [...groupedSkills.Tools, ...groupedSkills.Platforms, ...groupedSkills.Concepts].slice(0, 20),
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
    // Provide richer categories as skillsSections while keeping 'skills' alias for compatibility
    skillsSections: groupedSkills as any,
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
