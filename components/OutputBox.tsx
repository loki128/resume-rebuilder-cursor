"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronDown, ChevronUp, Zap, Target, Tags, FileText, AlertTriangle } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.button
      onClick={copy}
      whileTap={{ scale: 0.9 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
      style={{
        background: copied ? 'rgba(16,185,129,0.15)' : 'var(--bg-hover)',
        color: copied ? '#10b981' : 'var(--text-secondary)',
        border: '1px solid',
        borderColor: copied ? 'rgba(16,185,129,0.3)' : 'var(--border)',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </motion.button>
  );
}

function Card({
  title,
  icon: Icon,
  children,
  accent = "#6366f1",
  copyText,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: string;
  copyText?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors"
        style={{ background: 'transparent', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}22` }}
          >
            <Icon size={14} style={{ color: accent }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {copyText && open && <CopyButton text={copyText} />}
          {open ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="pt-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SkillPill({ label, color = "#6366f1" }: { label: string; color?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </motion.span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-5 animate-pulse"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg" style={{ background: 'var(--bg-hover)' }} />
            <div className="h-4 w-32 rounded-md" style={{ background: 'var(--bg-hover)' }} />
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded-md w-full" style={{ background: 'var(--bg-hover)' }} />
            <div className="h-3 rounded-md w-4/5" style={{ background: 'var(--bg-hover)' }} />
            <div className="h-3 rounded-md w-3/5" style={{ background: 'var(--bg-hover)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OutputBox({ data, loading }: { data: any; loading?: boolean }) {
  if (loading) return <LoadingSkeleton />;

  if (!data) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
        style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(99,102,241,0.1)' }}
        >
          <FileText size={24} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Results will appear here
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Fill in the form and click Enhance Resume
        </p>
      </div>
    );
  }

  if (data.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-400">{data.error}</p>
          {data.message && <p className="text-xs text-red-400/70 mt-1">{data.message}</p>}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* LLM warning */}
      {data.llmUsed === false && data.llmError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}
        >
          <Zap size={14} />
          Rule-based fallback — LLM unavailable: {data.llmError}
        </motion.div>
      )}

      {/* Summary */}
      {data.summary && (
        <Card title="Summary" icon={FileText} accent="#6366f1" copyText={data.summary}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{data.summary}</p>
        </Card>
      )}

      {/* Core Competencies */}
      {data.coreCompetencies?.length > 0 && (
        <Card title="Core Competencies" icon={Target} accent="#8b5cf6" copyText={data.coreCompetencies.join(", ")}>
          <div className="flex flex-wrap gap-2">
            {data.coreCompetencies.map((skill: string, i: number) => (
              <SkillPill key={i} label={skill} color="#8b5cf6" />
            ))}
          </div>
        </Card>
      )}

      {/* Rewritten Bullets */}
      {data.rewrittenBullets && (
        <Card
          title="Rewritten Bullets"
          icon={Zap}
          accent="#06b6d4"
          copyText={Object.entries(data.rewrittenBullets)
            .map(([sec, bullets]: [string, any]) => `${sec}:\n${(bullets as string[]).map((b) => `• ${b}`).join("\n")}`)
            .join("\n\n")}
        >
          <div className="space-y-4">
            {Object.entries(data.rewrittenBullets).map(([section, bullets]: [string, any]) => (
              <div key={section}>
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: '#06b6d4' }}
                >
                  {section}
                </div>
                <ul className="space-y-2">
                  {Array.isArray(bullets) && bullets.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#06b6d4' }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Skills */}
      {data.skills && (
        <Card title="Skills" icon={Tags} accent="#10b981">
          <div className="space-y-3">
            {Object.entries(data.skills).map(([category, skills]: [string, any]) => (
              <div key={category}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#10b981' }}>
                  {category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(skills) && skills.map((skill: string, i: number) => (
                    <SkillPill key={i} label={skill} color="#10b981" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Keywords Report */}
      {data.keywordsReport && (
        <Card title="Keywords Report" icon={Target} accent="#f59e0b" defaultOpen={false}>
          <div className="space-y-3 text-sm">
            {data.keywordsReport.keywordsDetected?.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>Detected</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.keywordsReport.keywordsDetected.map((k: string, i: number) => (
                    <SkillPill key={i} label={k} color="#f59e0b" />
                  ))}
                </div>
              </div>
            )}
            {data.keywordsReport.keywordsUsed?.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#10b981' }}>Used</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.keywordsReport.keywordsUsed.map((k: string, i: number) => (
                    <SkillPill key={i} label={k} color="#10b981" />
                  ))}
                </div>
              </div>
            )}
            {data.keywordsReport.keywordsMissing?.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ef4444' }}>Missing</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.keywordsReport.keywordsMissing.map((k: string, i: number) => (
                    <SkillPill key={i} label={k} color="#ef4444" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Rules Report */}
      {data.rulesReport?.length > 0 && (
        <Card title="Rules Applied" icon={Zap} accent="#6366f1" defaultOpen={false}>
          <ul className="space-y-1.5">
            {data.rulesReport.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <Check size={12} className="mt-0.5 shrink-0" style={{ color: '#6366f1' }} />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
