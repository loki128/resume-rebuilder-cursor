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

      {/* Rewritten Bullets grouped by section */}
      {data.rewrittenBullets && (
        <div>
          <h3 className="font-semibold">Rewritten Bullets</h3>
          <div className="mt-2 space-y-3">
            {Object.entries(data.rewrittenBullets).map(([section, bullets]: [string, any]) => (
              <div key={section}>
                <div className="text-sm font-medium text-gray-600">{section}</div>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {Array.isArray(bullets) && bullets.map((b: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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

      {/* Optional placeholders when not strict */}
      {data.optionalPlaceholders && data.optionalPlaceholders.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="font-semibold text-gray-700">Optional Placeholders (when strict mode is off)</div>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
            {data.optionalPlaceholders.map((p: string, i: number) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Rules Report */}
      {data.rulesReport && data.rulesReport.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Rules Applied</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
            {data.rulesReport.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
