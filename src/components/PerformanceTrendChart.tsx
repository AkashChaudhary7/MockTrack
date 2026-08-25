import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { MockAttempt } from "../types";
import { PlatformLogo } from "./PlatformLogo";
import { TrendingUp, Target, Award } from "lucide-react";

interface PerformanceTrendChartProps {
  attempts: MockAttempt[];
  baselineScore: number;
  totalMarks: number;
}

// Custom 3D-styled Recharts Tooltip
const CustomTooltip = ({ active, payload, baselineScore }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const diff = Number((data.score - baselineScore).toFixed(1));
    const isAboveBaseline = diff >= 0;

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2 card-bevel-3d max-w-xs">
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
          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
            {data.score} <span className="text-[10px] text-slate-400">/ {data.maxMarks}</span>
          </span>
        </div>

        {data.accuracy !== undefined && data.accuracy > 0 && (
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <span>Accuracy:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{data.accuracy}%</span>
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
}) => {
  // Sort attempts chronologically (oldest to newest) and take recent 7
  const sorted = [...attempts]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  if (sorted.length === 0) {
    return (
      <div className="rounded-3xl p-6 text-center card-bevel-3d space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mx-auto btn-3d-secondary">
          📈
        </div>
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
          No Mock Tests Logged Yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
          Log your first mock test to unlock interactive performance trend analytics and baseline tracking.
        </p>
      </div>
    );
  }

  // Format data points for Recharts
  const chartData = sorted.map((att, index) => {
    const dObj = new Date(att.date + "T00:00:00");
    const monthShort = dObj.toLocaleDateString("en-US", { month: "short" });
    const day = dObj.getDate();
    const dateLabel = `${day} ${monthShort}`;

    return {
      id: att.id,
      index: index + 1,
      score: att.score,
      maxMarks: att.maxMarks,
      title: att.title,
      platform: att.platform,
      accuracy: att.accuracy,
      dateLabel,
      shortLabel: `#${index + 1} (${day} ${monthShort})`,
    };
  });

  // Dynamic Y-Axis Domain calculation
  const scores = sorted.map((a) => a.score);
  const minScore = Math.max(0, Math.floor(Math.min(...scores, baselineScore) - 10));
  const maxScore = Math.min(totalMarks, Math.ceil(Math.max(...scores, baselineScore) + 10));

  // Compute latest trend trajectory
  const latestScore = sorted[sorted.length - 1].score;
  const isAboveBaseline = latestScore >= baselineScore;

  return (
    <div className="rounded-3xl p-4 sm:p-5 card-bevel-3d space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>7-Attempt Performance Trend</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
            <span>Target Baseline:</span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-black">
              {baselineScore} Marks
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-extrabold">
            Last {sorted.length} Mocks
          </span>
          <span
            className={`px-2.5 py-1 rounded-full border text-[11px] font-black ${
              isAboveBaseline
                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            }`}
          >
            {isAboveBaseline ? "Above Target 🎯" : "Target Gap ⚠️"}
          </span>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="w-full h-56 sm:h-64 select-none pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="performance3DGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" className="dark:stroke-slate-800 opacity-60" />

            <XAxis
              dataKey="shortLabel"
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              dy={8}
            />

            <YAxis
              domain={[minScore, maxScore]}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              dx={-4}
            />

            <Tooltip content={<CustomTooltip baselineScore={baselineScore} />} />

            {/* Baseline Target Reference Line */}
            <ReferenceLine
              y={baselineScore}
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `Baseline (${baselineScore})`,
                fill: "#6366f1",
                fontSize: 10,
                fontWeight: 800,
                position: "insideTopRight",
              }}
            />

            {/* Score Area Line */}
            <Area
              type="monotone"
              dataKey="score"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#performance3DGrad)"
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
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Recent Attempt Chips */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Logged Score
          </span>
          <span className="flex items-center gap-1.5 text-indigo-500">
            <span className="w-3 border-t-2 border-dashed border-indigo-500" />
            Target Baseline
          </span>
        </div>

        <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
          Latest: <span className="text-indigo-600 dark:text-indigo-400">{latestScore} Marks</span>
        </div>
      </div>
    </div>
  );
};
