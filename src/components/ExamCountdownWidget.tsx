import React from "react";
import { motion } from "motion/react";
import { ExamProfile } from "../types";
import { AnimatedSvgClock } from "./AnimatedSvgClock";
import { ChevronRight } from "lucide-react";
import { HapticService } from "../services/HapticService";
import { calculateDaysLeft } from "../utils/analytics";

interface ExamCountdownWidgetProps {
  activeExam: ExamProfile;
  onOpenSetDateModal?: () => void;
  className?: string;
}

export const ExamCountdownWidget: React.FC<ExamCountdownWidgetProps> = ({
  activeExam,
  onOpenSetDateModal,
  className = "",
}) => {
  const daysRemaining = calculateDaysLeft(activeExam.examDate);
  const hasDate = Boolean(activeExam.examDate);

  // Weeks & days breakdown e.g. 7w 3d
  const timeBreakdown = React.useMemo(() => {
    if (daysRemaining === null || daysRemaining <= 0) return null;
    const weeks = Math.floor(daysRemaining / 7);
    const remDays = daysRemaining % 7;
    if (weeks === 0) return `${remDays} days`;
    if (remDays === 0) return `${weeks} weeks`;
    return `${weeks}w ${remDays}d`;
  }, [daysRemaining]);

  const isUrgent = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 14;
  const isSuperUrgent = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 5;
  const isToday = daysRemaining === 0;

  const handleClick = () => {
    HapticService.lightTap();
    onOpenSetDateModal?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group backdrop-blur-md ${
        isSuperUrgent
          ? "border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/20 hover:border-rose-400"
          : isUrgent
          ? "border-amber-300 dark:border-amber-900/80 bg-amber-50/20 dark:bg-amber-950/20 hover:border-amber-400"
          : "border-indigo-100/90 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700"
      } ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Exam countdown for ${activeExam.name}. ${
        daysRemaining !== null ? `${daysRemaining} days remaining` : "Click to set target date"
      }`}
    >
      {/* Subtle Background Radial Aura */}
      <div
        className={`absolute -right-8 -top-8 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity ${
          isSuperUrgent
            ? "bg-rose-500/10 dark:bg-rose-500/15"
            : isUrgent
            ? "bg-amber-500/10 dark:bg-amber-500/15"
            : "bg-indigo-500/10 dark:bg-indigo-500/15"
        }`}
      />

      <div className="relative p-3 sm:p-3.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: Animated SVG Clock & Glow Badge */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="relative">
            <AnimatedSvgClock
              size={44}
              isUrgent={isUrgent}
              className="transform group-hover:scale-105 transition-transform duration-300"
            />
            {/* Small live indicator dot */}
            <span
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                isSuperUrgent
                  ? "bg-rose-500 animate-ping"
                  : isUrgent
                  ? "bg-amber-500 animate-pulse"
                  : "bg-indigo-500"
              }`}
            />
          </div>

          {/* MIDDLE: Primary Countdown Details */}
          <div className="min-w-0">
            {/* Micro Kicker */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
                Countdown
              </span>
              <span className="text-[10px] font-semibold text-slate-300 dark:text-slate-600">•</span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[220px]">
                {activeExam.shortCode || activeExam.name}
              </span>
            </div>

            {/* Main Metric Display */}
            {hasDate && daysRemaining !== null ? (
              daysRemaining > 0 ? (
                <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
                  <span className="font-stylish font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                    {daysRemaining}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-display">
                    {daysRemaining === 1 ? "Day Remaining" : "Days Remaining"}
                  </span>
                  {timeBreakdown && (
                    <span className="text-[11px] font-semibold font-mono text-slate-400 dark:text-slate-500">
                      ({timeBreakdown})
                    </span>
                  )}
                </div>
              ) : isToday ? (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="font-display font-black text-base sm:text-lg text-emerald-600 dark:text-emerald-400 leading-tight">
                    Exam Day Today! 🎯
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Best of luck!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="font-display font-bold text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Exam Concluded • Tap to set next date
                  </span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="font-display font-extrabold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                  Target Date Not Set
                </span>
                <span className="text-xs text-slate-400">— Tap to set</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Quick Action Pill / Chevron */}
        <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <span className="hidden sm:inline-block text-[11px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/80 px-2 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 font-display">
            {hasDate ? "Change Date" : "Set Date"}
          </span>
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};
