import React from "react";
import { motion } from "motion/react";
import { ExamProfile, MockAttempt } from "../types";

interface TargetScoreBannerProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  avgFullMockScore: number;
  latestAttempt?: MockAttempt;
}

export const TargetScoreBanner: React.FC<TargetScoreBannerProps> = ({
  activeExam,
  avgFullMockScore,
  latestAttempt,
}) => {
  const targetScore = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.8);
  const totalMarks = activeExam.totalMarks || 200;

  // Determine current benchmark score
  const currentScore = avgFullMockScore > 0 ? avgFullMockScore : (latestAttempt?.score || 0);
  const progressPercent = Math.min(100, Math.round((currentScore / targetScore) * 100));
  const remainingMarks = Math.max(0, Math.round((targetScore - currentScore) * 10) / 10);
  const isTargetMet = currentScore >= targetScore && targetScore > 0;
  const surplusMarks = isTargetMet ? Math.round((currentScore - targetScore) * 10) / 10 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-100/90 dark:border-indigo-900/50 p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all backdrop-blur-md group"
    >
      {/* Background Decorative Aerospace / Precision SVG Grid Watermark */}
      <svg
        className="absolute -right-8 -bottom-8 w-48 h-48 opacity-[0.04] dark:opacity-[0.07] pointer-events-none text-indigo-600 dark:text-indigo-300"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="45" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="50" cy="50" r="30" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="15" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="50" y1="0" x2="50" y2="100" strokeWidth="0.6" />
        <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.6" />
      </svg>

      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-0 right-1/4 w-52 h-32 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative space-y-3">
        {/* Header Row: Kicker & Big Numbers */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 font-display">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              Target Score
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-none">
              {activeExam.shortCode || activeExam.name}
            </span>
          </div>

          {/* Target Value Typography */}
          <div className="flex items-baseline gap-1.5 font-stylish">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
              {targetScore}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 font-mono">
              / {totalMarks}
            </span>
            <span className="ml-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Premium Multi-Tiered Progress Bar with Precision Ticks */}
        <div className="space-y-1.5">
          <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/70 dark:border-slate-700/60 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(3, progressPercent))}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className={`h-full rounded-full relative overflow-hidden transition-all ${
                isTargetMet
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-sm shadow-emerald-500/20"
                  : "bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 shadow-sm shadow-indigo-500/20"
              }`}
            >
              {/* Animated Shimmer Sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          {/* Tick Markers at 25%, 50%, 75%, 100% */}
          <div className="flex justify-between items-center px-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono select-none">
            <span>0%</span>
            <span className="hidden sm:inline">25%</span>
            <span>50%</span>
            <span className="hidden sm:inline">75%</span>
            <span className={isTargetMet ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : ""}>
              100% (Goal)
            </span>
          </div>
        </div>

        {/* Key Metric Chips Row with Premium Typography */}
        <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
          {/* Current Benchmark */}
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold">Current Benchmark:</span>
            <span className="font-stylish font-black text-slate-900 dark:text-white tabular-nums">
              {currentScore > 0 ? currentScore : "--"}
            </span>
          </div>

          {/* Target Status Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black font-display tracking-tight transition-transform ${
              isTargetMet
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800"
                : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800"
            }`}
          >
            {isTargetMet ? (
              <>
                <span className="text-sm">🎯</span>
                <span>Target Achieved {surplusMarks > 0 ? `(+${surplusMarks})` : ""}</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>
                  {remainingMarks > 0 ? `${remainingMarks} marks to target` : "On track to target"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
