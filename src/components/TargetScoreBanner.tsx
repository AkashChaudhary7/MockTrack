import React from "react";
import { motion } from "motion/react";
import { Doodle3DTarget, Doodle3DSparkle } from "./Doodles3D";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-indigo-50/30 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100/90 dark:border-indigo-900/60 p-3.5 sm:p-4 shadow-xs transition-all hover:shadow-md"
    >
      {/* Soft Ambient Depth Glow */}
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Minimal Target Score & Progress */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Target Label & Numbers */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
                Target Score
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600">
                • {activeExam.shortCode || activeExam.name}
              </span>
            </div>

            <div className="flex items-baseline gap-1 font-display">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tabular-nums">
                {targetScore}
              </span>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                / {totalMarks}
              </span>
            </div>
          </div>

          {/* Minimalist Progress Bar */}
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          {/* Minimalist Subline: Current Avg & Target Reach */}
          <div className="flex items-center justify-between text-xs font-bold pt-0.5">
            <span className="text-slate-600 dark:text-slate-400">
              Current Avg:{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-black tabular-nums font-display">
                {currentScore > 0 ? currentScore : "--"}
              </strong>
            </span>

            <span
              className={`tabular-nums font-black font-display text-xs ${
                isTargetMet
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {isTargetMet ? "Target Reached 🎯" : `${remainingMarks} to target`}
            </span>
          </div>
        </div>

        {/* Right: 3D Target Doodle */}
        <div className="shrink-0 pl-1">
          <div className="relative transition-transform duration-300 hover:scale-110">
            <Doodle3DTarget size={58} className="sm:w-16 sm:h-16" />
            {isTargetMet && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                <Doodle3DSparkle size={10} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
