import React from "react";

export default function OutputBox({ data }: { data: any }) {
  if (!data) return <div className="text-sm text-gray-500">No results yet.</div>;
  if (data.error) return <div className="text-red-600">{data.error}</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Summary Bullets</h3>
        <ul className="list-disc list-inside">
          {data.summaryBullets?.map((b: string, i: number) => (
            <li key={i} className="text-sm text-gray-700">{b}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Skills</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.skills?.map((s: string, i: number) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Keywords Report</h3>
        <div className="text-sm text-gray-700">
          <div>Matched: {data.keywordsReport?.matchedKeywords?.join(", ")}</div>
          <div>Missing: {data.keywordsReport?.missingKeywords?.join(", ")}</div>
        </div>
      </div>
    </div>
  );
}
