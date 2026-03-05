import React from "react";

export default function EnhanceButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
    >
      Enhance Resume
    </button>
  );
}
