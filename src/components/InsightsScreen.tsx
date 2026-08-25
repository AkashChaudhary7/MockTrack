import React from "react";
import { MockAttempt, ExamProfile } from "../types";
import { calculateAnalytics } from "../utils/analytics";
import { SubjectRadarChart } from "./SubjectRadarChart";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Sparkles,
  Zap,
  BarChart3,
} from "lucide-react";
import { EmptyState } from "./EmptyState";

interface InsightsScreenProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  activeExam,
  attempts,
}) => {
  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);
  const analytics = calculateAnalytics(attempts, activeExam);

  if (examAttempts.length === 0) {
    return (
      <div className="space-y-6 pb-24">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Insights &amp; Analytics</span>
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
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

  return (
    <div className="space-y-6 pb-24">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <span>Insights &amp; Baseline</span>
          <Sparkles className="w-6 h-6 text-indigo-500" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          Performance Engine for {activeExam.name}
        </p>
      </div>

      {/* A. Personal Baseline Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20">
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

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {analytics.baselineScore}{" "}
                <span className="text-lg font-bold text-indigo-300">
                  / {activeExam.totalMarks} Marks
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Weighted moving average score based on recent mock attempts.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-bold space-y-0.5">
              <div className="text-slate-300">Cut-off Clearance</div>
              <div className="text-emerald-400 font-black text-sm">High Probability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights Card */}
      <div className="rounded-3xl p-6 space-y-3 card-bevel-3d">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Performance Insights
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${analytics.performanceInsight.badgeColor}`}>
            {analytics.performanceInsight.badgeText}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
            {analytics.performanceInsight.headline}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {analytics.performanceInsight.description}
          </p>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-start gap-2.5">
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold shrink-0">💡 Strategy:</span>
            <span>{analytics.performanceInsight.recommendation}</span>
          </div>

          {!analytics.performanceInsight.hasEnoughData && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium">
              ⚠️ Log at least 3 mock test attempts to unlock accurate trajectory predictions.
            </div>
          )}
        </div>
      </div>

      {/* B. Avoidable Marks Lost Callout Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-3xl p-5 shadow-xs flex items-start gap-4">
        <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-200">
            Avoidable Marks Lost
          </h3>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
            {analytics.avoidableMarksRecommendation}
          </p>
        </div>
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

      {/* D. Subject Strength Bar Breakdown */}
      <div className="rounded-3xl p-6 space-y-4 card-bevel-3d">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Subject Strength Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sectional mastery percentage based on logged scores
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {analytics.subjectBreakdown.map((subject) => (
            <div key={subject.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-slate-800 dark:text-slate-200">
                  {subject.name}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${subject.colorClass} bg-opacity-15 font-black`}>
                  {subject.percentage}% ({subject.status})
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    subject.percentage >= 85
                      ? "bg-emerald-500"
                      : subject.percentage >= 75
                      ? "bg-teal-500"
                      : subject.percentage >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                <span>Avg: {subject.scoreAvg} / {subject.maxAvg} Marks</span>
                <span>Target: {Math.round(subject.maxAvg * 0.8)} Marks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
