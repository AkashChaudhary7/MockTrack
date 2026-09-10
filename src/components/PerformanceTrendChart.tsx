import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { MockAttempt } from "../types";
import { PlatformLogo } from "./PlatformLogo";
import { TrendingUp, Target, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PerformanceTrendChartProps {
  attempts: MockAttempt[];
  baselineScore: number;
  totalMarks: number;
  targetScore?: number;
}

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, baselineScore }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const diff = Number((data.score - baselineScore).toFixed(1));
    const isAboveBaseline = diff >= 0;

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2 max-w-xs">
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

        <div className="flex items-baseline justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Score Logged:</span>
          <span className="text-sm font-black text-blue-600 dark:text-blue-400">
            {data.score} <span className="text-[10px] text-slate-400">/ {data.maxMarks}</span>
          </span>
        </div>

        {data.accuracy !== undefined && data.accuracy > 0 && (
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Accuracy:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.accuracy}%</span>
          </div>
        )}

        {data.deltaFromPrev !== null && data.deltaFromPrev !== undefined && (
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400">vs Previous:</span>
            <span className={data.deltaFromPrev >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
              {data.deltaFromPrev >= 0 ? `+${data.deltaFromPrev}` : `${data.deltaFromPrev}`} marks
            </span>
          </div>
        )}

        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold">
          <span className="text-slate-400">vs Target Baseline ({baselineScore}):</span>
          <span className={isAboveBaseline ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
            {isAboveBaseline ? `+${diff}` : `${diff}`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  attempts,
  baselineScore,
  totalMarks,
  targetScore,
}) => {
  // Sort attempts chronologically (oldest to newest) and take the last 10 attempts
  const sorted = [...attempts]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);

  if (sorted.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mx-auto">
          📈
        </div>
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
          No Mock Tests Logged Yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
          Log mock tests to visualize your score progression line chart across your last 10 attempts.
        </p>
      </div>
    );
  }

  // Format data points for Recharts LineChart
  const chartData = sorted.map((att, index) => {
    const dObj = new Date(att.date + "T00:00:00");
    const monthShort = dObj.toLocaleDateString("en-US", { month: "short" });
    const day = dObj.getDate();
    const dateLabel = `${day} ${monthShort}`;

    const prevScore = index > 0 ? sorted[index - 1].score : null;
    const deltaFromPrev = prevScore !== null ? Number((att.score - prevScore).toFixed(1)) : null;

    return {
      id: att.id,
      index: index + 1,
      score: att.score,
      maxMarks: att.maxMarks,
      title: att.title,
      platform: att.platform,
      accuracy: att.accuracy,
      dateLabel,
      shortLabel: `M${index + 1}`,
      deltaFromPrev,
    };
  });

  // Calculate statistics over the 10-attempt window
  const scores = sorted.map((a) => a.score);
  const tenMockAvg = Number((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1));
  const tenMockPeak = Math.max(...scores);
  const firstInWindow = scores[0];
  const lastInWindow = scores[scores.length - 1];
  const windowDelta = Number((lastInWindow - firstInWindow).toFixed(1));

  // Dynamic Y-Axis Domain calculation
  const referenceTarget = targetScore || baselineScore;
  const minScore = Math.max(0, Math.floor(Math.min(...scores, referenceTarget) - 10));
  const maxScore = Math.min(totalMarks, Math.ceil(Math.max(...scores, referenceTarget) + 10));

  const isAboveBaseline = lastInWindow >= baselineScore;

  return (
    <div className="card-luminous rounded-3xl p-4 sm:p-5 space-y-4">
      {/* Header Info - Clean & Minimal */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Score Progression</span>
        </h3>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-display">
          Chronological Trend
        </span>
      </div>

      {/* Recharts LineChart Container */}
      <div className="w-full h-52 sm:h-60 select-none pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/80 opacity-50" />

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
              domain={[minScore, maxScore]}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              dx={-4}
            />

            <Tooltip content={<CustomTooltip baselineScore={baselineScore} />} />

            {/* Baseline Reference Line */}
            <ReferenceLine
              y={baselineScore}
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Target ${baselineScore}`,
                fill: "#6366f1",
                fontSize: 10,
                fontWeight: 800,
                position: "insideTopRight",
              }}
            />

            {/* Score Progression Line */}
            <Line
              type="monotone"
              dataKey="score"
              name="Mock Score"
              stroke="#4f46e5"
              strokeWidth={3.5}
              activeDot={{
                r: 7,
                fill: "#6366f1",
                stroke: "#ffffff",
                strokeWidth: 3,
                className: "shadow-lg",
              }}
              dot={{
                r: 4.5,
                fill: "#4f46e5",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Beautiful Stat Strip Below the Chart */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-display">
          {/* 1. Plotted */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
              Plotted
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums">
              {sorted.length}/10 Mocks
            </span>
          </div>

          {/* 2. Avg Score */}
          <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/70 dark:border-indigo-800/50">
            <span className="text-[10px] font-bold text-indigo-500/90 dark:text-indigo-400/90 block uppercase">
              Avg
            </span>
            <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 tabular-nums">
              {tenMockAvg}
            </span>
          </div>

          {/* 3. Peak Score */}
          <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100/70 dark:border-purple-800/50">
            <span className="text-[10px] font-bold text-purple-500/90 dark:text-purple-400/90 block uppercase">
              Peak
            </span>
            <span className="text-sm font-black text-purple-700 dark:text-purple-300 tabular-nums">
              {tenMockPeak}
            </span>
          </div>

          {/* 4. Net Gain */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
              Net Gain
            </span>
            <span
              className={`text-sm font-black tabular-nums flex items-center justify-center gap-0.5 ${
                windowDelta >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {windowDelta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 inline" /> : <ArrowDownRight className="w-3.5 h-3.5 inline" />}
              {windowDelta >= 0 ? `+${windowDelta}` : windowDelta}
            </span>
          </div>

          {/* 5. Target Status */}
          <div
            className={`col-span-2 sm:col-span-1 p-2 rounded-xl border flex flex-col justify-center items-center ${
              isAboveBaseline
                ? "bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-50/60 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-800/60 text-amber-700 dark:text-amber-300"
            }`}
          >
            <span className="text-[10px] font-bold uppercase opacity-80">Target</span>
            <span className="text-xs font-black">
              {isAboveBaseline ? "Above Goal 🎯" : "Target Gap ⚠️"}
            </span>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Mock Score
            </span>
            <span className="flex items-center gap-1.5 text-indigo-500">
              <span className="w-3 border-t-2 border-dashed border-indigo-500" />
              Target Line
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Latest: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{lastInWindow} M</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
