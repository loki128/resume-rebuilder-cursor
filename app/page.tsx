"use client";

import EnhanceButton from "../components/EnhanceButton";
import InputBox from "../components/InputBox";
import OutputBox from "../components/OutputBox";
import SectionTabs from "../components/SectionTabs";
import { useState } from "react";

export default function Home() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [strictTruthMode, setStrictTruthMode] = useState(true);
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    setResults(null);
    setLoading(true);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          resumeText,
          strictTruthMode,
        }),
      });

      if (!res.ok) {
        setResults({
          error: `API error: ${res.status} ${res.statusText}`,
        });
        return;
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error:", err);
      setResults({
        error: "Failed to connect to API",
        message:
          err instanceof Error ? err.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-2">resume-ai-enhancer</h1>
        <p className="text-sm text-gray-600 mb-6">
          Rewrite resumes to match job descriptions without inventing facts.
        </p>

        <SectionTabs />

        <div className="space-y-4">
          <InputBox
            label="Job Title"
            value={jobTitle}
            onChange={setJobTitle}
            rows={1}
          />
          <InputBox
            label="Job Description"
            value={jobDescription}
            onChange={setJobDescription}
            rows={4}
          />
          <InputBox
            label="Resume Text"
            value={resumeText}
            onChange={setResumeText}
            rows={6}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={strictTruthMode}
                onChange={(e) => setStrictTruthMode(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">Strict Truth Mode</span>
            </label>

            <EnhanceButton onClick={handleEnhance} disabled={loading} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium mb-3">
            {loading ? "Processing..." : "Results"}
          </h2>
          <OutputBox data={results} />
        </div>
      </div>
    </div>
  );
}
