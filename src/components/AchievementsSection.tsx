import React, { useState } from "react";
import { MockAttempt, ExamProfile } from "../types";
import { calculateAchievements, Achievement } from "../utils/achievements";
import { Award, Lock, CheckCircle, Sparkles, X, ChevronRight } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface AchievementsSectionProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  onOpenLogModal?: () => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  attempts,
  activeExam,
  onOpenLogModal,
}) => {
  const achievements = calculateAchievements(attempts, activeExam);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const overallPercentage = Math.round((unlockedCount / totalCount) * 100);

  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  const handleBadgeClick = (badge: Achievement) => {
    if (badge.unlocked) {
      HapticService.achievement();
    } else {
      HapticService.lightTap();
    }
    setSelectedBadge(badge);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Achievements &amp; Badges
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {unlockedCount}/{totalCount} Unlocked
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">
              Milestone rewards unlocked as you log mock tests and maintain preparation streaks
            </p>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 sm:w-36 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/70 dark:border-slate-700/70">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300 w-10 text-right">
            {overallPercentage}%
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {achievements.map((badge) => {
          return (
            <button
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer active:scale-98 ${
                badge.unlocked
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700 shadow-xs"
                  : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-85"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-2xl sm:text-3xl transition-transform group-hover:scale-110 ${!badge.unlocked ? "grayscale opacity-50" : ""}`}>
                  {badge.icon}
                </span>

                {badge.unlocked ? (
                  <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-0.5">
                <h4 className={`text-xs font-black truncate ${badge.unlocked ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}>
                  {badge.title}
                </h4>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                  {badge.description}
                </p>
              </div>

              {/* Progress Indicator for In-Progress Badges */}
              {!badge.unlocked ? (
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between text-[9px] font-extrabold text-slate-400">
                    <span>Progress</span>
                    <span>{badge.currentValue} / {badge.targetValue} {badge.unit}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-2 border-t border-amber-200/50 dark:border-amber-900/50 flex items-center justify-between text-[10px] font-black text-amber-700 dark:text-amber-400">
                  <span>UNLOCKED</span>
                  <span>{badge.unlockedDate || "✓ Ready"}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Badge Modal / Drawer */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center relative overflow-hidden">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-inner ${
              selectedBadge.unlocked
                ? "bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700"
                : "bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 grayscale opacity-60"
            }`}>
              {selectedBadge.icon}
            </div>

            <div className="space-y-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                selectedBadge.unlocked
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {selectedBadge.unlocked ? "✓ Achievement Unlocked" : "🔒 In Progress"}
              </span>

              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 pt-1">
                {selectedBadge.title}
              </h3>

              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                {selectedBadge.description}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-left space-y-2">
              <div className="flex justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                <span>Current Status</span>
                <span>{selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.unit}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedBadge.unlocked ? "bg-amber-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${selectedBadge.progress}%` }}
                />
              </div>
            </div>

            {!selectedBadge.unlocked && onOpenLogModal && (
              <button
                onClick={() => {
                  setSelectedBadge(null);
                  HapticService.selection();
                  onOpenLogModal();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <span>Log a Mock to Progress</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-2xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
