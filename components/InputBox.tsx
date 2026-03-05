import React from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

export default function InputBox({ label, value, onChange, rows = 3 }: Props) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-200 p-3"
      />
    </label>
  );
}
