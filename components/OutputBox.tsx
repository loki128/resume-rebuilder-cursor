import React from "react";

export default function OutputBox({ data }: { data: any }) {
  if (!data) return <div className="text-sm text-gray-500">No results yet.</div>;
  
  // Handle errors
  if (data.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3">
        <div className="text-red-700 font-semibold">{data.error}</div>
        {data.message && <div className="text-red-600 text-sm mt-1">{data.message}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {data.summary && (
        <div>
          <h3 className="font-semibold text-lg">Summary</h3>
          <p className="text-gray-700 mt-1">{data.summary}</p>
        </div>
      )}

      {/* Core Competencies */}
      {data.coreCompetencies && data.coreCompetencies.length > 0 && (
        <div>
          <h3 className="font-semibold">Core Competencies</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.coreCompetencies.map((skill: string, i: number) => (
              <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rewritten Bullets */}
      {data.rewrittenBullets && data.rewrittenBullets.length > 0 && (
        <div>
          <h3 className="font-semibold">Rewritten Bullets</h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            {data.rewrittenBullets.map((bullet: string, i: number) => (
              <li key={i} className="text-sm text-gray-700">{bullet}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div>
          <h3 className="font-semibold">Skills</h3>
          <div className="mt-2 space-y-2">
            {Object.entries(data.skills).map(([category, skills]: [string, any]) => (
              <div key={category}>
                <div className="text-sm font-medium text-gray-600">{category}</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.isArray(skills) && skills.map((skill: string, i: number) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords Report */}
      {data.keywordsReport && (
        <div>
          <h3 className="font-semibold">Keywords Report</h3>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            {data.keywordsReport.keywordsDetected && (
              <div>
                <span className="font-medium">Detected:</span> {data.keywordsReport.keywordsDetected.join(", ")}
              </div>
            )}
            {data.keywordsReport.keywordsUsed && (
              <div>
                <span className="font-medium">Used:</span> {data.keywordsReport.keywordsUsed.join(", ")}
              </div>
            )}
            {data.keywordsReport.keywordsMissing && (
              <div>
                <span className="font-medium">Missing:</span> {data.keywordsReport.keywordsMissing.join(", ")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Meta Info */}
      {data.meta && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Debug Info</summary>
            <div className="mt-2 space-y-1 pl-4">
              <div>Job Title: {data.meta.jobTitle}</div>
              <div>Description: {data.meta.jobDescription}</div>
              <div>Resume: {data.meta.resumeText}</div>
              <div>Strict Mode: {data.meta.strictTruthMode ? "Yes" : "No"}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
