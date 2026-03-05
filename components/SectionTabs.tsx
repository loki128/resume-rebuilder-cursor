import React from "react";

export default function SectionTabs() {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      <button className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600">
        Resume Builder
      </button>
      <button className="px-4 py-2 text-sm font-medium text-gray-600">Settings</button>
    </div>
  );
}
