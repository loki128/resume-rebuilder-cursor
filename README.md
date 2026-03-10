<div align="center">

# ResumeAI — Match. Rewrite. Ship.

**AI-powered resume enhancer that rewrites your resume to match job descriptions — without fabricating a single fact.**

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter_LLM-6366f1?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Live Demo**](https://resume-rebuilder-cursor.vercel.app) · [**Experimental Repo**](https://github.com/loki128/resume-rebuilder-experimental) · [**Report Bug**](https://github.com/loki128/resume-rebuilder-cursor/issues)

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
  "llmUsed": true,
  "parsedMeta": {
    "bulletsCount": 12,
    "sectionsDetected": ["Experience", "Skills", "Education"]
  }
}
```

---

## Running Locally

```bash
# Clone
git clone https://github.com/loki128/resume-rebuilder-cursor.git
cd resume-rebuilder-cursor

# Install dependencies
npm install

# Add environment variables
cp .env.example .env.local
# Fill in your OpenRouter API key

# Run dev server
npm run dev
# Open http://localhost:3000
```

**Required environment variable:**
```env
OPENROUTER_API_KEY=your_key_here
```

---

## UI Design System

Built on a custom dark design system:

- **Color palette** — Deep navy base with indigo, violet, and cyan accents
- **Glassmorphism** — Blur and border cards for layered depth
- **Ambient orbs** — Gradient background elements for visual richness
- **Framer Motion** — Page transitions, card animations, spring-animated tabs, skeleton loaders
- **Match Score Ring** — Animated SVG ring in the header, color-coded green/amber/red by score
- **Collapsible Cards** — Each output section independently expandable with copy button

---

## Roadmap

- [x] LLM integration via OpenRouter
- [x] Rule-based fallback engine
- [x] Keyword extraction and match report
- [x] Dark premium UI with animations
- [x] Match score visualization
- [x] Copy-to-clipboard on all output sections
- [x] Functional settings tab with animated toggles
- [ ] PDF resume upload and parsing
- [ ] Export enhanced resume as PDF
- [ ] Save and compare multiple job applications
- [ ] Chrome extension for job board integration
- [ ] User accounts and resume history

---

## About the Developer

Built by **[@loki128](https://github.com/loki128)** — an 18-year-old self-taught developer based in Jacksonville, FL.

I build full-stack AI products using an agentic workflow with Claude Code, Cursor, and OpenRouter. This is my first shipped product — designed, built, deployed, and iterated on independently from scratch.

Currently building a portfolio of AI-native tools. Open to internships, junior roles, and freelance projects.

**Stack:** Next.js · TypeScript · React · Tailwind CSS · Framer Motion · LLM APIs · REST APIs · Vercel · Git · Prompt Engineering

---

## License

MIT © 2026 loki128
