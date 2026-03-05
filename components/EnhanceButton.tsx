import React from "react";

interface EnhanceButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function EnhanceButton({
  onClick,
  disabled = false,
}: EnhanceButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded shadow text-white font-medium transition-colors ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800"
      }`}
    >
      {disabled ? "Processing..." : "Enhance Resume"}
    </button>
  );
}
