import React, { useState } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, NavTab } from "../types";
import { calculateAnalytics } from "../utils/analytics";
import { PLATFORMS } from "../data/platforms";
import { PerformanceTrendChart } from "./PerformanceTrendChart";
import { motion, useReducedMotion } from "motion/react";
import {
  Target,
  Plus,
  Camera,
  Link as LinkIcon,
  Sparkles,
  Percent,
  HelpCircle,
  ArrowRight,
  Download,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { PlatformLogo } from "./PlatformLogo";
import { generateBilingualReportHTML } from "../utils/pdfExport";

interface DashboardScreenProps {
  candidate: CandidateProfile;
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onOpenLogModal: () => void;
  onOpenOcrModal: (tab: "image" | "link") => void;
  onNavigateTab: (tab: NavTab) => void;
  onSelectAttempt: (attempt: MockAttempt) => void;
  onOpenProfileSwitcher: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
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
}) => {
  const { t, effectiveLang } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const analytics = calculateAnalytics(attempts, activeExam);
  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);

  const sortedAttempts = [...examAttempts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentAttempts = sortedAttempts.slice(0, 4);
  const latestAttempt = sortedAttempts[0];

  const [showConsistencyInfo, setShowConsistencyInfo] = useState(false);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t.goodMorning : hour < 17 ? t.goodAfternoon : t.goodEvening;

  // Calculate consistency index (0 - 100 based on standard deviation)
  let consistencyScore = 82;
  if (examAttempts.length >= 2) {
    const scores = examAttempts.map((a) => a.score);
    const mean = analytics.averageScore;
    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation = higher consistency score
    consistencyScore = Math.max(
      30,
      Math.min(98, Math.round(100 - (stdDev / activeExam.totalMarks) * 200))
    );
  }

  // Typical Score Range calculation
  let typicalRangeMin = Math.max(0, Math.round(analytics.averageScore - 8));
  let typicalRangeMax = Math.min(
    activeExam.totalMarks,
    Math.round(analytics.averageScore + 8)
  );

  // Determine Performance Zone: Above Baseline, Near Baseline, Below Baseline
  let performanceZone = t.nearBaseline;
  let zoneColor = "bg-amber-500 text-slate-950";
  let zoneSymbol = "🟡";

  if (latestAttempt) {
    if (latestAttempt.score > analytics.baselineScore + 3) {
      performanceZone = t.aboveBaseline;
      zoneColor = "bg-emerald-500 text-white";
      zoneSymbol = "🟢";
    } else if (latestAttempt.score < analytics.baselineScore - 5) {
      performanceZone = t.belowBaseline;
      zoneColor = "bg-red-500 text-white";
      zoneSymbol = "🔴";
    }
  }

  // Top weak area from logged data or default
  const allWeakAreas = examAttempts.flatMap((a) => a.weakAreas || []);
  const topWeakArea =
    allWeakAreas.length > 0 ? allWeakAreas[0] : "Geometry & Quant Speed";

  // Next Action Recommendation
  let nextAction = "Take one full mock to refresh baseline rating";
  if (examAttempts.length === 0) {
    nextAction = "Log your first mock to unlock personalized recommendations";
  } else if (analytics.overallAccuracy < 78) {
    nextAction = "Focus on reducing calculation errors & wild guesses";
  } else if (allWeakAreas.length > 0) {
    nextAction = `🔴 Revise ${allWeakAreas[0]}`;
  } else {
    nextAction = "🎯 Take one full mock under timed exam conditions";
  }

  const handleDownloadPDF = () => {
    const htmlStr = generateBilingualReportHTML(candidate, activeExam, attempts);
    const blob = new Blob([htmlStr], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.focus();
    }
  };

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-24"
    >
      {/* 1. HEADER & CANDIDATE GREETING */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Hi, {candidate.name} 👋
          </h1>

          {/* Active Exam Selector Button */}
          <button
            onClick={onOpenProfileSwitcher}
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{activeExam.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          </button>
        </div>
      </motion.div>

      {/* 2. PRIMARY CTA CARD: + LOG TODAY'S MOCK */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="relative overflow-hidden glass-box bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 dark:from-violet-900 dark:via-indigo-950 dark:to-slate-900 text-white p-5 sm:p-6 shadow-xl shadow-indigo-600/20 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold text-indigo-100 border border-white/20">
                ⚡ {t.recordIn10Sec}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black border border-amber-400/30 shadow-amber-glow">
                🪙 +25 Coins Reward
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.logTodaysMock}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-normal">
              Record score, accuracy &amp; negative marks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={onOpenLogModal}
              className="btn-3d-push px-6 py-3.5 bg-indigo-600 dark:bg-violet-600 border-b-4 border-indigo-900 dark:border-violet-950 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 active:border-b-0 active:translate-y-[4px] hover:brightness-110 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[3]" />
              <span>{t.logTodaysMock}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenOcrModal("image")}
                className="py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>📸 Scan</span>
              </button>

              <button
                onClick={() => onOpenOcrModal("link")}
                className="py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-teal-300" />
                <span>🔗 Link</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. CURRENT PERFORMANCE SUMMARY (4 Cards Grid) */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="space-y-2"
      >
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          {t.currentPerformance}
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Average Score */}
          <div className="rounded-3xl p-4 card-bevel-3d">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              {t.averageScore}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {analytics.averageScore} <span className="text-xs font-bold text-slate-400">/ {activeExam.totalMarks}</span>
            </div>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              Baseline: {analytics.baselineScore}
            </p>
          </div>

          {/* Best Score */}
          <div className="rounded-3xl p-4 card-bevel-3d">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              {t.bestScore}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {analytics.peakScore} <span className="text-xs font-bold text-slate-400">Marks</span>
            </div>
            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
              Personal Best 🏆
            </p>
          </div>

          {/* Latest Score */}
          <div className="rounded-3xl p-4 card-bevel-3d">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              {t.latestScore}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {latestAttempt ? latestAttempt.score : 0} <span className="text-xs font-bold text-slate-400">Marks</span>
            </div>
            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1 truncate">
              {latestAttempt ? latestAttempt.date : "No test logged"}
            </p>
          </div>

          {/* Overall Accuracy */}
          <div className="rounded-3xl p-4 card-bevel-3d">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              {t.overallAccuracy}
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {analytics.overallAccuracy}%
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              Penalty: -{analytics.totalNegativeMarksLost}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4. LAST 7 DAYS TREND CHART */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="space-y-2"
      >
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          {t.last7Days}
        </h3>
        <PerformanceTrendChart
          attempts={examAttempts}
          baselineScore={analytics.baselineScore}
          totalMarks={activeExam.totalMarks}
        />
      </motion.div>

      {/* 5. YOUR CURRENT STATE CARD (COMPACT & INFORMATION DENSE) */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="rounded-2xl p-3 card-bevel-3d space-y-2"
      >
        {/* Header line with badge & consistency */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.yourCurrentState}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
              {analytics.archetype.badge}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              {t.consistencyScore}:
            </span>
            <span className="font-black text-indigo-600 dark:text-indigo-400">
              {consistencyScore}/100
            </span>
            <button
              onClick={() => setShowConsistencyInfo(true)}
              className="text-slate-400 hover:text-indigo-500 cursor-pointer p-0.5"
              title="Consistency info"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimalist 4-Column Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {/* Performance Zone */}
          <div className="p-1.5 sm:p-2 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none mb-0.5">
              {t.performanceZone}
            </span>
            <div className="flex items-center gap-1 font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
              <span>{zoneSymbol}</span>
              <span className="truncate">{performanceZone}</span>
            </div>
          </div>

          {/* Weak Area */}
          <div className="p-1.5 sm:p-2 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none mb-0.5">
              {t.weakArea}
            </span>
            <div className="font-extrabold text-xs text-red-600 dark:text-red-400 truncate">
              🔴 {topWeakArea}
            </div>
          </div>

          {/* Typical Range */}
          <div className="p-1.5 sm:p-2 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none mb-0.5">
              {t.typicalScoreRange}
            </span>
            <div className="font-extrabold text-xs text-teal-600 dark:text-teal-400 truncate">
              {typicalRangeMin} - {typicalRangeMax} {t.marks}
            </div>
          </div>

          {/* Next Action */}
          <div className="p-1.5 sm:p-2 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none mb-0.5">
              {t.nextAction}
            </span>
            <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 truncate">
              {nextAction}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. RECENT MOCKS LIST */}
      <motion.div
        variants={shouldReduceMotion ? undefined : itemVariants}
        className="space-y-3"
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.recentMocks}
          </h3>

          <button
            onClick={() => onNavigateTab("history")}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center text-slate-500 text-xs font-medium">
            No test scores recorded yet. Tap &quot;+ LOG TODAY&apos;S MOCK&quot; above to log your first result!
          </div>
        ) : (
          <div className="grid gap-3">
            {recentAttempts.map((attempt) => {
              const platform = PLATFORMS[attempt.platform] || PLATFORMS.offline;
              const pct = attempt.maxMarks > 0 ? Number(((attempt.score / attempt.maxMarks) * 100).toFixed(1)) : 0;

              return (
                <div
                  key={attempt.id}
                  onClick={() => onSelectAttempt(attempt)}
                  className="rounded-2xl p-4 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer card-bevel-3d space-y-3 group transition-all"
                >
                  {/* Top Row: Platform info + Title + Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <PlatformLogo platformId={attempt.platform} size="md" />

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                            {platform.name}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {attempt.testType}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[11px] font-medium text-slate-400">{attempt.date}</span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {attempt.title}
                        </h4>
                      </div>
                    </div>

                    {/* Primary Score */}
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900 dark:text-slate-100">
                        {attempt.score} <span className="text-xs text-slate-400 font-semibold">/ {attempt.maxMarks}</span>
                      </div>
                      <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        {pct}% Score
                      </div>
                    </div>
                  </div>

                  {/* PStats (Performance Statistics) Badges Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
                      {/* Accuracy */}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                        🎯 {attempt.accuracy}% Acc.
                      </span>

                      {/* Correct / Incorrect breakdown */}
                      {(attempt.correctCount > 0 || attempt.incorrectCount > 0) && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">✓ {attempt.correctCount || 0}</span>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span className="text-rose-600 dark:text-rose-400 font-black">✕ {attempt.incorrectCount || 0}</span>
                        </span>
                      )}

                      {/* Percentile */}
                      {attempt.percentile !== undefined && attempt.percentile > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1">
                          <Percent className="w-3 h-3 text-indigo-500" />
                          {attempt.percentile} %ile
                        </span>
                      )}

                      {/* Rank */}
                      {attempt.rank !== undefined && attempt.rank > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                          🏆 Rank #{attempt.rank}
                        </span>
                      )}

                      {/* Negative Penalty */}
                      {attempt.negativePenalty > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px]">
                          -{attempt.negativePenalty} penalty
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      View PStats →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Consistency Modal */}
      {showConsistencyInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {t.consistencyExplanationTitle}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.consistencyExplanationText}
            </p>
            <button
              onClick={() => setShowConsistencyInfo(false)}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-2xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
