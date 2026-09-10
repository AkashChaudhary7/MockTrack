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
import { FeedbackModal } from "./FeedbackModal";
import { FirstMockGuideBanner } from "./FirstMockGuideBanner";
import { TargetScoreBanner } from "./TargetScoreBanner";
import { RecentMocksFeedbackSection } from "./RecentMocksFeedbackSection";
import { MockDetailModal } from "./MockDetailModal";
import {
  Doodle3DFlame,
  Doodle3DTrophy,
  Doodle3DStopwatch,
  Doodle3DSparkle,
  Doodle3DShield,
} from "./Doodles3D";

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
  const [selectedMockForDetail, setSelectedMockForDetail] = useState<MockAttempt | null>(null);
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

  // Cutoff Probability calculation
  const cutoffTarget = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.7);
  const cutoffProbability = examAttempts.length > 0 && cutoffTarget > 0
    ? Math.min(99, Math.max(20, Math.round(((analytics.baselineScore || currentAvgScore) / cutoffTarget) * 88)))
    : 0;

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

      {/* 4. TARGET SCORE - Clean Animated Banner (just above Quick Stats, keep only target) */}
      <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
        <TargetScoreBanner
          activeExam={activeExam}
          attempts={examAttempts}
          avgFullMockScore={avgFullMockScore}
          latestAttempt={latestAttempt}
        />
      </motion.div>

      {/* 5. QUICK STATS - With Practice Time, Micro 3D Doodles & Tactile Cards */}
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
          <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100/70 dark:border-indigo-800/50 text-center transition-all hover:scale-[1.02] flex flex-col justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              Total Mocks
            </span>
            <span className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-300 block tabular-nums font-display my-0.5">
              {examAttempts.length}
            </span>
            <span className="text-[9px] text-indigo-500/80 font-bold uppercase tracking-wider">Logged</span>
          </div>

          {/* Current Streak with 3D Flame Doodle */}
          <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/50 text-center transition-all hover:scale-[1.02] flex flex-col justify-between items-center relative overflow-hidden group">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                Streak
              </span>
              <Doodle3DFlame size={14} className="shrink-0 transition-transform group-hover:scale-125" />
            </div>
            <span className="text-base sm:text-lg font-black text-amber-500 dark:text-amber-400 block tabular-nums font-display my-0.5">
              {streakStats.currentStreak}d
            </span>
            <span className="text-[9px] text-amber-600/80 dark:text-amber-400/80 font-bold">Active</span>
          </div>

          {/* Highest Score with 3D Trophy Doodle */}
          <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200/60 dark:border-purple-800/50 text-center transition-all hover:scale-[1.02] flex flex-col justify-between items-center relative overflow-hidden group" title="Excludes sectional and topic tests">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                Highest
              </span>
              <Doodle3DTrophy size={14} className="shrink-0 transition-transform group-hover:scale-125" />
            </div>
            <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 block tabular-nums font-display my-0.5">
              {highestFullMockScore > 0 ? highestFullMockScore : "--"}
            </span>
            <span className="text-[9px] text-purple-500/80 font-bold">Peak Best</span>
          </div>

          {/* Average Score (Full Mocks) */}
          <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/50 text-center transition-all hover:scale-[1.02] flex flex-col justify-between items-center" title="Excludes sectional and topic tests">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
              Avg Score
            </span>
            <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 block tabular-nums font-display my-0.5">
              {avgFullMockScore > 0 ? avgFullMockScore : "--"}
            </span>
            <span className="text-[9px] text-blue-500/80 font-bold">Overall</span>
          </div>

          {/* Cutoff Probability with 3D Shield Doodle */}
          <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 text-center transition-all hover:scale-[1.02] flex flex-col justify-between items-center group">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                Cutoff Odds
              </span>
              <Doodle3DShield size={14} className="shrink-0 transition-transform group-hover:scale-125" />
            </div>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block tabular-nums font-display my-0.5">
              {examAttempts.length > 0 ? `${cutoffProbability}%` : "--"}
            </span>
            <span className="text-[9px] text-emerald-500/80 font-bold">
              {cutoffProbability >= 85 ? "High Safety" : cutoffProbability >= 70 ? "Promising" : "Developing"}
            </span>
          </div>

          {/* Accuracy with 3D Sparkle */}
          <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 text-center transition-all hover:scale-[1.02] flex flex-col justify-between items-center group">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                Accuracy
              </span>
              <Doodle3DSparkle size={12} className="shrink-0 transition-transform group-hover:scale-125" />
            </div>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block tabular-nums font-display my-0.5">
              {overallAccuracy}%
            </span>
            <span className="text-[9px] text-emerald-500/80 font-bold">Precision</span>
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
                    setSelectedMockForDetail(attempt);
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

                    {/* Score (Raw marks without percentage) */}
                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-display tabular-nums">
                        {attempt.score}{" "}
                        <span className="text-[11px] text-slate-400 font-semibold font-sans">
                          / {attempt.maxMarks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Concise Stats Pill Row + Small & Beautiful "View Details" button */}
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

                      {attempt.percentile !== undefined && attempt.percentile > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-[10px] font-black">
                          {attempt.percentile}%ile
                        </span>
                      )}
                    </div>

                    {/* Small and Beautiful "View Details" trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        HapticService.selection();
                        setSelectedMockForDetail(attempt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 text-[10px] font-black flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 6. COMMUNITY FEEDBACK & APP SUGGESTIONS (Direct to mobographie@gmail.com) */}
      <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
        <RecentMocksFeedbackSection
          activeExam={activeExam}
          candidateName={candidate.name}
          onOpenInAppModal={() => setIsFeedbackModalOpen(true)}
        />
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

      {/* Mock Detail Pop-Up Mode with Candidate Name, Share & Edit */}
      <MockDetailModal
        isOpen={!!selectedMockForDetail}
        onClose={() => setSelectedMockForDetail(null)}
        mock={selectedMockForDetail}
        candidate={candidate}
        activeExam={activeExam}
        onEditMock={(mock) => {
          setSelectedMockForDetail(null);
          onSelectAttempt(mock);
        }}
      />
    </motion.div>
  );
};
