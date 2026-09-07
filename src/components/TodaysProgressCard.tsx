import React, { useState } from "react";
import { MockAttempt, ExamProfile, CandidateProfile } from "../types";
import {
  calculateStreakStats,
  calculatePracticeTimeStats,
  getTodayMockStatus,
  renderAsciiProgressBar,
  formatPracticeTime,
} from "../utils/habitUtils";
import {
  Flame,
  Clock,
  CheckCircle2,
  Plus,
  Target,
  Settings2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { HapticService } from "../services/HapticService";

interface TodaysProgressCardProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  candidate: CandidateProfile;
  onNavigateTab: (tab: "log" | "history" | "insights") => void;
  onUpdateWeeklyGoal: (newGoal: number) => void;
}

export const TodaysProgressCard: React.FC<TodaysProgressCardProps> = ({
  attempts,
  activeExam,
  candidate,
  onNavigateTab,
  onUpdateWeeklyGoal,
}) => {
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>("");

  const weeklyGoal = candidate.weeklyGoal || 7; // Default: 7 mocks/week (1/day)
  const streakStats = calculateStreakStats(attempts);
  const practiceStats = calculatePracticeTimeStats(attempts, activeExam.defaultDurationMinutes);
  const todayStatus = getTodayMockStatus(attempts, activeExam);

  const weeklyCompleted = streakStats.weeklyCompletionCount;
  const progressBarString = renderAsciiProgressBar(weeklyCompleted, weeklyGoal, 8);

  const handleSelectGoal = (target: number) => {
    HapticService.selection();
    onUpdateWeeklyGoal(target);
    setIsGoalPickerOpen(false);
  };

  const handleCustomGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customGoalInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 50) {
      handleSelectGoal(parsed);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
      {/* Header Row: Today's Progress Title + Goal Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Today's Progress
          </span>
          {todayStatus.hasLoggedToday && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Goal Active</span>
            </span>
          )}
        </div>

        {/* Goal dropdown button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setIsGoalPickerOpen(!isGoalPickerOpen);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            <span>Goal: {weeklyGoal === 7 ? "1 Mock / Day" : weeklyGoal === 14 ? "2 Mocks / Day" : `${weeklyGoal} / Wk`}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Goal Picker Popover */}
          {isGoalPickerOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-2 pt-1">
                Mock-Frequency Goal
              </span>
              <button
                type="button"
                onClick={() => handleSelectGoal(7)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                  weeklyGoal === 7
                    ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span>1 Mock / Day (7/wk)</span>
                {weeklyGoal === 7 && <span className="text-xs">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => handleSelectGoal(14)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                  weeklyGoal === 14
                    ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span>2 Mocks / Day (14/wk)</span>
                {weeklyGoal === 14 && <span className="text-xs">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => handleSelectGoal(3)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                  weeklyGoal === 3
                    ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span>3 Mocks / Week</span>
                {weeklyGoal === 3 && <span className="text-xs">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => handleSelectGoal(5)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                  weeklyGoal === 5
                    ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span>5 Mocks / Week</span>
                {weeklyGoal === 5 && <span className="text-xs">✓</span>}
              </button>

              {/* Custom Goal Input */}
              <form onSubmit={handleCustomGoalSubmit} className="pt-1 border-t border-slate-100 dark:border-slate-700 px-1">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    placeholder="Custom/wk"
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-black hover:bg-indigo-500 cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Main Habit Action & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* State A: User has NOT logged mock today */}
        {!todayStatus.hasLoggedToday ? (
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              onNavigateTab("log");
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-black text-xs sm:text-sm shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>+ Log Today's Mock</span>
          </button>
        ) : (
          /* State B: User HAS already logged a mock today */
          <div className="flex items-center gap-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 block leading-tight">
                ✓ Mock Logged Today
              </span>
              {todayStatus.todayScoreDisplay && (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block truncate">
                  Today's Score: {todayStatus.todayScoreDisplay}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Secondary: Log another mock if desired without nagging */}
        {todayStatus.hasLoggedToday && (
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              onNavigateTab("log");
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-left sm:text-right"
          >
            + Log another test
          </button>
        )}
      </div>

      {/* Progress Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* 1. Streak */}
        <div className="p-2 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            <Flame className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Streak</span>
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 block mt-0.5 truncate">
            🔥 {streakStats.currentStreak} day streak
          </span>
        </div>

        {/* 2. Weekly Mock Goal & Progress */}
        <div className="p-2 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="truncate">Weekly Goal</span>
            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              {weeklyCompleted}/{weeklyGoal}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="font-mono text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 tracking-tighter leading-none select-none">
              {progressBarString}
            </span>
          </div>
        </div>

        {/* 3. Practice Time */}
        <div className="p-2 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            <Clock className="w-3 h-3 text-sky-500 shrink-0" />
            <span>Practice</span>
          </div>
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 block mt-0.5 truncate">
            {formatPracticeTime(practiceStats.thisWeekMinutes || practiceStats.allTimeMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
};
