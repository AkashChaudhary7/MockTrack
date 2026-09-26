import React, { useState } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, NavTab } from "../types";
import { calculateAnalytics } from "../utils/analytics";
import { calculateStreakStats, calculatePracticeTimeStats, formatPracticeTime } from "../utils/habitUtils";
import { MilestoneEvent } from "../utils/milestones";
import { MilestoneBanner } from "./MilestoneBanner";
import { PLATFORMS } from "../data/platforms";
import { PerformanceTrendChart } from "./PerformanceTrendChart";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
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
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { PlatformLogo } from "./PlatformLogo";
import { HapticService } from "../services/HapticService";
import { CalendarViewModal } from "./CalendarViewModal";
import { FeedbackModal } from "./FeedbackModal";
import { FirstMockGuideBanner } from "./FirstMockGuideBanner";
import { ExamCountdownWidget } from "./ExamCountdownWidget";
import { TargetScoreBanner } from "./TargetScoreBanner";
import { RecentMocksFeedbackSection } from "./RecentMocksFeedbackSection";
import { MockDetailModal } from "./MockDetailModal";
import {
  Doodle3DTarget,
  Doodle3DFlame,
  Doodle3DTrophy,
  Doodle3DStopwatch,
  Doodle3DSparkle,
  Doodle3DShield,
} from "./Doodles3D";
import { MascotSpeechCard } from "./MascotCharacter";
import { DashboardBadges } from "./DashboardBadges";
import { SubjectRadarChart } from "./SubjectRadarChart";
import {
  HqSvgMocksDossier,
  HqSvgStreakFlame,
  HqSvgPeakTrophy,
  HqSvgCompassAverage,
  HqSvgShieldCutoff,
  HqSvgAccuracyDiamond,
} from "./HqSvgGraphics";

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
  onOpenWalkthrough?: () => void;
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
  onOpenWalkthrough,
}) => {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [selectedMockForDetail, setSelectedMockForDetail] = useState<MockAttempt | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [hasSeenAceTips, setHasSeenAceTips] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mocktrack_ace_tips_seen") === "true";
    }
    return false;
  });

  const handleDismissAceTips = () => {
    HapticService.lightTap();
    setHasSeenAceTips(true);
    localStorage.setItem("mocktrack_ace_tips_seen", "true");
  };
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

  // Interactive HQ SVG Quick Stats Configuration with Premium Typography & Microcopy
  const QUICK_STATS_CONFIG = [
    {
      id: "totalMocks",
      label: "Total Mocks",
      sub: "Logged",
      value: `${examAttempts.length}`,
      valClass: "text-indigo-700 dark:text-indigo-300",
      subClass: "bg-indigo-100/70 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50",
      bgClass: "bg-gradient-to-b from-indigo-50/70 to-white dark:from-indigo-950/40 dark:to-slate-900 border-indigo-100/90 dark:border-indigo-900/60",
      icon: <HqSvgMocksDossier size={22} className="shrink-0" />,
      tooltipIcon: <HqSvgMocksDossier size={30} className="shrink-0" />,
      tooltipTitle: "Total Mocks Logged",
      tooltipBadge: "Volume & Stamina",
      tooltipSheen: "from-indigo-500 via-blue-500 to-indigo-600",
      tooltipBadgeClass: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      explanation:
        "Every single test you log matters! Regular mock practice builds real exam stamina, calms natural exam anxiety, and irons out random flukes so your genuine ability shines through.",
      footerCurrent: `Logged: ${examAttempts.length} tests`,
      footerStatus: "Endurance Builder",
      alignMobile: "left" as const,
      alignDesktop: "left" as const,
    },
    {
      id: "streak",
      label: "Streak",
      sub: "Active",
      value: `${streakStats.currentStreak}d`,
      valClass: "text-amber-600 dark:text-amber-400",
      subClass: "bg-amber-100/70 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50",
      bgClass: "bg-gradient-to-b from-amber-50/70 to-white dark:from-amber-950/40 dark:to-slate-900 border-amber-200/80 dark:border-amber-900/60",
      icon: <HqSvgStreakFlame size={22} className="shrink-0" />,
      tooltipIcon: <HqSvgStreakFlame size={30} className="shrink-0" />,
      tooltipTitle: "Daily Practice Streak",
      tooltipBadge: "Momentum Engine",
      tooltipSheen: "from-amber-500 via-orange-500 to-red-500",
      tooltipBadgeClass: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      explanation:
        "Consistency beats sporadic cramming every time! Even 15 minutes of daily practice keeps key formulas, mental shortcuts, and question-spotting instincts lightning fast in your memory.",
      footerCurrent: `${streakStats.currentStreak} Days Running`,
      footerStatus: "Keep The Flame Lit",
      alignMobile: "center" as const,
      alignDesktop: "left" as const,
    },
    {
      id: "highest",
      label: "Highest",
      sub: "Peak Best",
      value: highestFullMockScore > 0 ? `${highestFullMockScore}` : "--",
      valClass: "text-purple-600 dark:text-purple-400",
      subClass: "bg-purple-100/70 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50",
      bgClass: "bg-gradient-to-b from-purple-50/70 to-white dark:from-purple-950/40 dark:to-slate-900 border-purple-200/80 dark:border-purple-900/60",
      icon: <HqSvgPeakTrophy size={22} className="shrink-0" />,
      tooltipIcon: <HqSvgPeakTrophy size={30} className="shrink-0" />,
      tooltipTitle: "Peak Best Score",
      tooltipBadge: "Personal Best (PB)",
      tooltipSheen: "from-purple-500 via-indigo-500 to-pink-500",
      tooltipBadgeClass: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      explanation:
        "Your highest score across full-length mocks! This is tangible proof of what you can accomplish on your finest day. Your ongoing roadmap is turning this peak score into your everyday normal.",
      footerCurrent: `Peak: ${highestFullMockScore > 0 ? highestFullMockScore : "--"} marks`,
      footerStatus: "Capability Proof",
      alignMobile: "right" as const,
      alignDesktop: "center" as const,
    },
    {
      id: "avgScore",
      label: "Avg Score",
      sub: "Overall",
      value: avgFullMockScore > 0 ? `${avgFullMockScore}` : "--",
      valClass: "text-blue-600 dark:text-blue-400",
      subClass: "bg-blue-100/70 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50",
      bgClass: "bg-gradient-to-b from-blue-50/70 to-white dark:from-blue-950/40 dark:to-slate-900 border-blue-200/80 dark:border-blue-900/60",
      icon: <HqSvgCompassAverage size={22} className="shrink-0" />,
      tooltipIcon: <HqSvgCompassAverage size={30} className="shrink-0" />,
      tooltipTitle: "Operational Average",
      tooltipBadge: "Dependable Base",
      tooltipSheen: "from-blue-500 via-cyan-500 to-indigo-500",
      tooltipBadgeClass: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      explanation:
        "Your dependable operational benchmark across full mocks. Tracking your mean score gives you real peace of mind and calm expectations before walking into the actual exam hall.",
      footerCurrent: `Mean: ${avgFullMockScore > 0 ? avgFullMockScore : "--"} / ${activeExam.totalMarks}`,
      footerStatus: "Core Confidence",
      alignMobile: "left" as const,
      alignDesktop: "center" as const,
    },
    {
      id: "cutoffOdds",
      label: "Cutoff Odds",
      sub: cutoffProbability >= 85 ? "High Safety" : cutoffProbability >= 70 ? "Promising" : "Developing",
      value: examAttempts.length > 0 ? `${cutoffProbability}%` : "--",
      valClass: "text-emerald-600 dark:text-emerald-400",
      subClass: "bg-emerald-100/70 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50",
      bgClass: "bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/40 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-900/60",
      icon: <HqSvgShieldCutoff size={22} className="shrink-0" />,
      tooltipIcon: <HqSvgShieldCutoff size={30} className="shrink-0" />,
      tooltipTitle: "Cutoff Probability",
      tooltipBadge: "Readiness Safety Gauge",
      tooltipSheen: "from-emerald-500 via-teal-500 to-emerald-600",
      tooltipBadgeClass: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      explanation:
        "Our friendly readiness forecast! We evaluate your average score and consistency against historical exam cutoffs to calculate how safely positioned you are to clear the exam threshold.",
      footerCurrent: `Odds: ${examAttempts.length > 0 ? `${cutoffProbability}%` : "--"}`,
      footerStatus: cutoffProbability >= 85 ? "High Safety Margin" : cutoffProbability >= 70 ? "Promising Range" : "Developing",
      alignMobile: "center" as const,
      alignDesktop: "right" as const,
    },
    {
      id: "accuracy",
      label: "Accuracy",
      sub: "Precision",
      value: `${overallAccuracy}%`,
      valClass: "text-teal-600 dark:text-teal-400",
      subClass: "bg-teal-100/70 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50",
      bgClass: "bg-gradient-to-b from-teal-50/70 to-white dark:from-teal-950/40 dark:to-slate-900 border-teal-200/80 dark:border-teal-900/60",
      icon: <HqSvgAccuracyDiamond size={22} className="shrink-0" />,
      tooltipIcon: <HqSvgAccuracyDiamond size={30} className="shrink-0" />,
      tooltipTitle: "Strike Accuracy",
      tooltipBadge: "Penalty Shield",
      tooltipSheen: "from-teal-500 via-emerald-500 to-green-600",
      tooltipBadgeClass: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      explanation:
        "Your precision strike rate! In competitive tests with negative penalties, strong accuracy acts as your armor—it protects your hard-earned points from being drained by hasty guesses.",
      footerCurrent: `Strike Rate: ${overallAccuracy}%`,
      footerStatus: "Negative Penalty Shield",
      alignMobile: "right" as const,
      alignDesktop: "right" as const,
    },
  ];

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
      {/* 1. HEADER & GREETING - Single-line guaranteed User Name with Italic Aspirant Name */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="flex items-center justify-between gap-2.5 pt-1"
      >
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-extrabold text-indigo-600/80 dark:text-indigo-400/90 uppercase tracking-wider block truncate font-display">
            {dateStr}
          </span>
          {/* Aspirant Name in Italic with Premium Gradient Display Style */}
          <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight truncate whitespace-nowrap leading-tight">
            Hi, <span className="italic font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-300 tracking-normal">{candidate.name}</span> 👋
          </h1>
        </div>

        {/* Exam Picker without Log Mock button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onOpenProfileSwitcher();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-95"
            title="Switch Active Exam"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none font-bold">
              {activeExam.shortCode || activeExam.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </div>
      </motion.div>

      {/* 1.5. MASCOT CARTOON MENTOR EXPLAINING CARD (Dismissed once seen) */}
      {!hasSeenAceTips && (
        <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
          <MascotSpeechCard
            pose={examAttempts.length === 0 ? "explaining" : "target"}
            title={examAttempts.length === 0 ? "Meet Ace, Your Exam Mentor!" : `Aspirant Focus: ${activeExam.shortCode || activeExam.name}`}
            message={
              examAttempts.length === 0
                ? `Ready to master your ${activeExam.shortCode || activeExam.name} prep? Take the 1-minute visual app tour to see how to log mocks, isolate weaknesses, and beat cutoffs!`
                : `Your goal is ${targetScore}/${activeExam.totalMarks}. Maintain accuracy above 85% to protect your hard-earned points from negative penalties!`
            }
            badge="Ace Tips"
            actionText={onOpenWalkthrough ? "Take 1-Min Visual Tour" : undefined}
            onAction={() => {
              handleDismissAceTips();
              onOpenWalkthrough?.();
            }}
            onDismiss={handleDismissAceTips}
          />
        </motion.div>
      )}

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

      {/* 3.5. COMPACT EXAM COUNTDOWN WIDGET */}
      <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
        <ExamCountdownWidget
          activeExam={activeExam}
          onOpenSetDateModal={onOpenSetDateModal}
        />
      </motion.div>

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
            {/* 3D Tooltip Hint */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60">
              <HelpCircle className="w-3 h-3" />
              <span>Hover cards for 3D breakdown</span>
            </span>

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

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative">
          {QUICK_STATS_CONFIG.map((stat) => {
            const isHovered = activeTooltip === stat.id;
            return (
              <div
                key={stat.id}
                className="relative"
                onMouseEnter={() => {
                  setActiveTooltip(stat.id);
                  HapticService.selection();
                }}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {/* 3D-Styled Popover Tooltip with Human-Touch Tone */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.94 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className={`absolute z-40 bottom-full mb-2.5 w-64 sm:w-72 pointer-events-none select-none ${
                        stat.alignMobile === "left"
                          ? "left-0"
                          : stat.alignMobile === "center"
                          ? "left-1/2 -translate-x-1/2"
                          : "right-0"
                      } ${
                        stat.alignDesktop === "left"
                          ? "sm:left-0 sm:right-auto sm:translate-x-0"
                          : stat.alignDesktop === "center"
                          ? "sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
                          : "sm:left-auto sm:right-0 sm:translate-x-0"
                      }`}
                    >
                      <div className="p-3.5 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-2xl border-2 border-indigo-200/90 dark:border-indigo-800/80 shadow-2xl shadow-indigo-950/20 dark:shadow-black/70 text-left">
                        <div className={`h-1 w-full bg-gradient-to-r ${stat.tooltipSheen} rounded-full mb-2.5`} />
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-2">
                            {stat.tooltipIcon || stat.icon}
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-display">
                              {stat.tooltipTitle}
                            </span>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${stat.tooltipBadgeClass}`}>
                            {stat.tooltipBadge}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                          {stat.explanation}
                        </p>
                        <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
                          <span>{stat.footerCurrent}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{stat.footerStatus}</span>
                        </div>
                      </div>
                      {/* Downward Caret Arrow */}
                      <div
                        className={`w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-indigo-200/90 dark:border-indigo-800/80 rotate-45 -mt-1.5 ${
                          stat.alignMobile === "left"
                            ? "ml-7 mr-auto"
                            : stat.alignMobile === "center"
                            ? "mx-auto"
                            : "mr-7 ml-auto"
                        } ${
                          stat.alignDesktop === "left"
                            ? "sm:ml-7 sm:mr-auto"
                            : stat.alignDesktop === "center"
                            ? "sm:mx-auto"
                            : "sm:mr-7 sm:ml-auto"
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card Item */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTooltip(isHovered ? null : stat.id);
                    HapticService.selection();
                  }}
                  className={`group w-full p-2.5 sm:p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col justify-between items-center relative overflow-hidden backdrop-blur-xs shadow-2xs hover:shadow-md ${stat.bgClass} ${
                    isHovered
                      ? "ring-2 ring-indigo-500 scale-[1.03] shadow-md shadow-indigo-500/15"
                      : "hover:scale-[1.02] hover:-translate-y-0.5"
                  }`}
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 block truncate font-display text-left">
                      {stat.label}
                    </span>
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {stat.icon}
                    </div>
                  </div>
                  <span className={`text-base sm:text-lg font-black block tabular-nums font-stylish my-1 tracking-tight ${stat.valClass}`}>
                    {stat.value}
                  </span>
                  <span className={`text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md truncate max-w-full font-mono ${stat.subClass}`}>
                    {stat.sub}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 3.5. VISUAL BADGES COMPONENT - Showcase unlocked achievements */}
      <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
        <DashboardBadges attempts={attempts} activeExam={activeExam} />
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

      {/* 4.5. RECHARTS RADAR CHART - Subject Mastery & Weak Area Detection */}
      {examAttempts.length > 0 && (
        <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
          <SubjectRadarChart
            metrics={analytics.subjectBreakdown.map((sb) => ({
              name: sb.name,
              scoreAvg: sb.scoreAvg,
              maxAvg: sb.maxAvg,
              percentage: sb.percentage,
              accuracy: Math.round(sb.percentage * 0.95),
              status: sb.status,
              colorClass: sb.colorClass,
            }))}
            title="Subject Performance Radar"
            subtitle="Identify strengths and pinpoint weak areas across subjects at a glance"
          />
        </motion.div>
      )}

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
