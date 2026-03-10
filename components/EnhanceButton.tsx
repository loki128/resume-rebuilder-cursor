"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

interface EnhanceButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

export default function EnhanceButton({ onClick, disabled = false, type = "button" }: EnhanceButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className="relative w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 overflow-hidden"
      style={{
        background: disabled
          ? 'var(--bg-elevated)'
          : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: disabled ? 'var(--text-muted)' : '#fff',
        border: '1px solid',
        borderColor: disabled ? 'var(--border)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 0 24px rgba(99,102,241,0.3), 0 4px 15px rgba(99,102,241,0.2)',
      }}
    >
      {!disabled && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100"
          style={{
            background: 'linear-gradient(135deg, #7577f3, #9d77f8)',
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {disabled
          ? <Loader2 size={16} className="animate-spin" />
          : <Sparkles size={16} />
        }
        {disabled ? "Enhancing resume..." : "Enhance Resume"}
      </span>
    </motion.button>
  );
}
