type RewriteArgs = {
  jobTitle?: string;
  jobDescription?: string;
  resumeText?: string;
  strictTruthMode?: boolean;
};

const ACTION_VERBS = [
  "Led",
  "Owned",
  "Delivered",
  "Optimized",
  "Streamlined",
  "Implemented",
  "Built",
  "Deployed",
  "Improved",
  "Automated",
  "Resolved",
  "Designed",
  "Architected",
  "Analyzed",
  "Collaborated",
  "Coordinated",
  "Enhanced",
  "Launched",
  "Maintained",
  "Refactored",
];

const STOP_WORDS = new Set([
  "the","and","for","with","from","that","this","into","over","under","via","using","use","used","to","of","in","on","at","as","an","a","by","is","are","be","been","was","were","or","nor","but","so"
]);

function normalize(text: string): string {
  return (text || "").replace(/\s+/g, " ").trim();
}

function extractLines(text?: string): string[] {
  if (!text) return [];
  const raw = text
    .split(/\r?\n+/)
    .map((l) => l.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
  // Also split paragraphs into sentences if no bullets
  if (raw.length <= 2) {
    const sentences = text
      .split(/[.!?]\s+/)
      .map((s) => s.replace(/^[-•\s]+/, "").trim())
      .filter((s) => s.length > 0 && s.length < 240);
    return sentences.length ? sentences : raw;
  }
  return raw;
}

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w));
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function pickActionVerb(i: number): string {
  return ACTION_VERBS[i % ACTION_VERBS.length];
}

function extractSkillsAndResponsibilities(jobDescription?: string) {
  const jd = (jobDescription || "").toLowerCase();
  const lines = extractLines(jobDescription);

  // Simple heuristics for skills keywords
  const SKILL_HINTS = [
    "javascript","typescript","react","next.js","nextjs","node","python","java","graphql","sql","excel","google sheets","aws","gcp","azure","docker","kubernetes","tailwind","git","ci/cd","jest","playwright","cypress","html","css","redux","vite","webpack","rest","api","microservices","postgres","mongodb","redis","linux","bash"
  ];

  const RESPONSIBILITY_HINTS = [
    "design","develop","implement","optimize","maintain","collaborate","lead","support","test","deploy","monitor","analyze","improve","document","coordinate","architect","troubleshoot","automate"
  ];

  const jdTokens = tokenize(jd);

  const skillsDetected = unique(
    SKILL_HINTS.filter((s) => jd.includes(s))
  ).map((s) => s.replace(/\bnextjs\b/, "next.js"));

  const responsibilitiesDetected = unique(
    lines
      .filter((l) => RESPONSIBILITY_HINTS.some((h) => l.toLowerCase().includes(h)))
      .map((l) => l.replace(/^[-•\s]+/, "").trim())
  );

  // If few responsibilities found, synthesize from tokens
  if (responsibilitiesDetected.length < 3) {
    const Rs = unique(
      RESPONSIBILITY_HINTS.filter((h) => jdTokens.includes(h))
    ).slice(0, 6);
    responsibilitiesDetected.push(
      ...Rs.map((r) => r.charAt(0).toUpperCase() + r.slice(1))
    );
  }

  return {
    coreCompetencies: responsibilitiesDetected.slice(0, 8).map((r) => r.replace(/\.$/, "")),
    skillsSections: {
      Technical: skillsDetected
        .map((s) => (s.length <= 2 ? s.toUpperCase() : s))
        .map((s) => (s === "ci/cd" ? "CI/CD" : s))
        .slice(0, 20),
      Tools: unique(
        skillsDetected.filter((s) => ["excel","google sheets","git","docker","kubernetes"].includes(s))
      ),
    },
  };
}

function limitToExistingEntities(text: string, tokens: string[]): string[] {
  const lower = text.toLowerCase();
  return tokens.filter((t) => lower.includes(t.toLowerCase()));
}

function containsNumber(s: string): boolean {
  return /\d/.test(s);
}

function maybeInjectMetric(bullet: string, allow: boolean): string {
  if (!allow) return bullet;
  if (containsNumber(bullet)) return bullet; // already has a metric
  // Append safe placeholder metric token
  return bullet.endsWith(".") ? `${bullet} [X%]` : `${bullet} [X%]`;
}

function rewriteBullets(resumeText?: string, strictTruthMode?: boolean): string[] {
  const lines = extractLines(resumeText);
  if (lines.length === 0) return [];

  return lines
    .map((line, idx) => {
      const clean = line.replace(/^[-•\s]+/, "").trim();
      if (!clean) return "";

      // Choose an action verb and try to replace weak openings
      const verb = pickActionVerb(idx);
      const rewritten = clean
        // Strengthen common weak starters
        .replace(/^Responsible for\s*/i, `${verb} `)
        .replace(/^Worked on\s*/i, `${verb} `)
        .replace(/^Helped\s*/i, `${verb} `)
        .replace(/^Assisted\s*/i, `${verb} `)
        .replace(/^Involved in\s*/i, `${verb} `)
        // If no change and doesn't start with a verb, prefix one
        .replace(/^([a-z])/i, (m) => (/[A-Z]/.test(m) ? m : m.toUpperCase()));

      const startsWithVerb = ACTION_VERBS.some((v) =>
        rewritten.startsWith(v + " ")
      );
      const finalLine = startsWithVerb ? rewritten : `${verb} ${rewritten}`;

      // ATS-friendly tweaks
      const ats = finalLine
        .replace(/\butilized\b/gi, "used")
        .replace(/\bleveraged\b/gi, "used")
        .replace(/\bsynergy\b/gi, "collaboration")
        .trim();

      return maybeInjectMetric(ats, !strictTruthMode);
    })
    .filter(Boolean)
    .slice(0, 12);
}

function buildSummary(jobTitle?: string): string {
  const jt = normalize(jobTitle || "");
  if (jt) {
    return `Candidate aligned to ${jt} role. Focused on impact, collaboration, and reliable delivery.`;
  }
  return "Candidate focused on impact, collaboration, and reliable delivery.";
}

function buildKeywordsReport(jobDescription?: string, resumeText?: string) {
  const jdTokens = unique(tokenize(jobDescription || ""));
  const resLower = (resumeText || "").toLowerCase();

  const keywordsDetected = jdTokens
    .filter((t) => t.length > 2)
    .slice(0, 50);

  const keywordsUsed = keywordsDetected.filter((k) => resLower.includes(k));
  const keywordsMissing = keywordsDetected.filter((k) => !resLower.includes(k)).slice(0, 25);

  return { keywordsDetected, keywordsUsed, keywordsMissing };
}

export async function rewriteResume({ jobTitle, jobDescription, resumeText, strictTruthMode = true }: RewriteArgs) {
  const { coreCompetencies, skillsSections } = extractSkillsAndResponsibilities(jobDescription);

  const rewrittenBullets = rewriteBullets(resumeText, strictTruthMode);

  // Ensure we don't invent tools/certs/numbers: limit skills to items present in resume when appropriate
  const resumeTokens = unique(tokenize(resumeText || ""));
  const safeTechnical = limitToExistingEntities(resumeText || "", skillsSections.Technical);
  const safeTools = limitToExistingEntities(resumeText || "", skillsSections.Tools);

  const skills = {
    Technical: safeTechnical.length ? safeTechnical : skillsSections.Technical.filter((s) => resumeTokens.includes(s.toLowerCase())).slice(0, 20),
    Tools: safeTools.length ? safeTools : skillsSections.Tools.filter((s) => resumeTokens.includes(s.toLowerCase())).slice(0, 20),
  };

  const summary = buildSummary(jobTitle);
  const keywordsReport = buildKeywordsReport(jobDescription, resumeText);

  return {
    summary,
    coreCompetencies,
    rewrittenBullets,
    skillsSections: skills, // per instruction naming
    skills, // alias for UI compatibility
    keywordsReport,
  };
}
