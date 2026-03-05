import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse request body
    let body: any = {};
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Extract fields (safely handle empty/missing values)
    const jobTitle = body?.jobTitle || "";
    const jobDescription = body?.jobDescription || "";
    const resumeText = body?.resumeText || "";
    const strictTruthMode = body?.strictTruthMode !== false; // default true

    // Always return working placeholder response
    const response = {
      summary: "This is a placeholder summary",
      coreCompetencies: ["Communication", "Teamwork", "Problem Solving"],
      rewrittenBullets: [
        "Improved reporting workflows by organizing spreadsheet data",
        "Collaborated with team members to support operational tasks",
      ],
      skills: {
        Technical: ["Excel", "Data Entry"],
        Tools: ["Google Sheets"],
      },
      keywordsReport: {
        keywordsDetected: ["analysis", "reporting", "operations"],
        keywordsUsed: ["analysis"],
        keywordsMissing: ["automation"],
      },
      // Include metadata for debugging
      meta: {
        jobTitle: jobTitle || "[empty]",
        jobDescription: jobDescription ? `${jobDescription.slice(0, 50)}...` : "[empty]",
        resumeText: resumeText ? `${resumeText.slice(0, 50)}...` : "[empty]",
        strictTruthMode,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in /api/enhance:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
