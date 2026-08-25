import React, { useState } from "react";
import { Target, AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";

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
}

export const SubjectRadarChart: React.FC<SubjectRadarChartProps> = ({ metrics }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectMetric | null>(
    metrics[0] || null
  );

  // Axis configuration for 4 core subjects
  const subjects = [
    { name: "Quantitative Aptitude", label: "Quant", angle: -90 }, // Top
    { name: "Reasoning Ability", label: "Reasoning", angle: 0 },    // Right
    { name: "English Comprehension", label: "English", angle: 90 }, // Bottom
    { name: "General Awareness", label: "GA", angle: 180 },        // Left
  ];

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 90;

  // Map metric to angle
  const getSubjectMetric = (name: string): SubjectMetric => {
    return (
      metrics.find(
        (m) =>
          m.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(m.name.toLowerCase())
      ) || {
        name,
        scoreAvg: 0,
        maxAvg: 50,
        percentage: 0,
        accuracy: 0,
        status: "Needs Improvement",
        colorClass: "bg-red-500 text-red-600",
      }
    );
  };

  // Convert polar coordinates (angle in degrees, radius) to Cartesian (x, y)
  const polarToCartesian = (angleInDegrees: number, radius: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    };
  };

  // Concentric ring levels
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Calculate polygon points
  const polygonPoints = subjects
    .map((s) => {
      const metric = getSubjectMetric(s.name);
      const valueRatio = Math.min(Math.max(metric.percentage / 100, 0.05), 1);
      const pt = polarToCartesian(s.angle, maxRadius * valueRatio);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Subject Mastery Radar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            4-Section Strength & Weakness Polar Analysis
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          Tier 1 Core
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Radar SVG */}
        <div className="relative flex flex-col items-center justify-center p-2">
          <svg
            width={size}
            height={size}
            className="overflow-visible drop-shadow-sm"
          >
            {/* Background Grid Rings */}
            {rings.map((ring, idx) => {
              const r = maxRadius * ring;
              const points = subjects
                .map((s) => {
                  const pt = polarToCartesian(s.angle, r);
                  return `${pt.x},${pt.y}`;
                })
                .join(" ");

              return (
                <g key={idx}>
                  <polygon
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-200 dark:text-slate-800"
                    strokeDasharray={idx < 3 ? "3 3" : "none"}
                  />
                  {/* Benchmark percentage label along top axis */}
                  <text
                    x={cx + 4}
                    y={cy - r + 3}
                    className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono font-medium"
                  >
                    {Math.round(ring * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Axes lines */}
            {subjects.map((s, i) => {
              const outerPt = polarToCartesian(s.angle, maxRadius);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={outerPt.x}
                  y2={outerPt.y}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-slate-300 dark:text-slate-700"
                />
              );
            })}

            {/* Candidate Performance Filled Polygon */}
            <polygon
              points={polygonPoints}
              className="fill-indigo-500/25 dark:fill-indigo-500/35 stroke-indigo-600 dark:stroke-indigo-400"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Vertex Point Markers */}
            {subjects.map((s, idx) => {
              const metric = getSubjectMetric(s.name);
              const valueRatio = Math.min(Math.max(metric.percentage / 100, 0.05), 1);
              const pt = polarToCartesian(s.angle, maxRadius * valueRatio);
              const isSelected = selectedSubject?.name.toLowerCase().includes(s.name.toLowerCase());

              return (
                <g
                  key={idx}
                  onClick={() => setSelectedSubject(metric)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? "7" : "5"}
                    className={`${
                      isSelected
                        ? "fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900"
                        : "fill-white dark:fill-slate-900 stroke-indigo-600 dark:stroke-indigo-400 group-hover:scale-125"
                    } transition-all duration-200`}
                    strokeWidth="2.5"
                  />
                </g>
              );
            })}

            {/* Subject Outer Labels */}
            {subjects.map((s, idx) => {
              const labelRadius = maxRadius + 24;
              const pt = polarToCartesian(s.angle, labelRadius);
              const metric = getSubjectMetric(s.name);
              const isSelected = selectedSubject?.name.toLowerCase().includes(s.name.toLowerCase());

              let textAnchor = "middle";
              if (s.angle === 0) textAnchor = "start";
              if (s.angle === 180) textAnchor = "end";

              return (
                <g
                  key={idx}
                  onClick={() => setSelectedSubject(metric)}
                  className="cursor-pointer select-none"
                >
                  <text
                    x={pt.x}
                    y={pt.y}
                    textAnchor={textAnchor}
                    className={`text-[11px] font-bold ${
                      isSelected
                        ? "fill-indigo-600 dark:fill-indigo-400 font-extrabold"
                        : "fill-slate-700 dark:fill-slate-300 hover:fill-indigo-600"
                    }`}
                  >
                    {s.label}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y + 12}
                    textAnchor={textAnchor}
                    className="text-[10px] font-semibold fill-slate-500 dark:fill-slate-400"
                  >
                    {metric.percentage}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Subject Breakdown Card */}
        {selectedSubject && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Selected Section
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedSubject.percentage >= 80
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : selectedSubject.percentage >= 65
                      ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                      : selectedSubject.percentage >= 50
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                  }`}
                >
                  {selectedSubject.status}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {selectedSubject.name}
              </h4>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Avg Marks
                  </span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedSubject.scoreAvg} <span className="text-xs text-slate-400 font-normal">/ {selectedSubject.maxAvg}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Accuracy
                  </span>
                  <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {selectedSubject.accuracy || Math.round(selectedSubject.percentage * 0.95)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  <span>Score Efficiency</span>
                  <span className="font-bold">{selectedSubject.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${selectedSubject.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Strategic Advice */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
              <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                {selectedSubject.percentage >= 80
                  ? "Top tier performance! Maintain pace by practicing speed tests and sectional mocks."
                  : selectedSubject.percentage >= 60
                  ? "Good baseline. Target specific weak sub-topics to bridge the remaining 20% score gap."
                  : "Requires immediate attention! Log mistake takeaways in the Review tab to eliminate speed traps."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
