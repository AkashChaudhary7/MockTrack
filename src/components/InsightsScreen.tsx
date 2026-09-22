import React, { useState } from "react";
import { MockAttempt, ExamProfile } from "../types";
import { calculateAnalytics } from "../utils/analytics";
import { SubjectRadarChart } from "./SubjectRadarChart";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Sparkles,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
  Compass,
  Lightbulb,
  FileText,
} from "lucide-react";
import { EmptyState } from "./EmptyState";
import { HapticService } from "../services/HapticService";
import { CandidateProfile } from "../types";
import { downloadBilingualReportPDF } from "../utils/pdfExport";
import { TargetScoreComparisonChart } from "./TargetScoreComparisonChart";

interface InsightsScreenProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  candidate?: CandidateProfile;
  onUpdateExamProfile?: (updatedProfile: ExamProfile) => void;
}

interface SubjectInsightData {
  name: string;
  scoreAvg: number;
  maxAvg: number;
  percentage: number;
  accuracy: number;
  estimatedPenalty: number;
  trend: "improving" | "stable" | "declining";
  status: "Mastered" | "Solid" | "Needs Attention";
  badgeClass: string;
  barGradient: string;
  keyTopics: string[];
  tacticalAdvice: string;
  timeAllocationAdvice: string;
  recentScores: number[];
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  activeExam,
  attempts,
  candidate = {
    name: "Aspirant",
    avatarSeed: "AS",
    activeExamProfileId: "",
    theme: "system" as const,
    showSplashOnStartup: false,
  },
  onUpdateExamProfile,
}) => {
  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);
  const analytics = calculateAnalytics(attempts, activeExam);

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedFilterSubject, setSelectedFilterSubject] = useState<string>("all");
  const [isSubjectInsightsExpanded, setIsSubjectInsightsExpanded] = useState<boolean>(false);

  if (examAttempts.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Insights &amp; Analytics</span>
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5 font-display">
            {activeExam.name} ({activeExam.shortCode})
          </p>
        </div>

        <EmptyState
          type="analytics"
          title="No Analytics Available Yet"
          description="Log at least 1 mock test score to unlock radar charts, baseline rating, subject breakdown, and AI insights."
        />
      </div>
    );
  }

  // Generate Subject-Wise Detailed Insights
  const sortedAttempts = [...examAttempts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const defaultSubjectTopics: Record<
    string,
    { keyTopics: string[]; tacticalAdvice: string; timeAdvice: string }
  > = {
    "Quantitative Aptitude": {
      keyTopics: ["Mensuration 2D/3D Formulas", "CI & SI Differences", "Algebra Factorization", "Data Interpretation Speed"],
      tacticalAdvice: "Skip lengthy calculation-heavy geometry problems in round 1. Solve Arithmetic and DI first to lock in 35+ marks under 20 minutes.",
      timeAdvice: "Dedicate 35 mins daily to timed 25-question sectional mock drills.",
    },
    "Reasoning Ability": {
      keyTopics: ["Circular & Linear Seating (2-Case Method)", "Syllogism Venn Diagrams", "Number & Letter Series", "Blood Relations"],
      tacticalAdvice: "Your accuracy here directly drives cut-off clearance. Always draw dual parallel cases for complex seating puzzles to avoid restarts.",
      timeAdvice: "Dedicate 25 mins daily to sectional puzzle solving.",
    },
    "English Comprehension": {
      keyTopics: ["Reading Comprehension Inference", "High-Yield Idioms & Phrases", "Grammar: Subject-Verb Agreement", "Cloze Test Context Clues"],
      tacticalAdvice: "Attempt Vocab and Error Detection first (under 4 minutes), then invest remaining 6-8 minutes on Reading Comprehension.",
      timeAdvice: "Read 2 editorial articles daily and review 15 previous year idioms.",
    },
    "General Awareness": {
      keyTopics: ["Static Polity: Articles & Amendments", "Modern Indian History Milestones", "Last 6 Months Current Affairs", "General Science Basics"],
      tacticalAdvice: "Negative marking is most dangerous in GA. Only attempt questions where you have eliminated at least 2 options (50-50 odds). Never wild-guess.",
      timeAdvice: "Spend 20 mins daily on monthly current affairs revisions.",
    },
  };

  const subjectInsights: SubjectInsightData[] = analytics.subjectBreakdown.map((sb) => {
    // Determine subject historical attempts
    const subjectScores: number[] = [];
    sortedAttempts.forEach((att) => {
      const matchSec = att.sections?.find((s) => s.name.toLowerCase() === sb.name.toLowerCase());
      if (matchSec) {
        subjectScores.push(matchSec.score);
      } else {
        // Estimate based on overall percentage if not itemized
        subjectScores.push(Math.round(sb.scoreAvg));
      }
    });

    const recent3 = subjectScores.slice(0, 3);
    let trend: "improving" | "stable" | "declining" = "stable";
    if (recent3.length >= 2) {
      if (recent3[0] > recent3[1] + 1.5) trend = "improving";
      else if (recent3[0] < recent3[1] - 1.5) trend = "declining";
    }

    let status: "Mastered" | "Solid" | "Needs Attention" = "Solid";
    let badgeClass = "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    let barGradient = "bg-gradient-to-r from-amber-500 to-amber-400";

    if (sb.percentage >= 80) {
      status = "Mastered";
      badgeClass = "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      barGradient = "bg-gradient-to-r from-emerald-500 to-teal-400";
    } else if (sb.percentage < 65) {
      status = "Needs Attention";
      badgeClass = "bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      barGradient = "bg-gradient-to-r from-rose-500 to-red-400";
    }

    const accuracy = Math.min(99, Math.max(50, Math.round(sb.percentage * 0.95)));
    const estimatedPenalty = Number((((100 - accuracy) / 100) * (sb.maxAvg * 0.15) * activeExam.negativeMarkingRatio).toFixed(1));

    const meta = defaultSubjectTopics[sb.name] || {
      keyTopics: ["Key High-Frequency Formulas", "Previous Year Question Patterns", "Speed Drill Practice"],
      tacticalAdvice: `Focus on accuracy and rapid question filtering to boost your ${sb.name} sectional percentile.`,
      timeAdvice: "Allocate 25 mins daily to sectional question sets.",
    };

    return {
      name: sb.name,
      scoreAvg: sb.scoreAvg,
      maxAvg: sb.maxAvg,
      percentage: sb.percentage,
      accuracy,
      estimatedPenalty,
      trend,
      status,
      badgeClass,
      barGradient,
      keyTopics: meta.keyTopics,
      tacticalAdvice: meta.tacticalAdvice,
      timeAllocationAdvice: meta.timeAdvice,
      recentScores: subjectScores.slice(0, 5),
    };
  });

  const filteredSubjectInsights =
    selectedFilterSubject === "all"
      ? subjectInsights
      : subjectInsights.filter((s) => s.name === selectedFilterSubject);

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto">
      {/* Title Header with PDF Export Icon */}
      <div className="pt-1 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Insights &amp; Analytics</span>
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Performance Engine &amp; Subject Mastery for {activeExam.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            HapticService.achievement();
            downloadBilingualReportPDF(candidate, activeExam, examAttempts);
          }}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all shrink-0"
          title="Export Full PDF Report"
        >
          <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* A. Personal Baseline Card (Cleaned: Cutoff probability removed) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Personal Baseline Engine
            </span>

            {/* Status Indicator Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                analytics.baselineTrend === "peak"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : analytics.baselineTrend === "dip"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {analytics.baselineTrend === "peak" && "📈 Peak Trend"}
              {analytics.baselineTrend === "stable" && "⚖️ Stable Baseline"}
              {analytics.baselineTrend === "dip" && "⚠️ Performance Dip"}
            </span>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight tabular-nums">
              {analytics.baselineScore}{" "}
              <span className="text-lg font-bold text-indigo-300 font-sans">
                / {activeExam.totalMarks} Marks
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1.5">
              Weighted moving average baseline across {examAttempts.length} logged mocks.
            </p>
          </div>
        </div>
      </div>

      {/* Target Score vs. Recent Mocks Visual Comparison Chart */}
      <TargetScoreComparisonChart
        attempts={examAttempts}
        activeExam={activeExam}
        onUpdateExamProfile={onUpdateExamProfile}
      />

      {/* Performance Strategy & Recommendation */}
      <div className="card-luminous rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black font-display text-slate-900 dark:text-slate-100">
              Diagnostic Performance Strategy
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${analytics.performanceInsight.badgeColor}`}>
            {analytics.performanceInsight.badgeText}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <h4 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-slate-100">
            {analytics.performanceInsight.headline}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {analytics.performanceInsight.description}
          </p>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold shrink-0">💡 Strategy:</span>
            <span>{analytics.performanceInsight.recommendation}</span>
          </div>
        </div>
      </div>

      {/* Avoidable Marks Lost Callout Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-5 shadow-xs flex items-start gap-4">
        <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
            Negative Marking Penalty Analysis
          </h3>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
            {analytics.avoidableMarksRecommendation}
          </p>
        </div>
      </div>

      {/* 5. SUBJECT-WISE DEEP INSIGHTS (Collapsible dropdown) */}
      <div className="card-luminous rounded-3xl p-4 sm:p-5 space-y-4">
        {/* Header with Collapsible Toggle */}
        <div
          onClick={() => {
            HapticService.lightTap();
            setIsSubjectInsightsExpanded(!isSubjectInsightsExpanded);
          }}
          className="flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
                <span>Subject-Wise Deep Insights</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {subjectInsights.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                {isSubjectInsightsExpanded
                  ? "Sectional mastery, accuracy, error penalties & revision tactics"
                  : "Tap to expand sectional breakdown and revision blueprints"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shrink-0"
          >
            <span>{isSubjectInsightsExpanded ? "Collapse" : "Expand"}</span>
            {isSubjectInsightsExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Compact Summary Strip (when collapsed) */}
        {!isSubjectInsightsExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {subjectInsights.map((subj) => (
              <div
                key={subj.name}
                onClick={(e) => {
                  e.stopPropagation();
                  HapticService.lightTap();
                  setSelectedFilterSubject(subj.name);
                  setIsSubjectInsightsExpanded(true);
                  setExpandedSubject(subj.name);
                }}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/70 hover:border-indigo-300 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                    {subj.name.split(" ")[0]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black border ${subj.badgeClass}`}>
                    {subj.status === "Needs Attention" ? "Drill" : subj.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                    {subj.scoreAvg} <span className="text-[10px] text-slate-400 font-normal">/ {subj.maxAvg}</span>
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {subj.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expanded View: Filter Chips and Detailed Subject Cards */}
        {isSubjectInsightsExpanded && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Subject Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => {
                  HapticService.lightTap();
                  setSelectedFilterSubject("all");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilterSubject === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                All Sections ({subjectInsights.length})
              </button>
              {subjectInsights.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    HapticService.lightTap();
                    setSelectedFilterSubject(s.name);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedFilterSubject === s.name
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Detailed Subject Cards Grid */}
            <div className="grid gap-3.5">
          {filteredSubjectInsights.map((subj) => {
            const isExpanded = expandedSubject === subj.name;

            return (
              <div
                key={subj.name}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                        {subj.name}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${subj.badgeClass}`}>
                        {subj.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Average: <strong className="text-slate-900 dark:text-slate-100">{subj.scoreAvg}</strong> / {subj.maxAvg} Marks ({subj.percentage}%)
                    </p>
                  </div>

                  {/* Sectional Trend Icon */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                      {subj.trend === "improving" && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                          <TrendingUp className="w-4 h-4" /> <span>Improving</span>
                        </span>
                      )}
                      {subj.trend === "stable" && (
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                          <Minus className="w-4 h-4" /> <span>Consistent</span>
                        </span>
                      )}
                      {subj.trend === "declining" && (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                          <TrendingDown className="w-4 h-4" /> <span>Needs Drill</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(5, subj.percentage))}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${subj.barGradient}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span>Target: {Math.round(subj.maxAvg * 0.8)} Marks (80%)</span>
                    <span>Accuracy: <strong className="text-slate-900 dark:text-slate-100">{subj.accuracy}%</strong></span>
                  </div>
                </div>

                {/* 3 Micro Metrics Tiles */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                      Est. Accuracy
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {subj.accuracy}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                      Penalty Lost
                    </span>
                    <span className="text-sm font-black text-rose-500">
                      -{subj.estimatedPenalty} Marks
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                      Target Gap
                    </span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {Math.max(0, Math.round((subj.maxAvg * 0.8 - subj.scoreAvg) * 10) / 10)} Marks
                    </span>
                  </div>
                </div>

                {/* Toggle Expandable Deep-Dive Button */}
                <button
                  onClick={() => {
                    HapticService.lightTap();
                    setExpandedSubject(isExpanded ? null : subj.name);
                  }}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-black text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isExpanded ? "Hide Subject Revision Blueprint" : "View Sectional Revision Blueprint & Key Topics"}</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expandable Section Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800"
                    >
                      {/* Tactical Advice */}
                      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 space-y-1 text-xs">
                        <span className="font-black text-blue-800 dark:text-blue-300 block">
                          🎯 Tactical Exam Strategy:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {subj.tacticalAdvice}
                        </p>
                      </div>

                      {/* Key High Yield Topics to Revise */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                          High-Yield Topics to Drill:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {subj.keyTopics.map((topic) => (
                            <span
                              key={topic}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                            >
                              📌 {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Time Allocation Advice */}
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Daily Practice Guideline: <strong className="text-slate-800 dark:text-slate-200">{subj.timeAllocationAdvice}</strong></span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
            </div>
          </div>
        )}
      </div>

      {/* C. Subject Radar Chart */}
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
      />
    </div>
  );
};
