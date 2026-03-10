"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, ShieldOff, Cpu, Moon, Github } from "lucide-react";
import EnhanceButton from "../components/EnhanceButton";
import InputBox from "../components/InputBox";
import OutputBox from "../components/OutputBox";
import SectionTabs from "../components/SectionTabs";

function MatchScore({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--bg-hover)" strokeWidth="5" />
          <motion.circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-bold"
            style={{ color }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Match Score</span>
    </div>
  );
}

function SettingsPanel({
  strictTruthMode,
  setStrictTruthMode,
}: {
  strictTruthMode: boolean;
  setStrictTruthMode: (v: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enhancement Settings</h3>

        {/* Strict Truth Mode */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: strictTruthMode ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)' }}
            >
              {strictTruthMode
                ? <Shield size={15} style={{ color: '#6366f1' }} />
                : <ShieldOff size={15} style={{ color: '#f59e0b' }} />
              }
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Strict Truth Mode</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {strictTruthMode
                  ? "Only rewrites existing content — never invents facts"
                  : "May suggest placeholder content you can fill in"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStrictTruthMode(!strictTruthMode)}
            className="relative shrink-0 w-11 h-6 rounded-full transition-all duration-200"
            style={{
              background: strictTruthMode
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'var(--bg-hover)',
              border: '1px solid var(--border)',
            }}
          >
            <motion.div
              animate={{ x: strictTruthMode ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-5 h-5 rounded-full"
              style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            />
          </button>
        </div>

        <div
          className="rounded-xl p-3 text-xs"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={11} />
            <span className="font-semibold">AI Engine</span>
          </div>
          Powered by OpenRouter LLM with rule-based fallback. No resume data is stored.
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [strictTruthMode, setStrictTruthMode] = useState(true);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setResults(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription, resumeText, strictTruthMode }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || `API error ${res.status}`);
        return;
      }
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Compute a simple match score from keywords report
  const matchScore = (() => {
    if (!results?.keywordsReport) return null;
    const { keywordsDetected = [], keywordsUsed = [] } = results.keywordsReport;
    if (!keywordsDetected.length) return null;
    return Math.round((keywordsUsed.length / keywordsDetected.length) * 100);
  })();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(7,7,15,0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1
              className="text-base font-bold leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="gradient-text">ResumeAI</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Match. Rewrite. Ship.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {matchScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MatchScore score={matchScore} />
            </motion.div>
          )}
          <a
            href="https://github.com/loki128/resume-rebuilder-cursor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <Github size={13} />
            GitHub
          </a>
        </div>
      </header>

      {/* Main two-column layout */}
      <main className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* Left Panel — Input */}
        <div
          className="w-[420px] shrink-0 flex flex-col overflow-y-auto"
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <div className="p-6 flex-1">
            <SectionTabs active={activeTab} onChange={setActiveTab} />

            <AnimatePresence mode="wait">
              {activeTab === "builder" ? (
                <motion.form
                  key="builder"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <InputBox
                    label="Job Title"
                    value={jobTitle}
                    onChange={setJobTitle}
                    rows={1}
                    placeholder="e.g. Senior Product Manager"
                  />
                  <InputBox
                    label="Job Description"
                    value={jobDescription}
                    onChange={setJobDescription}
                    rows={5}
                    placeholder="Paste the full job description here..."
                    hint="More detail = better keyword matching"
                  />
                  <InputBox
                    label="Your Resume"
                    value={resumeText}
                    onChange={setResumeText}
                    rows={8}
                    placeholder="Paste your current resume text here..."
                    hint="Plain text works best — no formatting needed"
                  />

                  {/* Strict truth toggle inline */}
                  <button
                    type="button"
                    onClick={() => setStrictTruthMode(!strictTruthMode)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {strictTruthMode
                        ? <Shield size={14} style={{ color: '#6366f1' }} />
                        : <ShieldOff size={14} style={{ color: '#f59e0b' }} />
                      }
                      <span>Strict Truth Mode</span>
                    </div>
                    <div
                      className="relative w-9 h-5 rounded-full transition-all duration-200"
                      style={{
                        background: strictTruthMode
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'var(--bg-hover)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <motion.div
                        animate={{ x: strictTruthMode ? 16 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-4 h-4 rounded-full"
                        style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                      />
                    </div>
                  </button>

                  <EnhanceButton type="submit" disabled={loading} />
                </motion.form>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                >
                  <SettingsPanel
                    strictTruthMode={strictTruthMode}
                    setStrictTruthMode={setStrictTruthMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel — Output */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {loading ? "Enhancing..." : results ? "Results" : "Output"}
                </h2>
                {results?.parsedMeta && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {results.parsedMeta.bulletsCount} bullets across {results.parsedMeta.sectionsDetected?.length ?? 0} sections
                  </p>
                )}
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--accent-primary)' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={12} />
                  </motion.div>
                  AI processing
                </div>
              )}
            </div>

            {results?.parsedMeta?.bulletsCount < 3 && !loading && results && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl px-4 py-3 mb-4 text-xs flex items-center gap-2"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: '#f59e0b',
                }}
              >
                <Moon size={12} />
                Fewer than 3 bullets detected — add more experience detail for better results.
              </motion.div>
            )}

            <OutputBox data={error ? { error } : results} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}
