import { NextResponse } from "next/server";
import { rewriteResume } from "@/lib/resumeRewriter";

export async function POST(req: Request) {
  try {
    // Parse request body safely
    let body: any = {};
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Extract fields with defaults
    const jobTitle = body?.jobTitle || "";
    const jobDescription = body?.jobDescription || "";
    const resumeText = body?.resumeText || "";
    const strictTruthMode = body?.strictTruthMode !== false; // default true

    // Call the real rewriting engine
    const result = await rewriteResume({
      jobTitle,
      jobDescription,
      resumeText,
      strictTruthMode,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
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
