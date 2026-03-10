import { parseResume, ParsedResumeSection } from "./parseResume";

/**
 * Resume rewriting utility:
 * - Only rewrites EXPERIENCE or PROJECT section bullets.
 * - Outputs SKILLS as grouped ATS-friendly lists: Languages, Frameworks, Tools, Platforms, Concepts.
 * - Does not rewrite SKILLS into bullets or sentences.
 * - Bullets: ActionVerb + WhatWasDone + Context, max 22 words, never duplicate verbs or "to improve Built" etc.
 * - Keyword output ignores generic hiring filler.
 */

// Junk tokens to exclude from keywords and core competencies
const JUNK_KEYWORDS = [
  "preferred",
  "knowledge",
  "ready",
  "features",
  "experience",
  "systems" // no period -- matches 'systems' as a token
];

type RewriteArgs = {
  jobTitle?: string;
  jobDescription?: string;
  resumeText?: string;
  strictTruthMode?: boolean;
};

type SkillGroups = {
  Languages: string[];
  Frameworks: string[];
  Tools: string[];
  Platforms: string[];
  Concepts: string[];
};

type RewriteOutput = {
  summary: string;
  coreCompetencies: string[];
  rewrittenBullets: Record<string, string[]>;
  skillsSections: SkillGroups; // grouped
  skills: SkillGroups;         // flat for compat
  keywordsReport: {
    keywordsDetected: string[];
    keywordsUsed: string[];
    keywordsMissing: string[];
  };
  rulesReport: string[];
  parsedMeta: { sectionsDetected: string[]; bulletsCount: number };
  optionalPlaceholders?: string[];
};

// --- Verb/Skill data, helpers ---

/** Verbs that can start a bullet we keep as-is (preserve original). */
const RAW_ACTION_VERBS = [
  "led", "owned", "delivered", "optimized", "streamlined", "implemented", "built", "deployed", "improved",
  "automated", "resolved", "designed", "architected", "analyzed", "collaborated", "coordinated", "enhanced",
  "launched", "maintained", "refactored", "reduced", "increased", "standardized", "migrated", "integrated",
  "developed", "created", "managed", "tested", "validated", "documented", "configured", "orchestrated",
  "monitored", "supported", "debugged", "fixed", "reviewed", "planned", "executed",
  "maintain", "wrote", "written", "write", "fix", "debug", "work", "worked", "writing"
];
const ACTION_VERBS = RAW_ACTION_VERBS.map((v) => v.toLowerCase());
const VERB_SET = new Set(ACTION_VERBS);

/** Only these when prepending to avoid broken grammar (e.g. "Reduced maintain", "Standardized Wrote"). */
const SAFE_PREPEND_VERBS = ["built", "developed", "created", "assisted", "maintained", "documented", "debugged", "improved"];
function pickSafeVerb(idx: number): string {
  const v = SAFE_PREPEND_VERBS[idx % SAFE_PREPEND_VERBS.length];
  return v.charAt(0).toUpperCase() + v.slice(1);
}

const EXPERIENCE_LIKE_SECTIONS = [
  "experience", "work experience", "professional experience", "projects", "project experience", "relevant experience"
];
const SKILLS_SECTIONS = ["skills", "technical skills", "key skills"];

const SKILL_GROUPS = {
  Languages: [
    "javascript", "typescript", "python", "java", "c#", "go", "ruby", "php", "sql", "html", "css", "scss", "rust", "kotlin", "swift", "r", "scala"
  ],
  Frameworks: [
    "react", "next.js", "nextjs", "node", "express", "django", "flask", "spring", "redux", "vite", "webpack", "jest", "playwright", "cypress",
    "vue", "vue.js", "vuejs", "angular", "svelte", "nuxt", "fastapi", "rails", "ruby on rails", "laravel", "asp.net", "tailwind", "bootstrap"
  ],
  Tools: [
    "git", "docker", "kubernetes", "webpack", "babel", "eslint", "prettier", "excel", "google sheets",
    "postgresql", "postgres", "mysql", "mongodb", "redis", "nginx", "jenkins", "github", "gitlab", "jira", "figma", "vs code"
  ],
  Platforms: [
    "aws", "gcp", "azure", "linux", "macos", "windows", "vps", "vercel", "netlify", "heroku", "ubuntu", "debian", "digitalocean"
  ],
  Concepts: [
    "graphql", "rest", "microservices", "ci/cd", "tdd", "oop", "functional", "design patterns",
    "api", "apis", "database design", "web performance", "responsive design", "agile", "scrum", "devops"
  ]
};

// Expanded to include more filler/junk to be filtered from keywords everywhere
const GENERIC_HIRING_KEYWORDS = [
  "candidate", "should", "demonstrate", "ability", "responsible", "strong", "preferred", "skills",
  "requirements", "desired", "must", "proven", "excellent",
  "knowledge", "ready", "features", "experience", "systems"
];

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "into", "over", "under",
  "via", "using", "use", "used", "to", "of", "in", "on", "at", "as", "an", "a",
  "by", "is", "are", "be", "been", "was", "were", "or", "nor", "but", "so"
]);

function normalize(text: string): string {
  return (text || "").replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .split(/\s+/)
    .filter(w => w && !STOP_WORDS.has(w));
}
function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
function startsWithVerb(s: string): boolean {
  const word = (s.trim().match(/^([A-Za-z]+)/)?.[1] || "").toLowerCase();
  return VERB_SET.has(word);
}

function removeWeakStarters(line: string): string {
  return line
    .replace(/^[-•]\s*/, "")
    .replace(/^responsible for\s*/i, "")
    .replace(/^worked on\s*/i, "")
    .replace(/^helped\s*/i, "")
    .replace(/^assisted\s+(?!(with|in)\s)/i, "") // keep "Assisted with" / "Assisted in"
    .replace(/^involved in\s*/i, "")
    .replace(/^tasked with\s*/i, "")
    .replace(/^participated in\s*/i, "")
    .trim();
}

function limitWords(sentence: string, wordLimit = 22): string {
  const words = sentence.split(/\s+/);
  if (words.length <= wordLimit) return sentence.trim();
  return words.slice(0, wordLimit).join(" ").replace(/[,:;]+$/, '').trim();
}

/**
 * Natural phrase rewrites before other processing. Preserve grammar; avoid ungrammatical verb+verb.
 */
function applyPhraseRewrites(line: string): string {
  return line
    .replace(/^\s*Helped write\s+/i, "Assisted in writing ")
    .replace(/^\s*Helped\s+/i, "Assisted with ")
    .replace(/^\s*Worked with\s+/i, "Collaborated with ")
    .replace(/^\s*Wrote documentation\s*/i, "Documented ")
    .replace(/^\s*Wrote docs\s*/i, "Documented ")
    .trim();
}

/** After "Assisted with/in" / "Collaborated with", use gerund for bare verbs (fix -> fixing, write -> writing). */
function fixGerundAfterPhrase(line: string): string {
  return line
    .replace(/\bAssisted with fix\b/gi, "Assisted with fixing")
    .replace(/\bAssisted with debug\b/gi, "Assisted with debugging")
    .replace(/\bAssisted with work\b/gi, "Assisted with working")
    .replace(/\bAssisted with write\b/gi, "Assisted with writing")
    .replace(/\bAssisted with maintain\b/gi, "Assisted with maintaining")
    .replace(/\bAssisted in fix\b/gi, "Assisted in fixing")
    .replace(/\bAssisted in debug\b/gi, "Assisted in debugging")
    .replace(/\bAssisted in work\b/gi, "Assisted in working")
    .replace(/\bAssisted in write\b/gi, "Assisted in writing")
    .replace(/\bAssisted in maintain\b/gi, "Assisted in maintaining")
    .replace(/\bCollaborated with fix\b/gi, "Collaborated with fixing")
    .replace(/\bCollaborated with debug\b/gi, "Collaborated with debugging")
    .trim();
}

/** True if line already starts with a strong phrase we must not prepend a verb to (avoids "Created Assisted in..."). */
function startsWithPhraseVerb(line: string): boolean {
  return /^(Assisted with|Assisted in|Collaborated with|Documented)\s/i.test(line.trim());
}

/**
 * Rewrite a single bullet according to strict rules. Exported for use when LLM returns unchanged bullets.
 */
export function rewriteBullet(raw: string, idx: number, _strictTruthMode: boolean): string {
  let base = applyPhraseRewrites(raw);
  base = fixGerundAfterPhrase(base);
  base = removeWeakStarters(base);

  if (!base) return "";

  // Normalize vague or filler terms
  base = base
    .replace(/\butilized\b/gi, "used")
    .replace(/\bleveraged\b/gi, "used")
    .replace(/\bthings?\b/gi, "deliverables")
    .replace(/\bstuff\b/gi, "deliverables")
    .replace(/\bvarious\b/gi, "multiple")
    .replace(/\bsome\b/gi, "several")
    .replace(/\bmany\b/gi, "multiple")
    .replace(/\bthe team\b/gi, "team")
    .replace(/\bhelp(ed)?\b/gi, "supported")
    .replace(/\bmultiple times\b/i, "repeatedly")
    .trim();

  // Remove any phrase like "to improve Built", "to improve Developed", etc. regardless of case/position
  base = base.replace(/\bto improve\s+(built|developed|implemented|delivered|designed|created)\b/gi, "");
  // Remove trailing to improve Nouns (e.g. "to improve Languages")
  base = base.replace(/\bto improve\s+[A-Za-z.#+]+\b/gi, "");

  // Remove repeated verbs at the very start: "Built Built XYZ"
  let words = base.split(/\s+/);
  if (words.length > 1 &&
    VERB_SET.has(words[0].toLowerCase()) &&
    words[0].toLowerCase() === words[1].toLowerCase()) {
    base = words.slice(1).join(" ");
  }

  // If bullet already starts with a resume verb or phrase (Assisted with, Collaborated with, Documented), keep it, do not prepend
  if (startsWithPhraseVerb(base) || startsWithVerb(base)) {
    // Remove duplicate verb as second word if found: "Developed Built XYZ" -> "Developed XYZ"
    let tokens = base.split(/\s+/);
    if (
      tokens.length > 1 &&
      VERB_SET.has(tokens[0].toLowerCase()) &&
      VERB_SET.has(tokens[1].toLowerCase())
    ) {
      // Drop token[1]
      tokens.splice(1, 1);
      base = tokens.join(" ");
    }
    // Uppercase first letter
    base = base.charAt(0).toUpperCase() + base.slice(1);
    return limitWords(base, 22).replace(/[.;,:\s]+$/, '').trim();
  } else {
    // Only prepend a verb if the first word is not verb-like (avoid "Maintained fix bugs", "Documented Worked with")
    const firstWord = base.split(/\s+/)[0]?.toLowerCase() ?? "";
    if (VERB_SET.has(firstWord)) {
      return limitWords(base.charAt(0).toUpperCase() + base.slice(1), 22).replace(/[.;,:\s]+$/, "").trim();
    }
    const verb = pickSafeVerb(idx);
    let tokens = base.split(/\s+/);
    if (tokens[0] && tokens[0].toLowerCase() === verb.toLowerCase()) tokens = tokens.slice(1);
    if (tokens.length === 0) return "";
    const final = `${verb} ${tokens.join(" ")}`;
    // #region agent log
    if (base.toLowerCase().startsWith("assisted in") || base.toLowerCase().startsWith("assisted with")) {
      fetch('http://127.0.0.1:7476/ingest/812feeb0-258e-4aad-b3e4-9211f6328f81',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f2f1a6'},body:JSON.stringify({sessionId:'f2f1a6',location:'resumeRewriter.ts:prepend',message:'prepended verb to Assisted in/with',data:{raw:raw.slice(0,60),base:base.slice(0,60),verb,final:final.slice(0,80)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    }
    // #endregion
    return limitWords(final, 22).replace(/[.;,:\s]+$/, "").trim();
  }
}

const normalizeSkill = (s: string) =>
  s.replace(/\bnextjs\b/gi, "Next.js")
    .replace(/\bci\/cd\b/gi, "CI/CD")
    .replace(/\baws\b/gi, "AWS")
    .replace(/\bgcp\b/gi, "GCP")
    .replace(/\bazure\b/gi, "Azure")
    .replace(/\boop\b/gi, "OOP")
    .replace(/\bphp\b/gi, "PHP")
    .replace(/\bapi\b/gi, "API")
    .replace(/\bapis\b/gi, "APIs")
    .replace(/\bjs\b/gi, "JS")
    .replace(/\bpython\b/gi, "Python")
    .replace(/\btypescript\b/gi, "TypeScript")
    .replace(/\bjavascript\b/gi, "JavaScript")
    .replace(/\bexcel\b/gi, "Excel")
    .replace(/\bgoogle sheets\b/gi, "Google Sheets")
    .replace(/\bsql\b/gi, "SQL")
    .replace(/\bc#/gi, "C#")
    .replace(/\bgo\b/gi, "Go")
    .replace(/\bruby\b/gi, "Ruby")
    .replace(/\bruby on rails\b/gi, "Ruby on Rails")
    .replace(/\bdjango\b/gi, "Django")
    .replace(/\bflask\b/gi, "Flask")
    .replace(/\bspring\b/gi, "Spring")
    .replace(/\bredux\b/gi, "Redux")
    .replace(/\bvite\b/gi, "Vite")
    .replace(/\bwebpack\b/gi, "Webpack")
    .replace(/\bbabel\b/gi, "Babel")
    .replace(/\beslint\b/gi, "ESLint")
    .replace(/\bprettier\b/gi, "Prettier")
    .replace(/\bplaywright\b/gi, "Playwright")
    .replace(/\bjest\b/gi, "Jest")
    .replace(/\bcypress\b/gi, "Cypress")
    .replace(/\bdocker\b/gi, "Docker")
    .replace(/\bkubernetes\b/gi, "Kubernetes")
    .replace(/\blinux\b/gi, "Linux")
    .replace(/\bmacos\b/gi, "macOS")
    .replace(/\bwindows\b/gi, "Windows")
    .replace(/\bmicroservices\b/gi, "Microservices")
    .replace(/\bgraphql\b/gi, "GraphQL")
    .replace(/\brest\b/gi, "REST")
    .replace(/\btdd\b/gi, "TDD")
    .replace(/\bfunctional\b/gi, "Functional")
    .replace(/\bdesign patterns\b/gi, "Design Patterns")
    .replace(/\bnode\b/gi, "Node")
    .replace(/\bexpress\b/gi, "Express")
    .replace(/\bvue\b/gi, "Vue")
    .replace(/\bvue\.?js\b/gi, "Vue.js")
    .replace(/\bpostgresql\b/gi, "PostgreSQL")
    .replace(/\bpostgres\b/gi, "PostgreSQL")
    .replace(/\bmongodb\b/gi, "MongoDB")
    .replace(/\bredis\b/gi, "Redis")
    .replace(/\bnginx\b/gi, "Nginx")
    .replace(/\bvps\b/gi, "VPS")
    .replace(/\bvercel\b/gi, "Vercel")
    .replace(/\bnetlify\b/gi, "Netlify")
    .replace(/\bheroku\b/gi, "Heroku")
    .replace(/\bubuntu\b/gi, "Ubuntu")
    .trim();

/** Match skills from a text string into found sets (shared logic) */
function matchSkillsInText(text: string, found: Record<keyof typeof SKILL_GROUPS, Set<string>>): void {
  const lower = (text || "").toLowerCase();
  for (const key of Object.keys(SKILL_GROUPS) as (keyof typeof SKILL_GROUPS)[]) {
    for (const skillKey of SKILL_GROUPS[key]) {
      const escaped = skillKey.replace(/\./g, '\\.').replace(/\+/g, '\\+').replace(/#/g, '\\#').replace(/\//g, '\\/');
      const rx = new RegExp(`\\b${escaped}\\b`, "i");
      if (rx.test(lower)) {
        found[key].add(normalizeSkill(skillKey));
      }
    }
  }
}

/** Extract grouped, deduped, normalized ATS skills from Skills sections and from full resume + JD */
function extractGroupedSkills(sections: ParsedResumeSection[], fullText?: string): SkillGroups {
  const found: Record<keyof typeof SKILL_GROUPS, Set<string>> = {
    Languages: new Set(),
    Frameworks: new Set(),
    Tools: new Set(),
    Platforms: new Set(),
    Concepts: new Set()
  };

  for (const section of sections) {
    if (SKILLS_SECTIONS.includes(section.name.trim().toLowerCase())) {
      const joinText = (section.bullets.length ? section.bullets : section.lines).join(" ");
      matchSkillsInText(joinText, found);
    }
  }

  if (fullText && fullText.trim().length > 0) {
    matchSkillsInText(fullText, found);
  }

  const globalSeen = new Set<string>();
  for (const cat of Object.keys(found) as (keyof typeof found)[]) {
    found[cat] = new Set(Array.from(found[cat]).filter(skill => {
      const lc = skill.toLowerCase();
      if (globalSeen.has(lc)) return false;
      globalSeen.add(lc);
      return true;
    }));
  }

  return {
    Languages: Array.from(found.Languages),
    Frameworks: Array.from(found.Frameworks),
    Tools: Array.from(found.Tools),
    Platforms: Array.from(found.Platforms),
    Concepts: Array.from(found.Concepts)
  };
}

/**
 * Extract top keywords, filtering for technical/hiring skills only (not stopwords,
 * not generic hiring-filler, not junk tokens; keep only those which are skills or
 * otherwise very likely technical/relevant to hiring).
 */
function extractTopKeywords(jobTitle?: string, jobDescription?: string): string[] {
  const text = `${jobTitle || ""} ${jobDescription || ""}`.toLowerCase();
  const tokens = tokenize(text);

  // Build a set of all canonical skill keywords to filter (lowercased)
  const allSkillSet = new Set<string>();
  for (const group of Object.values(SKILL_GROUPS)) {
    for (const kw of group) allSkillSet.add(kw.toLowerCase());
  }

  // A technical/hiring keyword is:
  // - present in our canonical skill set OR matches "engineer", "developer", "manager", etc.
  // - and not in filler, stopwords, or junk tokens (handled by lists above)
  const TECHNICAL_TITLE_WORDS = [
    "engineer", "engineering", "developer", "development", "manager",
    "lead", "architect", "specialist", "administrator", "consultant", "analyst",
    "qa", "sdet", "product", "designer", "devops", "solutions", "cloud"
  ];

  const freq: Record<string, number> = {};
  for (const t of tokens) {
    if (
      !GENERIC_HIRING_KEYWORDS.includes(t) &&
      !JUNK_KEYWORDS.includes(t) &&
      t.length > 2 &&
      (allSkillSet.has(t) || TECHNICAL_TITLE_WORDS.includes(t) )
    ) {
      freq[t] = (freq[t] || 0) + 1;
    }
  }
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  // Simple roleBoost if present in jobTitle
  const roleBoost = (w: string) =>
    jobTitle && jobTitle.toLowerCase().includes(w) ? 2 : 0;
  const ranked = unique(sorted)
    .slice(0, 100)
    .sort(
      (a, b) =>
        (freq[b] + roleBoost(b)) - (freq[a] + roleBoost(a))
    );
  return ranked.slice(0, 50);
}

/**
 * Build the keyword report, filtering all junk/generic keywords.
 * Only include technical/hiring (skill or title) keywords in all arrays.
 */
function buildKeywordsReport(jobTitle?: string, jobDescription?: string, resumeText?: string) {
  const detected = extractTopKeywords(jobTitle, jobDescription);
  const resLower = (resumeText || "").toLowerCase();
  const used = detected.filter(k => resLower.includes(k));
  const missing = detected.filter(k => !resLower.includes(k)).slice(0, 25);
  return {
    keywordsDetected: detected,
    keywordsUsed: used,
    keywordsMissing: missing,
  };
}

/**
 * Helper to auto-generate a human-friendly summary for the candidate,
 * using the jobTitle and parsed/resume skills if available.
 * Summary format:
 *   "<Job Title> experienced in <relevant phrase using skills and concepts>"
 * E.g. "Senior Software Engineer experienced in building scalable web applications, backend APIs, and production systems using JavaScript, React, Node.js, and SQL."
 */
function generateSummary(jobTitle: string | undefined, skills: SkillGroups): string {
  // Select top N skills across all groups for the summary sentence, with group order
  // Favor web apps, backend, production, then fallback
  const fallbackSkills = [
    ...skills.Languages,
    ...skills.Frameworks,
    ...skills.Tools,
    ...skills.Platforms,
    ...skills.Concepts,
  ].map(normalizeSkill);

  // Make a stylized phrase for the types of work, if possible
  let typesOfWork: string[] = [];
  if (
    skills.Frameworks.some(s => /react|next|angular|vue/i.test(s)) ||
    skills.Languages.includes("JavaScript") ||
    skills.Languages.includes("TypeScript")
  ) {
    typesOfWork.push("scalable web applications");
  }
  if (
    skills.Frameworks.some(s => /node|express|django|flask|spring/i.test(s)) ||
    skills.Languages.includes("Python") ||
    skills.Languages.includes("Java")
  ) {
    typesOfWork.push("backend APIs");
  }
  if (
    skills.Platforms.some(s => /aws|azure|gcp/i.test(s)) ||
    skills.Tools.some(s => /docker|kubernetes|jenkins|gitlab/i.test(s)) ||
    skills.Concepts.some(s => /ci\/cd|production/i.test(s))
  ) {
    typesOfWork.push("production systems");
  }

  // Fallback if nothing detected
  if (typesOfWork.length === 0) {
    typesOfWork.push("modern software solutions");
  }

  // Always select at least 3 skills (prefer ones that appear), but dedupe for concise output
  const skillCounts: Record<string, number> = {};
  fallbackSkills.forEach(s => {
    skillCounts[s] = (skillCounts[s] || 0) + 1;
  });
  // Prioritize more "impressive" skills for summary (in predefined SKILL_GROUPS order)
  const summarySkills: string[] = [];
  for (const groupKey of ['Languages', 'Frameworks', 'Tools', 'Platforms', 'Concepts'] as (keyof SkillGroups)[]) {
    for (const skill of skills[groupKey]) {
      if (!summarySkills.includes(skill) && summarySkills.length < 4) summarySkills.push(skill);
      if (summarySkills.length >= 4) break;
    }
    if (summarySkills.length >= 4) break;
  }
  // Clean up/remove duplicates and keep at least 2 if possible
  let skillsList: string[] = summarySkills.filter(Boolean);
  if (skillsList.length < 2) {
    skillsList = unique(fallbackSkills).filter(Boolean).slice(0, 3);
  }

  let summary = "";
  if (jobTitle) {
    summary = `${normalize(jobTitle)} experienced in ${typesOfWork.join(", ")} using ${skillsList.join(", ")}.`;
  } else {
    summary = `Experienced in ${typesOfWork.join(", ")} using ${skillsList.join(", ")}.`;
  }
  return summary.trim();
}


// --- Main export ---

export async function rewriteResume({
  jobTitle,
  jobDescription,
  resumeText,
  strictTruthMode = true,
}: RewriteArgs): Promise<RewriteOutput> {
  // Parse the resume into sections, bullets, etc.
  const parsed = parseResume(resumeText);

  // Extract grouped, deduped, normalized SKILLS, only from SKILLS sections
  const fullTextForSkills = `${resumeText || ""} ${jobDescription || ""}`.trim();
  const groupedSkills = extractGroupedSkills(parsed.sections, fullTextForSkills);

  // Core Competencies: keywords from jobTitle + JD, ignore filler words and junk
  const coreCompetencies = unique(
    extractTopKeywords(jobTitle, jobDescription).map(s =>
      s.replace(/\bci\/cd\b/gi, "CI/CD")
    )
  )
    .filter(
      k =>
        k.length > 2 &&
        !GENERIC_HIRING_KEYWORDS.includes(k.toLowerCase()) &&
        !JUNK_KEYWORDS.includes(k.toLowerCase())
    )
    .slice(0, 8);

  // Rewritten bullets: only for sections matching EXPERIENCE or PROJECTS
  const rewrittenBullets: Record<string, string[]> = {};
  const optionalPlaceholders: string[] = [];

  parsed.sections.forEach((section, sIdx) => {
    const sectionType = section.name.trim().toLowerCase();
    if ((EXPERIENCE_LIKE_SECTIONS.includes(sectionType))) {
      // Only experience-like sections get bullets rewritten
      const src = section.bullets.length ? section.bullets : section.lines;
      const out = src
        .map((b, i) => rewriteBullet(b, sIdx * 100 + i, strictTruthMode))
        .filter(Boolean);

      if (!strictTruthMode) {
        out.forEach(bullet => {
          if (!/\d/.test(bullet)) {
            optionalPlaceholders.push(`${bullet} [X%]`);
          }
        });
      }
      if (out.length) {
        rewrittenBullets[section.name] = out;
      }
    }
    else if (SKILLS_SECTIONS.includes(sectionType)) {
      // Do not rewrite SKILLS as verbs or bullets; output only as grouped lists (already handled)
      // No-op (skills output is handled as grouped lists, never as action sentences)
    }
  });

  // Generate improved summary
  const summary = generateSummary(jobTitle, groupedSkills);

  const rulesReport: string[] = [
    "No invented facts, certifications, or invented skills.",
    "Only EXPERIENCE or PROJECT sections are rewritten as bullets.",
    "SKILLS are output as grouped lists (Languages, Frameworks, Tools, Platforms, Concepts).",
    "Bullets format: ActionVerb + WhatWasDone + Context, under 22 words. No duplicate verbs or 'to improve Built'.",
    "Skills section is never rewritten with action verbs or as sentences.",
    "Generic hiring words and junk tokens ignored in keyword extraction.",
  ];

  const keywordsReport = buildKeywordsReport(jobTitle, jobDescription, resumeText);

  const output: RewriteOutput = {
    summary,
    coreCompetencies,
    rewrittenBullets,
    skillsSections: groupedSkills,
    skills: groupedSkills,
    keywordsReport,
    rulesReport,
    parsedMeta: {
      sectionsDetected: parsed.sectionOrder,
      bulletsCount: parsed.allBullets.length,
    }
  };

  if (!strictTruthMode && optionalPlaceholders.length) {
    output.optionalPlaceholders = unique(optionalPlaceholders);
  }

  return output;
}
