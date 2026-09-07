import React, { useState } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, NavTab } from "../types";
import { calculateAnalytics } from "../utils/analytics";
import { calculateStreakStats, calculatePracticeTimeStats, formatPracticeTime } from "../utils/habitUtils";
import { MilestoneEvent } from "../utils/milestones";
import { MilestoneBanner } from "./MilestoneBanner";
import { PLATFORMS } from "../data/platforms";
import { PerformanceTrendChart } from "./PerformanceTrendChart";
import { motion, useReducedMotion } from "motion/react";
import {
  Target,
  Plus,
  Camera,
  ArrowRight,
  Eye,
  ChevronDown,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  Share2,
  Flame,
  Clock,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { PlatformLogo } from "./PlatformLogo";
import { HapticService } from "../services/HapticService";
import { CalendarViewModal } from "./CalendarViewModal";
import { ExperienceFeedbackBanner } from "./ExperienceFeedbackBanner";
import { FeedbackModal } from "./FeedbackModal";
import { FirstMockGuideBanner } from "./FirstMockGuideBanner";

interface DashboardScreenProps {
  candidate: CandidateProfile;
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onOpenLogModal: () => void;
  onOpenOcrModal: (tab: "image" | "link") => void;
  onNavigateTab: (tab: NavTab) => void;
  onSelectAttempt: (attempt: MockAttempt) => void;
  onOpenProfileSwitcher: () => void;
  onOpenSetDateModal?: () => void;
  onUpdateExamProfile?: (updatedProfile: ExamProfile) => void;
  onUpdateWeeklyGoal?: (newGoal: number) => void;
  onOpenScoreCard?: (milestoneTitle?: string) => void;
  activeMilestone?: MilestoneEvent | null;
  onDismissMilestone?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  candidate,
  activeExam,
  attempts,
  onOpenLogModal,
  onOpenOcrModal,
  onNavigateTab,
  onSelectAttempt,
  onOpenProfileSwitcher,
  onOpenSetDateModal,
  onUpdateExamProfile,
  onUpdateWeeklyGoal,
  onOpenScoreCard,
  activeMilestone,
  onDismissMilestone,
}) => {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const { t, effectiveLang } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const analytics = calculateAnalytics(attempts, activeExam);
  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);

  // Habit and streak calculations
  const streakStats = calculateStreakStats(attempts);
  const practiceStats = calculatePracticeTimeStats(attempts, activeExam.defaultDurationMinutes);

  // IMPORTANT: Filter ONLY "Full Mock" tests for Average and Highest Score calculations
  const fullMocks = examAttempts.filter(
    (a) => a.testType === "Full Mock" || (!a.testType && a.maxMarks === activeExam.totalMarks)
  );
  const avgFullMockScore = fullMocks.length > 0
    ? Math.round((fullMocks.reduce((acc, m) => acc + m.score, 0) / fullMocks.length) * 10) / 10
    : 0;
  const highestFullMockScore = fullMocks.length > 0
    ? Math.max(...fullMocks.map((m) => m.score))
    : 0;

  // Overall Accuracy
  const totalCorrect = examAttempts.reduce((acc, m) => acc + (m.correctCount || 0), 0);
  const totalIncorrect = examAttempts.reduce((acc, m) => acc + (m.incorrectCount || 0), 0);
  const totalAttempted = totalCorrect + totalIncorrect;
  const overallAccuracy = totalAttempted > 0
    ? Math.round((totalCorrect / totalAttempted) * 1000) / 10
    : (analytics.overallAccuracy || 0);

  // Syllabus completed
  const syllabusCompleted = activeExam.syllabusProgress ?? (examAttempts.length > 0 ? Math.min(100, 50 + examAttempts.length * 4) : 45);

  const sortedAttempts = [...examAttempts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentAttempts = sortedAttempts.slice(0, 4);
  const latestAttempt = sortedAttempts[0];

  // Target Score & Goal calculations
  const targetScore = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.8);
  const currentAvgScore = avgFullMockScore > 0 ? avgFullMockScore : (latestAttempt?.score || 0);
  const progressPercent = Math.min(100, Math.round((currentAvgScore / targetScore) * 100));
  const remainingMarks = Math.max(0, Math.round((targetScore - currentAvgScore) * 10) / 10);

  // Time-based greeting
  const today = new Date();
  const dateStr = today.toLocaleDateString(effectiveLang === "hi" ? "hi-IN" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-28 max-w-2xl mx-auto"
    >
      {/* 1. HEADER & GREETING - Single-line guaranteed User Name */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="flex items-center justify-between gap-2.5 pt-1"
      >
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-extrabold text-indigo-600/80 dark:text-indigo-400/90 uppercase tracking-wider block truncate">
            {dateStr}
          </span>
          {/* User Name in Single Line with truncate and whitespace-nowrap */}
          <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight truncate whitespace-nowrap leading-tight">
            Hi, {candidate.name} 👋
          </h1>
        </div>

        {/* Active Exam Selector Button */}
        <button
          onClick={() => {
            HapticService.lightTap();
            onOpenProfileSwitcher();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/90 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-black border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
        >
          <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate max-w-[130px] sm:max-w-none font-bold">
            {activeExam.shortCode || activeExam.name}
          </span>
          <ChevronDown className="w-3 h-3 text-indigo-500 shrink-0" />
        </button>
      </motion.div>

      {/* 2. FIRST MOCK ONBOARDING INFO BANNER - Prominent when 0 attempts */}
      {examAttempts.length === 0 && (
        <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
          <FirstMockGuideBanner
            activeExam={activeExam}
            onOpenLogModal={onOpenLogModal}
            onOpenOcrModal={() => onOpenOcrModal("image")}
          />
        </motion.div>
      )}

      {/* 3. SUGGESTION & EXPERIENCE FEEDBACK BANNER */}
      <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
        <ExperienceFeedbackBanner
          activeExam={activeExam}
          attempts={attempts}
          onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
        />
      </motion.div>

      {/* 3. UNOBTRUSIVE CELEBRATION MILESTONE PROMPT (if triggered) */}
      {activeMilestone && (
        <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
          <MilestoneBanner
            milestone={activeMilestone}
            onDismiss={onDismissMilestone || (() => {})}
            onShare={(m) => onOpenScoreCard?.(m.title)}
          />
        </motion.div>
      )}

      {/* 3. QUICK STATS - With Practice Time and Share Progress Action */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="card-luminous rounded-2xl p-3.5 sm:p-4 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
            Quick Stats
          </h2>
          <div className="flex items-center gap-1.5">
            {/* Share Progress Button - Icon Only */}
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                onOpenScoreCard?.();
              }}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center border border-indigo-100 dark:border-indigo-900"
              title="Share Score Card"
              aria-label="Share Score Card"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </button>

            {/* Calendar View Button */}
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                setIsCalendarModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 border border-slate-200/60 dark:border-slate-700"
              title="Open Calendar View"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {/* Total Mocks */}
          <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100/70 dark:border-indigo-800/50 text-center transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              Total Mocks
            </span>
            <span className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-300 block tabular-nums font-display">
              {examAttempts.length}
            </span>
          </div>

          {/* Current Streak */}
          <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/50 text-center transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              Streak
            </span>
            <span className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400 block tabular-nums font-display">
              {streakStats.currentStreak}d
            </span>
          </div>

          {/* Highest Score (Full Mocks) */}
          <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200/60 dark:border-purple-800/50 text-center transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate" title="Excludes sectional and topic tests">
              Highest
            </span>
            <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 block tabular-nums font-display">
              {highestFullMockScore > 0 ? highestFullMockScore : "--"}
            </span>
          </div>

          {/* Average Score (Full Mocks) */}
          <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/50 text-center transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate" title="Excludes sectional and topic tests">
              Avg Score
            </span>
            <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 block tabular-nums font-display">
              {avgFullMockScore > 0 ? avgFullMockScore : "--"}
            </span>
          </div>

          {/* Practice Time */}
          <div className="p-2.5 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-200/60 dark:border-sky-800/50 text-center transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              Practice Time
            </span>
            <span className="text-base sm:text-lg font-black text-sky-600 dark:text-sky-400 block tabular-nums font-display">
              {formatPracticeTime(practiceStats.allTimeMinutes)}
            </span>
          </div>

          {/* Accuracy */}
          <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 text-center transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              Accuracy
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block tabular-nums font-display">
              {overallAccuracy}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. TARGET COMPONENT - Minimized & Perfectly aligned for Mobile View */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="card-luminous rounded-2xl p-3.5 sm:p-4 space-y-3"
      >
        {/* Top Target Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate font-display">
                Target: {targetScore} / {activeExam.totalMarks}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-black border border-indigo-200/70 dark:border-indigo-800 tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>

          {onOpenSetDateModal && (
            <button
              onClick={() => {
                HapticService.lightTap();
                onOpenSetDateModal();
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              Edit Goal
            </button>
          )}
        </div>

        {/* Minimalist Slim Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-[0_0_8px_rgba(99,102,241,0.35)] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(3, progressPercent))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span className="tabular-nums">
              Avg: <strong className="text-slate-700 dark:text-slate-200 font-black">{currentAvgScore}</strong> Marks
            </span>
            <span
              className={`tabular-nums ${
                remainingMarks === 0
                  ? "text-emerald-600 dark:text-emerald-400 font-black"
                  : "text-indigo-600 dark:text-indigo-400 font-black"
              }`}
            >
              {remainingMarks === 0 ? "Target Met! 🎯" : `+${remainingMarks} needed`}
            </span>
          </div>
        </div>

        {/* 4 Clean Micro Metrics Tiles (Single-line, perfectly aligned for mobile) */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-1.5 sm:p-2 bg-blue-50/50 dark:bg-blue-950/25 rounded-xl border border-blue-100/70 dark:border-blue-900/30 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block truncate">
              Baseline
            </span>
            <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 block truncate tabular-nums font-display">
              {examAttempts.length > 0 ? analytics.baselineScore : "--"}
            </span>
          </div>

          <div className="p-1.5 sm:p-2 bg-amber-50/50 dark:bg-amber-950/25 rounded-xl border border-amber-100/70 dark:border-amber-900/30 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block truncate">
              Peak Best
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 block truncate tabular-nums font-display">
              {examAttempts.length > 0 ? analytics.peakScore : "--"}
            </span>
          </div>

          <div className="p-1.5 sm:p-2 bg-indigo-50/50 dark:bg-indigo-950/25 rounded-xl border border-indigo-100/70 dark:border-indigo-900/30 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block truncate">
              Latest
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 block truncate tabular-nums font-display">
              {latestAttempt ? latestAttempt.score : "--"}
            </span>
          </div>

          <div className="p-1.5 sm:p-2 bg-emerald-50/50 dark:bg-emerald-950/25 rounded-xl border border-emerald-100/70 dark:border-emerald-900/30 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block truncate">
              Accuracy
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block truncate tabular-nums font-display">
              {examAttempts.length > 0 ? `${analytics.overallAccuracy}%` : "--"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 4. PERFORMANCE TREND SCORE PROGRESSION LINE CHART (LAST 10 MOCKS) */}
      <motion.div variants={shouldReduceMotion ? undefined : itemVariants} className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Score Progression
          </h3>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
            Last 10 Attempts
          </span>
        </div>
        <PerformanceTrendChart
          attempts={examAttempts}
          baselineScore={analytics.baselineScore}
          totalMarks={activeExam.totalMarks}
          targetScore={targetScore}
        />
      </motion.div>

      {/* 5. RECENT MOCKS LIST */}
      <motion.div variants={shouldReduceMotion ? undefined : itemVariants} className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            {t.recentMocks || "Recent Mocks"}
          </h3>

          <button
            onClick={() => {
              HapticService.lightTap();
              onNavigateTab("history");
            }}
            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewAll || "View All"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="card-luminous rounded-3xl p-6 sm:p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-2xs">
              <Plus className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-black font-display text-slate-900 dark:text-slate-100">
                No mock tests recorded yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mt-1">
                Your test scorecards, sectional marks, and question breakdown will appear here once you log your first mock.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                HapticService.selection();
                onOpenLogModal();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black font-display shadow-md shadow-indigo-600/30 cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Your First Mock</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {recentAttempts.map((attempt) => {
              const platform = PLATFORMS[attempt.platform] || PLATFORMS.offline;
              const pct = attempt.maxMarks > 0 ? Number(((attempt.score / attempt.maxMarks) * 100).toFixed(1)) : 0;

              return (
                <div
                  key={attempt.id}
                  onClick={() => {
                    HapticService.lightTap();
                    onSelectAttempt(attempt);
                  }}
                  className="card-luminous rounded-2xl p-3.5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md cursor-pointer space-y-2.5 group transition-all active:scale-[0.99]"
                >
                  {/* Top Row: Platform + Title + Score */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PlatformLogo platformId={attempt.platform} size="sm" />

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-black text-indigo-600 dark:text-indigo-400">
                            {platform.name}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="font-semibold text-slate-400">{attempt.date}</span>
                        </div>
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {attempt.title}
                        </h4>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-display tabular-nums">
                        {attempt.score}{" "}
                        <span className="text-[11px] text-slate-400 font-semibold font-sans">
                          / {attempt.maxMarks}
                        </span>
                      </div>
                      <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {pct}% Score
                      </div>
                    </div>
                  </div>

                  {/* Concise Stats Pill Row */}
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 font-extrabold">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1 text-[10px] font-black tabular-nums">
                        <span>{attempt.accuracy}% Acc</span>
                      </span>

                      {(attempt.correctCount > 0 || attempt.incorrectCount > 0) && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[10px]">
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">
                            ✓ {attempt.correctCount || 0}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span className="text-rose-600 dark:text-rose-400 font-black">
                            ✕ {attempt.incorrectCount || 0}
                          </span>
                        </span>
                      )}
                    </div>

                    {attempt.percentile !== undefined && attempt.percentile > 0 && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-[10px] font-black">
                        {attempt.percentile}%ile
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Calendar View Modal */}
      <CalendarViewModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        attempts={attempts}
        activeExam={activeExam}
        onSelectAttempt={onSelectAttempt}
      />

      {/* Suggestion & Experience Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        candidateName={candidate.name}
      />
    </motion.div>
  );
};
