import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Target, AlertTriangle, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

export interface SubjectMetric {
  name: string;
  scoreAvg: number;
  maxAvg: number;
  percentage: number;
  accuracy: number;
  status: "Very Strong" | "Strong" | "Moderate" | "Needs Improvement";
  colorClass: string;
}

interface SubjectRadarChartProps {
  metrics: SubjectMetric[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

// Custom tooltip for clean, accessible inspection
const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1 z-50">
        <span className="font-black text-indigo-300 block font-display">
          {data.fullName || data.subject}
        </span>
        <div className="flex items-center justify-between gap-3 text-[11px] tabular-nums font-mono">
          <span className="text-slate-400">Mastery:</span>
          <span className="font-black text-white">{data.score}%</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] tabular-nums font-mono">
          <span className="text-slate-400">Avg Marks:</span>
          <span className="font-bold text-emerald-400">{data.scoreAvg}/{data.maxAvg}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] tabular-nums font-mono">
          <span className="text-slate-400">Accuracy:</span>
          <span className="font-bold text-sky-400">{data.accuracy}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SubjectRadarChart: React.FC<SubjectRadarChartProps> = ({
  metrics,
  title = "Subject Mastery Radar",
  subtitle = "Sectional proficiency balance across all subjects",
  compact = false,
}) => {
  // Format data for Recharts RadarChart
  const radarData = React.useMemo(() => {
    if (!metrics || metrics.length === 0) {
      return [
        { subject: "Quant", fullName: "Quantitative Aptitude", score: 0, target: 80, accuracy: 0, scoreAvg: 0, maxAvg: 50 },
        { subject: "Reasoning", fullName: "Reasoning Ability", score: 0, target: 80, accuracy: 0, scoreAvg: 0, maxAvg: 50 },
        { subject: "English", fullName: "English Comprehension", score: 0, target: 80, accuracy: 0, scoreAvg: 0, maxAvg: 50 },
        { subject: "GA", fullName: "General Awareness", score: 0, target: 80, accuracy: 0, scoreAvg: 0, maxAvg: 50 },
      ];
    }

    return metrics.map((m) => {
      // Shorten label for neat radial placement
      let shortLabel = m.name;
      if (shortLabel.toLowerCase().includes("quant")) shortLabel = "Quant";
      else if (shortLabel.toLowerCase().includes("reason")) shortLabel = "Reasoning";
      else if (shortLabel.toLowerCase().includes("english")) shortLabel = "English";
      else if (shortLabel.toLowerCase().includes("general aware") || shortLabel.toLowerCase().includes("ga")) shortLabel = "GA";
      else if (shortLabel.length > 12) shortLabel = shortLabel.slice(0, 10) + "…";

      return {
        subject: shortLabel,
        fullName: m.name,
        score: Math.round(m.percentage),
        target: 75, // 75% target benchmark cut-off
        accuracy: m.accuracy,
        scoreAvg: m.scoreAvg,
        maxAvg: m.maxAvg,
        status: m.status,
      };
    });
  }, [metrics]);

  // Identify Weakest and Strongest Areas
  const sortedByScore = [...metrics].sort((a, b) => a.percentage - b.percentage);
  const weakestArea = sortedByScore[0];
  const strongestArea = sortedByScore[sortedByScore.length - 1];

  return (
    <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{title}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <span>Your Mastery</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-500" />
            <span>Target (75%)</span>
          </span>
        </div>
      </div>

      {/* Recharts Radar Chart */}
      <div className="w-full h-56 sm:h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="rgba(148, 163, 184, 0.25)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#64748B", fontSize: 11, fontWeight: 800 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            {/* Target Cutoff Line */}
            <Radar
              name="Target Benchmark"
              dataKey="target"
              stroke="#10B981"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fill="#10B981"
              fillOpacity={0.06}
            />
            {/* User Actual Mastery Radar */}
            <Radar
              name="Your Score %"
              dataKey="score"
              stroke="#6366F1"
              strokeWidth={2.5}
              fill="#6366F1"
              fillOpacity={0.35}
            />
            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Weak Areas at a Glance Callout Strip */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Weakest Area Alert */}
          {weakestArea && (
            <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 block tracking-wider">
                    Weak Area to Focus
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                    {weakestArea.name}
                  </span>
                </div>
              </div>
              <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-xs tabular-nums shrink-0">
                {Math.round(weakestArea.percentage)}%
              </span>
            </div>
          )}

          {/* Strongest Area */}
          {strongestArea && (
            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">
                    Top Strength
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                    {strongestArea.name}
                  </span>
                </div>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs tabular-nums shrink-0">
                {Math.round(strongestArea.percentage)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
