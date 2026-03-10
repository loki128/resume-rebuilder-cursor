"use client";
import React from "react";
import { motion } from "framer-motion";
import { FileText, Settings2 } from "lucide-react";

interface Props {
  active: string;
  onChange: (tab: string) => void;
}

const tabs = [
  { id: "builder", label: "Resume Builder", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export default function SectionTabs({ active, onChange }: Props) {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl mb-6"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium flex-1 justify-center transition-colors duration-150"
            style={{ color: isActive ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {isActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon size={14} />
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
