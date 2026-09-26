import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MockAttempt, ExamProfile } from "../types";
import { calculateAchievements, Achievement } from "../utils/achievements";
import { HapticService } from "../services/HapticService";
import { X, Sparkles, ChevronRight, Award } from "lucide-react";

interface DashboardBadgesProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
}

/**
 * Animated SVG Medallion Icons for Badges
 */
const BadgeSvgMedal: React.FC<{ type: string; unlocked: boolean; size?: number }> = ({
  type,
  unlocked,
  size = 48,
}) => {
  const grayscaleClass = !unlocked ? "grayscale opacity-40" : "filter drop-shadow-sm";

  if (type === "ten_mocks" || type === "milestone") {
    // 10 Mocks Logged / Decathlon Medal
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-110 ${grayscaleClass}`}
      >
        <defs>
          <linearGradient id="gold-ten" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="ribbon-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
        </defs>
        {/* Ribbons */}
        <path d="M 22 2 L 14 32 L 24 28 L 28 2 Z" fill="url(#ribbon-blue)" />
        <path d="M 42 2 L 50 32 L 40 28 L 36 2 Z" fill="url(#ribbon-blue)" />
        {/* Circular Gold Medallion */}
        <circle cx="32" cy="36" r="22" fill="#78350F" />
        <circle cx="32" cy="35" r="21" fill="url(#gold-ten)" stroke="#FEF08A" strokeWidth="1.5" />
        <circle cx="32" cy="35" r="16" fill="none" stroke="#B45309" strokeDasharray="3 2" strokeWidth="1.5" />
        {/* 10 numeral or lightning in center */}
        <text
          x="32"
          y="41"
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fontFamily="sans-serif"
          fill="#78350F"
        >
          10
        </text>
        {/* Sparkle star */}
        <polygon points="32,18 34,22 38,23 35,26 36,30 32,27 28,30 29,26 26,23 30,22" fill="#FFFFFF" opacity="0.9" />
      </svg>
    );
  }

  if (type === "streak" || type === "five_day_streak") {
    // Consistent Week / Fire Streak Medal
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-110 ${grayscaleClass}`}
      >
        <defs>
          <linearGradient id="fire-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="60%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="shield-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        {/* Outer Shield Plate */}
        <path
          d="M 32 4 L 54 14 C 54 36 32 58 32 58 C 32 58 10 36 10 14 Z"
          fill="#7C2D12"
        />
        <path
          d="M 32 6 L 52 15 C 52 35 32 55 32 55 C 32 55 12 35 12 15 Z"
          fill="#FFF7ED"
          stroke="url(#shield-rim)"
          strokeWidth="2"
        />
        {/* Animated Flame Vector */}
        <path
          d="M 32 18 C 36 24 42 28 42 37 C 42 44 37 48 32 48 C 27 48 22 44 22 37 C 22 30 28 24 30 22 C 30 27 34 30 34 30 C 34 30 33 24 32 18 Z"
          fill="url(#fire-grad)"
        />
        <path
          d="M 32 32 C 34 35 36 38 36 41 C 36 44 34 46 32 46 C 30 46 28 44 28 41 C 28 38 31 35 32 32 Z"
          fill="#FEF08A"
        />
      </svg>
    );
  }

  if (type === "mastery" || type === "target_crusher") {
    // Personal Best Streak / Target Crusher
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-110 ${grayscaleClass}`}
      >
        <defs>
          <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        {/* Laurel Wreath */}
        <path d="M 12 28 C 12 42 22 52 32 54 C 42 52 52 42 52 28" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        <circle cx="14" cy="30" r="3" fill="#34D399" />
        <circle cx="50" cy="30" r="3" fill="#34D399" />
        <circle cx="20" cy="45" r="3" fill="#34D399" />
        <circle cx="44" cy="45" r="3" fill="#34D399" />
        {/* Center Target Bullseye with Crown */}
        <circle cx="32" cy="30" r="16" fill="#064E3B" />
        <circle cx="32" cy="30" r="14" fill="#047857" />
        <circle cx="32" cy="30" r="9" fill="#10B981" />
        <circle cx="32" cy="30" r="4" fill="#FEF08A" />
        {/* Crown on top */}
        <path d="M 24 18 L 22 10 L 28 14 L 32 8 L 36 14 L 42 10 L 40 18 Z" fill="url(#crown-gold)" stroke="#78350F" strokeWidth="1" />
      </svg>
    );
  }

  if (type === "accuracy" || type === "high_accuracy") {
    // Sniper Accuracy
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-300 group-hover:scale-110 ${grayscaleClass}`}
      >
        <defs>
          <linearGradient id="scope-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill="#0C4A6E" />
        <circle cx="32" cy="32" r="20" fill="url(#scope-cyan)" stroke="#BAE6FD" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="13" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="4 2" />
        {/* Crosshair lines */}
        <line x1="32" y1="14" x2="32" y2="50" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="32" x2="50" y2="32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="32" cy="32" r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    );
  }

  // Default / First Mock Logged Star
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 group-hover:scale-110 ${grayscaleClass}`}
    >
      <defs>
        <linearGradient id="star-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="22" fill="#4338CA" />
      <circle cx="32" cy="32" r="20" fill="#4F46E5" stroke="#C7D2FE" strokeWidth="1.5" />
      <polygon
        points="32,15 36,25 47,26 39,33 42,44 32,38 22,44 25,33 17,26 28,25"
        fill="url(#star-gold)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const DashboardBadges: React.FC<DashboardBadgesProps> = ({
  attempts,
  activeExam,
}) => {
  const achievements = calculateAchievements(attempts, activeExam);
  const unlockedBadges = achievements.filter((a) => a.unlocked);
  const totalCount = achievements.length;
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  // Showcase key highlight badges requested by user
  const showcaseBadges = [
    achievements.find((a) => a.id === "ten_mocks") || achievements[4],
    achievements.find((a) => a.id === "five_day_streak") || achievements[1],
    achievements.find((a) => a.id === "target_crusher") || achievements[3],
    achievements.find((a) => a.id === "high_accuracy") || achievements[2],
    achievements.find((a) => a.id === "first_mock") || achievements[0],
  ].filter(Boolean) as Achievement[];

  const handleBadgeClick = (badge: Achievement) => {
    if (badge.unlocked) {
      HapticService.achievement();
    } else {
      HapticService.lightTap();
    }
    setSelectedBadge(badge);
  };

  return (
    <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Unlocked Badges</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold font-mono">
                {unlockedBadges.length}/{totalCount}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Milestone achievements powered by consistent mock practice
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-display hidden sm:inline">
          {Math.round((unlockedBadges.length / totalCount) * 100)}% Complete
        </span>
      </div>

      {/* Visual Animated SVG Badges Row */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-1">
        {showcaseBadges.map((badge, idx) => {
          return (
            <motion.button
              key={badge.id}
              initial={{ scale: 0.8, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleBadgeClick(badge)}
              className={`p-2 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between group active:scale-95 relative ${
                badge.unlocked
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80 hover:border-amber-400 dark:hover:border-amber-600 shadow-2xs"
                  : "bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
              title={`${badge.title}: ${badge.unlocked ? "Unlocked!" : `${badge.currentValue}/${badge.targetValue} ${badge.unit}`}`}
            >
              {/* Badge SVG Graphic */}
              <div className="py-1">
                <BadgeSvgMedal type={badge.id} unlocked={badge.unlocked} size={42} />
              </div>

              {/* Title & Status */}
              <div className="w-full mt-1">
                <span className="text-[11px] font-black font-display text-slate-800 dark:text-slate-200 block truncate leading-tight">
                  {badge.title}
                </span>

                <div className="mt-1 flex items-center justify-center">
                  {badge.unlocked ? (
                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Earned
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 tabular-nums font-mono">
                      {badge.currentValue}/{badge.targetValue}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl text-center space-y-3 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pt-2 flex justify-center">
                <BadgeSvgMedal type={selectedBadge.id} unlocked={selectedBadge.unlocked} size={64} />
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${
                  selectedBadge.unlocked
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {selectedBadge.unlocked ? "✓ Achievement Unlocked" : "Locked Milestone"}
                </span>

                <h4 className="text-base font-black font-display text-slate-900 dark:text-slate-100">
                  {selectedBadge.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedBadge.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                  <span>Target Progress</span>
                  <span className="font-mono tabular-nums">{selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${selectedBadge.progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-xs rounded-xl cursor-pointer transition-colors font-display"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
