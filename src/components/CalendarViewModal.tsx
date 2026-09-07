import React, { useState, useMemo } from "react";
import { MockAttempt, ExamProfile } from "../types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { HapticService } from "../services/HapticService";
import { PlatformLogo } from "./PlatformLogo";

interface CalendarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  onSelectAttempt?: (attempt: MockAttempt) => void;
}

export const CalendarViewModal: React.FC<CalendarViewModalProps> = ({
  isOpen,
  onClose,
  attempts,
  activeExam,
  onSelectAttempt,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const examAttempts = useMemo(() => {
    return attempts.filter((a) => a.profileId === activeExam.id);
  }, [attempts, activeExam.id]);

  // Map dates to attempts
  const dateMap = useMemo(() => {
    const map: Record<string, MockAttempt[]> = {};
    examAttempts.forEach((att) => {
      const d = att.date ? att.date.split("T")[0] : "";
      if (d) {
        if (!map[d]) map[d] = [];
        map[d].push(att);
      }
    });
    return map;
  }, [examAttempts]);

  // Streak calculations
  const { currentStreak, maxStreak, activeDaysCount } = useMemo(() => {
    const dates = Object.keys(dateMap).sort();
    if (dates.length === 0) return { currentStreak: 0, maxStreak: 0, activeDaysCount: 0 };

    const uniqueDates = Array.from(new Set(dates)).sort();
    let curStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check consecutive days
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diffDays = Math.round(
          (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak += 1;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // Check if current streak extends to today or yesterday
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      curStreak = tempStreak;
    } else {
      curStreak = 0;
    }

    return {
      currentStreak: curStreak,
      maxStreak: Math.max(longestStreak, curStreak),
      activeDaysCount: uniqueDates.length,
    };
  }, [dateMap]);

  if (!isOpen) return null;

  // Calendar month calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  // Convert to Mon = 0
  const startDay = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    HapticService.lightTap();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    HapticService.lightTap();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectedAttempts = dateMap[selectedDateStr] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 truncate">
                Mock Activity Calendar
              </h2>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {activeExam.shortCode || activeExam.name} • {examAttempts.length} Mocks Logged
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Consistency & Streaks Strip */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                Streak
              </span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100 tabular-nums">
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-indigo-500" />
                Best Streak
              </span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {maxStreak} {maxStreak === 1 ? "day" : "days"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Active Days
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeDaysCount}
              </span>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 bg-white dark:bg-slate-900">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span
                  key={day}
                  className="text-[10px] font-bold text-slate-400 uppercase"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading cells */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const attemptsOnDay = dateMap[dStr] || [];
                const hasAttempts = attemptsOnDay.length > 0;
                const isSelected = selectedDateStr === dStr;
                const isToday = new Date().toISOString().split("T")[0] === dStr;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => {
                      HapticService.selection();
                      setSelectedDateStr(dStr);
                    }}
                    className={`h-9 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer text-xs font-bold ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : hasAttempts
                        ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    } ${isToday && !isSelected ? "ring-2 ring-indigo-400/40" : ""}`}
                  >
                    <span>{dayNum}</span>
                    {hasAttempts && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                          isSelected ? "bg-white" : "bg-indigo-600 dark:bg-indigo-400"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Attempts Drill-down */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                {selectedDateStr === new Date().toISOString().split("T")[0]
                  ? "Today"
                  : selectedDateStr}
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                {selectedAttempts.length} {selectedAttempts.length === 1 ? "attempt" : "attempts"}
              </span>
            </div>

            {selectedAttempts.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold">
                  No mock tests logged on this date
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    onClick={() => {
                      if (onSelectAttempt) {
                        HapticService.lightTap();
                        onSelectAttempt(attempt);
                        onClose();
                      }
                    }}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlatformLogo platformId={attempt.platform} size="sm" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                          {attempt.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {attempt.testType || "Full Mock"} • Acc: {attempt.accuracy}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block tabular-nums">
                        {attempt.score}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        / {attempt.maxMarks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
