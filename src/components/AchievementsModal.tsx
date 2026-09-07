import React, { useState } from "react";
import { MockAttempt, ExamProfile } from "../types";
import { calculateAchievements, Achievement } from "../utils/achievements";
import { Award, Lock, CheckCircle, X } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  onOpenLogModal?: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  attempts,
  activeExam,
  onOpenLogModal,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  if (!isOpen) return null;

  const achievements = calculateAchievements(attempts, activeExam);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const overallPercentage = Math.round((unlockedCount / totalCount) * 100);

  const handleBadgeClick = (badge: Achievement) => {
    if (badge.unlocked) {
      HapticService.achievement();
    } else {
      HapticService.lightTap();
    }
    setSelectedBadge(badge);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Achievements &amp; Badges
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {unlockedCount}/{totalCount}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Milestone rewards for test logging and study streaks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
          <div className="space-y-1 flex-1">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Overall Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{overallPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {achievements.map((badge) => (
            <button
              key={badge.id}
              type="button"
              onClick={() => handleBadgeClick(badge)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer active:scale-95 ${
                badge.unlocked
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700 shadow-xs"
                  : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className={`text-2xl transition-transform group-hover:scale-110 ${!badge.unlocked ? "grayscale opacity-50" : ""}`}>
                  {badge.icon}
                </span>

                {badge.unlocked ? (
                  <span className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="p-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500">
                    <Lock className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-0.5">
                <h4 className={`text-xs font-black truncate ${badge.unlocked ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
                  {badge.title}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-tight">
                  {badge.description}
                </p>
              </div>

              {/* Progress Indicator for In-Progress Badges */}
              {!badge.unlocked ? (
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 space-y-0.5">
                  <div className="flex justify-between text-[8.5px] font-extrabold text-slate-400">
                    <span>{badge.currentValue} / {badge.targetValue}</span>
                    <span>{badge.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 pt-1.5 border-t border-amber-200/50 dark:border-amber-900/50 text-[9px] font-black text-amber-700 dark:text-amber-400">
                  <span>UNLOCKED ✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selected Badge Detail Sub-modal */}
        {selectedBadge && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 text-center relative animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close badge detail"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-3xl shadow-inner">
                {selectedBadge.icon}
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {selectedBadge.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                  <span>Status:</span>
                  <span className={selectedBadge.unlocked ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-amber-600 font-black"}>
                    {selectedBadge.unlocked ? "Unlocked 🎉" : "In Progress ⏳"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Criteria:</span>
                  <span>{selectedBadge.targetValue} {selectedBadge.unit}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
