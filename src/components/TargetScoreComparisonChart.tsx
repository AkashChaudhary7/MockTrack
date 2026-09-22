import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { MockAttempt, ExamProfile } from "../types";
import { PlatformLogo } from "./PlatformLogo";
import {
  Target,
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  BarChart2,
  Activity,
  Check,
} from "lucide-react";
import { HapticService } from "../services/HapticService";

interface TargetScoreComparisonChartProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  onUpdateExamProfile?: (updatedProfile: ExamProfile) => void;
}

// Custom Tooltip for Target Comparison Overlay
const CustomTargetTooltip = ({ active, payload, targetScore }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const diff = Number((data.score - targetScore).toFixed(1));
    const isAboveTarget = diff >= 0;
    const pctOfTarget = targetScore > 0 ? Math.round((data.score / targetScore) * 100) : 0;

    return (
      <div className="bg-white/98 dark:bg-slate-900/98 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2 max-w-xs select-none">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 truncate">
            <PlatformLogo platformId={data.platform} size="xs" />
            <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
              {data.title}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 shrink-0">
            {data.dateLabel}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Mock Score:</span>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {data.score}{" "}
              <span className="text-[10px] text-slate-400 font-normal">/ {data.maxMarks}</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
            <span>Target Score:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {targetScore} Marks
            </span>
          </div>
        </div>

        {/* Target Delta Badge */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold">
          <span className="text-slate-400">Target Gap:</span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 ${
              isAboveTarget
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            }`}
          >
            {isAboveTarget ? (
              <>
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                <span>+{diff} Above Target ({pctOfTarget}%)</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-3 h-3 text-amber-600" />
                <span>{diff} to Target ({pctOfTarget}%)</span>
              </>
            )}
          </span>
        </div>

        {data.accuracy !== undefined && data.accuracy > 0 && (
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
            <span>Accuracy:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{data.accuracy}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Custom Dot indicating Target Met or Below
const CustomTargetDot = (props: any) => {
  const { cx, cy, payload, targetScore } = props;
  if (!cx || !cy) return null;

  const isMet = payload.score >= targetScore;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isMet ? 5.5 : 4}
      fill={isMet ? "#10b981" : "#6366f1"}
      stroke="#ffffff"
      strokeWidth={2}
      className="transition-all hover:scale-125"
    />
  );
};

export const TargetScoreComparisonChart: React.FC<TargetScoreComparisonChartProps> = ({
  attempts,
  activeExam,
  onUpdateExamProfile,
}) => {
  const [filterRange, setFilterRange] = useState<"5" | "10" | "all">("10");
  const [chartMode, setChartMode] = useState<"overlay" | "delta">("overlay");
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<number>(
    activeExam.targetScore || Math.round(activeExam.totalMarks * 0.75)
  );

  const examAttempts = useMemo(
    () => attempts.filter((a) => a.profileId === activeExam.id),
    [attempts, activeExam.id]
  );

  // Target score for this specific exam
  const targetScore = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.75);

  // Filter chronologically
  const chronologicalAttempts = useMemo(() => {
    const sorted = [...examAttempts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (filterRange === "5") return sorted.slice(-5);
    if (filterRange === "10") return sorted.slice(-10);
    return sorted;
  }, [examAttempts, filterRange]);

  // Format chart data points
  const chartData = useMemo(() => {
    return chronologicalAttempts.map((att, index) => {
      const dObj = new Date(att.date + "T00:00:00");
      const monthShort = dObj.toLocaleDateString("en-US", { month: "short" });
      const day = dObj.getDate();
      const dateLabel = `${day} ${monthShort}`;

      const deltaFromTarget = Number((att.score - targetScore).toFixed(1));
      const isTargetMet = att.score >= targetScore;

      return {
        id: att.id,
        index: index + 1,
        title: att.title,
        platform: att.platform,
        score: att.score,
        maxMarks: att.maxMarks,
        targetScore,
        deltaFromTarget,
        isTargetMet,
        accuracy: att.accuracy,
        dateLabel,
        shortLabel: `M${index + 1}`,
      };
    });
  }, [chronologicalAttempts, targetScore]);

  // Statistics
  const scores = chronologicalAttempts.map((a) => a.score);
  const currentAvg = scores.length > 0
    ? Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1))
    : 0;
  const peakScore = scores.length > 0 ? Math.max(...scores) : 0;
  const mocksAboveTargetCount = scores.filter((s) => s >= targetScore).length;
  const targetClearanceRate = scores.length > 0
    ? Math.round((mocksAboveTargetCount / scores.length) * 100)
    : 0;

  const avgGapToTarget = Number((currentAvg - targetScore).toFixed(1));

  // Y-Axis Domain calculation
  const allScoresWithTarget = [...scores, targetScore];
  const minScoreVal = Math.max(0, Math.floor(Math.min(...allScoresWithTarget) - 10));
  const maxScoreVal = Math.min(activeExam.totalMarks, Math.ceil(Math.max(...allScoresWithTarget) + 10));

  const handleSaveTarget = () => {
    if (tempTarget > 0 && tempTarget <= activeExam.totalMarks) {
      HapticService.achievement();
      onUpdateExamProfile?.({
        ...activeExam,
        targetScore: tempTarget,
      });
      setIsEditingTarget(false);
    }
  };

  if (chronologicalAttempts.length === 0) {
    return (
      <div className="card-luminous rounded-3xl p-5 sm:p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-2xs">
          <Target className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="text-sm font-black font-display text-slate-900 dark:text-slate-100">
            Target Score Comparison
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mt-1">
            Log mock tests for {activeExam.name} to visually overlay your score progression against your defined target score of <strong>{targetScore} marks</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-luminous rounded-3xl p-4 sm:p-5 space-y-4">
      {/* 1. Header with Target Badge & Quick Target Edit */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
              <span>Target Score Overlay</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                Target: {targetScore} / {activeExam.totalMarks}
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Visual comparison of your mock scores vs. defined target benchmark
          </p>
        </div>

        {/* Quick Edit Target Score Button / Inline Form */}
        <div className="flex items-center gap-2 shrink-0">
          {!isEditingTarget ? (
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                setTempTarget(targetScore);
                setIsEditingTarget(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700"
              title="Change defined target score for this exam"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Edit Target</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-indigo-300 dark:border-indigo-700">
              <input
                type="number"
                min={1}
                max={activeExam.totalMarks}
                value={tempTarget}
                onChange={(e) => setTempTarget(Number(e.target.value))}
                className="w-16 px-1.5 py-0.5 text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-center"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTarget}
                className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                title="Save Target"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTarget(false)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[10px] font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Control Bar (Filters & Mode Selector) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Mock Range Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setFilterRange("5");
            }}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterRange === "5"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Last 5
          </button>
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setFilterRange("10");
            }}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterRange === "10"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Last 10
          </button>
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setFilterRange("all");
            }}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterRange === "all"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            All ({examAttempts.length})
          </button>
        </div>

        {/* View Mode Toggle: Overlay Trend vs Delta Bars */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setChartMode("overlay");
            }}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartMode === "overlay"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Overlay Trend</span>
          </button>
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setChartMode("delta");
            }}
            className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartMode === "delta"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Target Gap (Δ)</span>
          </button>
        </div>
      </div>

      {/* 3. Recharts Visual Chart Container */}
      <div className="w-full h-60 sm:h-64 select-none pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "overlay" ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 16, left: -14, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreOverlayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-800/80 opacity-60"
              />

              <XAxis
                dataKey="shortLabel"
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                dy={8}
              />

              <YAxis
                domain={[minScoreVal, maxScoreVal]}
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                dx={-4}
              />

              <Tooltip content={<CustomTargetTooltip targetScore={targetScore} />} />

              {/* Target Score Reference Line */}
              <ReferenceLine
                y={targetScore}
                stroke="#4f46e5"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Target: ${targetScore}`,
                  fill: "#4f46e5",
                  fontSize: 10,
                  fontWeight: 900,
                  position: "insideTopRight",
                }}
              />

              {/* Area fill under scores */}
              <Area
                type="monotone"
                dataKey="score"
                fill="url(#scoreOverlayGrad)"
                stroke="none"
              />

              {/* Score progression line */}
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={<CustomTargetDot targetScore={targetScore} />}
                activeDot={{ r: 6, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </ComposedChart>
          ) : (
            // Delta Bar Chart (+ / - Difference from Target)
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 16, left: -14, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-800/80 opacity-60"
              />

              <XAxis
                dataKey="shortLabel"
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                dy={8}
              />

              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                fontWeight={700}
                tickLine={false}
                axisLine={false}
                dx={-4}
              />

              <Tooltip content={<CustomTargetTooltip targetScore={targetScore} />} />

              <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />

              <Bar
                dataKey="deltaFromTarget"
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const isPositive = payload.deltaFromTarget >= 0;
                  const fill = isPositive ? "#10b981" : "#f59e0b";
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={fill}
                      rx={4}
                      className="transition-all hover:opacity-85"
                    />
                  );
                }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 4. Legend & Target Achievement Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Target Score
          </span>
          <div className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 tabular-nums font-display">
            {targetScore} <span className="text-[10px] text-slate-400 font-sans">Marks</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Average Score
          </span>
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 tabular-nums font-display flex items-center justify-between">
            <span>{currentAvg}</span>
            <span className={`text-[10px] font-bold ${avgGapToTarget >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
              {avgGapToTarget >= 0 ? `+${avgGapToTarget}` : `${avgGapToTarget}`}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Peak Score
          </span>
          <div className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 tabular-nums font-display flex items-center justify-between">
            <span>{peakScore}</span>
            <span className="text-[10px] font-bold text-slate-400">
              {peakScore >= targetScore ? "Met" : `${Math.round(targetScore - peakScore)} to go`}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Target Hit Rate
          </span>
          <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-display flex items-center justify-between">
            <span>{targetClearanceRate}%</span>
            <span className="text-[10px] font-bold text-slate-400">
              {mocksAboveTargetCount}/{chronologicalAttempts.length} Mocks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
