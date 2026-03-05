import { NextResponse } from "next/server";
import { EnhanceRequest, EnhanceResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body: EnhanceRequest = await request.json();
  const { jobTitle, jobDescription, resumeText, strictTruthMode } = body;

  // Placeholder response — AI logic not implemented yet
  const response: EnhanceResponse = {
    summaryBullets: [
      `Tailored summary for ${jobTitle || "[Job Title]"}`,
      "Focused on relevant achievements and metrics",
    ],
    skills: ["JavaScript", "TypeScript", "React", "Next.js"],
    keywordsReport: {
      matchedKeywords: ["React", "Next.js"],
      missingKeywords: ["GraphQL"],
    },
    meta: { jobTitle, strictTruthMode },
  };

  return NextResponse.json(response);
}
