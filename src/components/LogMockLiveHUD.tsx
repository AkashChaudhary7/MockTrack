import React from "react";
import { MockLiveComparison, getAccuracyTier } from "../utils/mockCalculator";
import { Sparkles, Target, TrendingUp, TrendingDown, Clock, Award, ShieldCheck } from "lucide-react";

interface LogMockLiveHUDProps {
  score: number;
  maxMarks: number;
  accuracy: number;
  comparison: MockLiveComparison;
  targetScore?: number;
  examShortCode: string;
  pacingInfo?: {
    formattedPacing: string;
    statusLabel: string;
    speedCategory: "fast" | "optimal" | "deliberate" | "slow";
  } | null;
  strongestSection?: { name: string; score: number; maxMarks: number; percentage: number };
  weakestSection?: { name: string; score: number; maxMarks: number; percentage: number };
}

export const LogMockLiveHUD: React.FC<LogMockLiveHUDProps> = ({
  score,
  maxMarks,
  accuracy,
  comparison,
  targetScore,
  examShortCode,
  pacingInfo,
  strongestSection,
  weakestSection,
}) => {
  const accuracyTier = getAccuracyTier(accuracy);

  return (
    <div className="card-luminous rounded-2xl p-4 sm:p-4.5 border border-indigo-100 dark:border-indigo-950/70 bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 shadow-xs space-y-3">
      {/* Top Row: Live Score & Target Progress */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">
            Live Performance Intelligence
          </span>
        </div>

        {/* New Personal Best Badge */}
        {comparison.isNewPersonalBest && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 animate-bounce">
            <Award className="w-3 h-3 text-amber-500" />
            <span>Personal Best Alert! 🏆</span>
          </span>
        )}

        {/* Target Status */}
        {targetScore !== undefined && (
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">Target: {targetScore}</span>
            {comparison.targetAchieved ? (
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                Target Met!
              </span>
            ) : comparison.deltaVsTarget !== null ? (
              <span className="text-slate-400 text-[11px] font-semibold">
                ({comparison.deltaVsTarget} pts)
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Score & Percentage */}
        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
            Net Percentage
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black font-display text-indigo-600 dark:text-indigo-400">
              {comparison.scorePercentage}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              ({score}/{maxMarks})
            </span>
          </div>
        </div>

        {/* Accuracy Tier */}
        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
            Precision Tier
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-sm">{accuracyTier.icon}</span>
            <span className={`text-xs font-black font-display truncate ${accuracyTier.textColor}`}>
              {accuracy > 0 ? `${accuracy}%` : "0%"}
            </span>
          </div>
        </div>

        {/* Delta vs Last Mock */}
        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
            vs Previous Mock
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {comparison.deltaVsLast === null ? (
              <span className="text-xs font-bold text-slate-400">First Mock</span>
            ) : comparison.deltaVsLast > 0 ? (
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-display">
                <TrendingUp className="w-3.5 h-3.5" />
                +{comparison.deltaVsLast} pts
              </span>
            ) : comparison.deltaVsLast < 0 ? (
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-0.5 font-display">
                <TrendingDown className="w-3.5 h-3.5" />
                {comparison.deltaVsLast} pts
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-500 font-display">Same score</span>
            )}
          </div>
        </div>

        {/* Speed / Pacing */}
        <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
            Time Pacing
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            {pacingInfo ? (
              <div className="flex items-center gap-1 min-w-0">
                <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="text-xs font-black font-display text-slate-800 dark:text-slate-200 truncate">
                  {pacingInfo.formattedPacing}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Add time spent</span>
            )}
          </div>
        </div>
      </div>

      {/* Subject Highlights (Strongest vs Weakest) */}
      {(strongestSection || weakestSection) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          {strongestSection && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">🌟 Top:</span>
              <span className="truncate max-w-[140px]">{strongestSection.name}</span>
              <span className="font-black text-emerald-600 dark:text-emerald-300 font-display">
                ({strongestSection.percentage}%)
              </span>
            </div>
          )}

          {weakestSection && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 font-semibold">
              <span className="font-bold text-amber-600 dark:text-amber-400">⚠️ Focus:</span>
              <span className="truncate max-w-[140px]">{weakestSection.name}</span>
              <span className="font-black text-amber-600 dark:text-amber-300 font-display">
                ({weakestSection.percentage}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
