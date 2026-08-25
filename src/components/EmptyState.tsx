import React from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";

interface EmptyStateProps {
  type: "history" | "insights" | "reports";
  onAction?: () => void;
  actionText?: string;
  title?: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  actionText,
  title,
  subtitle,
}) => {
  if (type === "history") {
    return (
      <div id="empty-state-history" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-5 card-bevel-3d max-w-lg mx-auto my-4">
        {/* Premium Adaptive SVG Illustration */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
          <svg
            className="w-28 h-28 sm:w-32 sm:h-32 relative z-10 drop-shadow-md"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Clipboard Body */}
            <rect x="25" y="25" width="70" height="80" rx="14" className="fill-slate-50 dark:fill-slate-800/90 stroke-slate-200 dark:stroke-slate-700" strokeWidth="2" />
            {/* Top Clip */}
            <rect x="42" y="18" width="36" height="12" rx="4" className="fill-indigo-600 dark:fill-indigo-500" />
            <circle cx="60" cy="24" r="2.5" className="fill-white" />
            {/* List Lines */}
            <rect x="36" y="42" width="48" height="6" rx="3" className="fill-indigo-200 dark:fill-indigo-900/80" />
            <rect x="36" y="56" width="38" height="6" rx="3" className="fill-slate-200 dark:fill-slate-700" />
            <rect x="36" y="70" width="42" height="6" rx="3" className="fill-slate-200 dark:fill-slate-700" />
            {/* Checkmark Badge */}
            <circle cx="82" cy="80" r="16" className="fill-emerald-500 dark:fill-emerald-600" />
            <path d="M75 80L79 84L89 74" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Sparkles */}
            <path d="M22 22L23.5 26.5L28 28L23.5 29.5L22 34L20.5 29.5L16 28L20.5 26.5L22 22Z" className="fill-amber-400" />
            <path d="M96 24L97.5 27.5L101 29L97.5 30.5L96 34L94.5 30.5L91 29L94.5 27.5L96 24Z" className="fill-indigo-400" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {title || "No Mock Tests Logged Yet"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
            {subtitle || "Record your first mock score to track accuracy, rank predictions, and subject performance over time."}
          </p>
        </div>

        {onAction && (
          <motion.button
            id="empty-state-log-btn"
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -1 }}
            onClick={onAction}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{actionText || "Log First Mock"}</span>
          </motion.button>
        )}
      </div>
    );
  }

  if (type === "insights") {
    return (
      <div id="empty-state-insights" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-5 card-bevel-3d max-w-lg mx-auto my-4">
        {/* Analytics Adaptive SVG Illustration */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-xl animate-pulse" />
          <svg
            className="w-28 h-28 sm:w-32 sm:h-32 relative z-10 drop-shadow-md"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="20" y="25" width="80" height="75" rx="16" className="fill-slate-50 dark:fill-slate-800/90 stroke-slate-200 dark:stroke-slate-700" strokeWidth="2" />
            {/* Bar chart graphics */}
            <rect x="32" y="62" width="12" height="25" rx="4" className="fill-indigo-400 dark:fill-indigo-500" />
            <rect x="50" y="50" width="12" height="37" rx="4" className="fill-teal-400 dark:fill-teal-500" />
            <rect x="68" y="38" width="12" height="49" rx="4" className="fill-indigo-600 dark:fill-indigo-400" />
            {/* Trend line */}
            <path d="M30 58L52 44L72 34L92 20" className="stroke-amber-400" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="3 3" />
            <circle cx="92" cy="20" r="5" className="fill-amber-400 stroke-white dark:stroke-slate-900" strokeWidth="2" />
            {/* Sparkles */}
            <path d="M18 36L19.5 39.5L23 41L19.5 42.5L18 46L16.5 42.5L13 41L16.5 39.5L18 36Z" className="fill-amber-400" />
            <path d="M98 52L99.5 55.5L103 57L99.5 58.5L98 62L96.5 58.5L93 57L96.5 55.5L98 52Z" className="fill-teal-400" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {title || "Analytics Await Your First Mock"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
            {subtitle || "Log a mock test to calculate baseline rating, subject radar breakdown, and cutoff clearance odds."}
          </p>
        </div>

        {onAction && (
          <motion.button
            id="empty-state-unlock-btn"
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -1 }}
            onClick={onAction}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{actionText || "Log Mock To Unlock Insights"}</span>
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div id="empty-state-generic" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 card-bevel-3d max-w-lg mx-auto my-4">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
        📄
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
          {title || "No Reports Available"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {subtitle || "Log mock scores to automatically generate printable performance reports."}
        </p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          {actionText || "Get Started"}
        </button>
      )}
    </div>
  );
};
