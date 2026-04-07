<div align="center">

# ResumeAI — Match. Rewrite. Ship.

**AI-powered resume enhancer that rewrites your resume to match job descriptions — without fabricating a single fact.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter_LLM-6366f1?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Live Demo**](https://resume-rebuilder-cursor.vercel.app) · [**Report Bug**](https://github.com/loki128/resume-rebuilder-cursor/issues)

</div>

---

## The Problem

Job seekers spend hours manually tweaking resumes for each application — reordering bullets, swapping keywords, guessing what recruiters want. Most AI tools either hallucinate qualifications or give generic advice that doesn't reflect real experience.

**ResumeAI solves this.** It reads your resume and the job description, then surgically rewrites your bullets, surfaces your most relevant skills, and tells you exactly which keywords you're missing — all while keeping your real experience intact.

---

## Live Demo

Paste any job description + your resume text and get an AI-enhanced version in seconds.

**[resume-rebuilder-cursor.vercel.app](https://resume-rebuilder-cursor.vercel.app)**

---

## Features

| Feature | Description |
|---|---|
| **Smart Keyword Extraction** | Pulls exact keywords from the job description using NLP |
| **Bullet Rewriting** | Rewrites your experience bullets to align with the role using only what you have actually done |
| **Strict Truth Mode** | Locks the AI to your real experience — zero fabrication |
| **Match Score** | Visual percentage showing how well your resume aligns with the job |
| **Skills Mapping** | Categorizes and surfaces your skills by relevance to the role |
| **Keywords Report** | Shows exactly which keywords were used, detected, and missing |
| **Copy to Clipboard** | One-click copy on every output section |
| **LLM Fallback** | Rule-based engine kicks in if LLM is unavailable — always returns results |

---

## Tech Stack

```
Frontend        Next.js 14 (App Router) + TypeScript + Tailwind CSS
Animation       Framer Motion
Icons           Lucide React
AI Engine       OpenRouter API (LLM) with rule-based fallback
Deployment      Vercel (auto-deploy on push)
Styling System  Custom dark design system with CSS variables
```

---

## Project Structure

```
resume-rebuilder/
├── app/
│   ├── page.tsx              # Main UI — two-column split layout
│   ├── layout.tsx            # Root layout + metadata
│   ├── globals.css           # Dark design system (CSS vars, glass, glow)
│   └── api/
│       └── enhance/
│           └── route.ts      # POST /api/enhance — AI processing endpoint
├── components/
│   ├── InputBox.tsx          # Textarea with char count + hints
│   ├── OutputBox.tsx         # Animated result cards with copy buttons
│   ├── EnhanceButton.tsx     # Gradient CTA with loading state
│   └── SectionTabs.tsx       # Spring-animated tab switcher
└── lib/
    ├── keywordExtractor.ts   # NLP keyword extraction from JD
    ├── resumeRewriter.ts     # Core rewriting orchestrator
    ├── openRouterRewriter.ts # LLM integration (OpenRouter)
    ├── ollamaRewriter.ts     # Local LLM fallback (Ollama)
    ├── llmPrompt.ts          # Prompt engineering
    ├── parseResume.ts        # Resume section parser
    └── types.ts              # Shared TypeScript interfaces
```

---

## API Reference

### POST `/api/enhance`

**Request:**
```json
{
  "jobTitle": "Senior Product Manager",
  "jobDescription": "We are looking for a PM to lead...",
  "resumeText": "Jane Doe — 5 years experience in...",
  "strictTruthMode": true
}
```

**Response:**
```json
{
  "summary": "Product leader with 5 years driving 0-to-1 features...",
  "coreCompetencies": ["Product Strategy", "Roadmapping", "A/B Testing"],
  "rewrittenBullets": {
    "Experience": [
      "Led cross-functional team of 8 to ship payments feature, reducing checkout drop-off by 23%"
    ]
  },
  "skills": {
    "Technical": ["SQL", "Figma", "JIRA"],
    "Leadership": ["Stakeholder Management", "OKR Setting"]
  },
  "keywordsReport": {
    "keywordsDetected": ["agile", "roadmap", "stakeholder"],
    "keywordsUsed": ["agile", "roadmap"],
    "keywordsMissing": ["stakeholder"]
  },
  "llmUsed": true
}
```

---

## Running Locally

```bash
git clone https://github.com/loki128/resume-rebuilder-cursor.git
cd resume-rebuilder-cursor
npm install
cp .env.example .env.local
# Add your OpenRouter API key
npm run dev
```

---

## Built By

**[Karim Lukita](https://lukita-portfolio.com)** — One-person product studio. I build full products solo — SaaS platforms, AI tools, trading bots, games. Design to deployment, one person, shipped fast.

[![Portfolio](https://img.shields.io/badge/lukita--portfolio.com-D4AF37?style=flat-square)](https://lukita-portfolio.com) [![GitHub](https://img.shields.io/badge/GitHub-loki128-181717?style=flat-square&logo=github)](https://github.com/loki128) [![LinkedIn](https://img.shields.io/badge/LinkedIn-Karim_Lukita-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/karim-lukita-0282263a9)

---

## License

MIT © 2026
