import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Layers,
  Calendar,
  Clock,
  Target,
  BarChart3,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MockAttempt, ExamProfile, PlatformId } from "../types";
import { PLATFORMS } from "../data/platforms";
import { PlatformLogo } from "./PlatformLogo";
import { HapticService } from "../services/HapticService";

interface MockComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  mockA: MockAttempt;
  mockB: MockAttempt;
  activeExam: ExamProfile;
}

// Custom tooltip for side-by-side comparison chart
const ComparisonTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const valA = payload[0]?.value ?? 0;
    const valB = payload[1]?.value ?? 0;
    const diff = Math.round((valB - valA) * 10) / 10;

    return (
      <div className="bg-slate-900 text-white border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs space-y-1.5 z-50 min-w-[170px]">
        <div className="font-display font-black text-slate-200 border-b border-slate-800 pb-1">
          {label}
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Mock 1:</span>
          </span>
          <span className="font-mono font-black text-white">{valA} marks</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Mock 2:</span>
          </span>
          <span className="font-mono font-black text-white">{valB} marks</span>
        </div>
        <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] font-black">
          <span className="text-slate-400">Difference:</span>
          <span className={diff > 0 ? "text-emerald-400" : diff < 0 ? "text-rose-400" : "text-slate-400"}>
            {diff > 0 ? `+${diff}` : diff} marks
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const MockComparisonModal: React.FC<MockComparisonModalProps> = ({
  isOpen,
  onClose,
  mockA,
  mockB,
  activeExam,
}) => {
  if (!isOpen || !mockA || !mockB) return null;

  // Order chronologically: older test is Attempt 1, newer is Attempt 2
  const dateA = new Date(mockA.date).getTime();
  const dateB = new Date(mockB.date).getTime();
  const [attempt1, attempt2] = dateA <= dateB ? [mockA, mockB] : [mockB, mockA];

  const scoreDiff = Math.round((attempt2.score - attempt1.score) * 10) / 10;
  const accDiff = Math.round(((attempt2.accuracy || 0) - (attempt1.accuracy || 0)) * 10) / 10;

  // Prepare section-wise chart data
  const chartData = useMemo(() => {
    const sectionNames = new Set<string>();

    (attempt1.sections || []).forEach((s) => sectionNames.add(s.name));
    (attempt2.sections || []).forEach((s) => sectionNames.add(s.name));

    // If both have explicit sections, compare sections
    if (sectionNames.size > 0) {
      return Array.from(sectionNames).map((secName) => {
        const s1 = (attempt1.sections || []).find((s) => s.name === secName);
        const s2 = (attempt2.sections || []).find((s) => s.name === secName);

        // Abbreviate long names for clean chart axis
        let shortName = secName;
        if (shortName.toLowerCase().includes("quant")) shortName = "Quant";
        else if (shortName.toLowerCase().includes("reason")) shortName = "Reasoning";
        else if (shortName.toLowerCase().includes("english")) shortName = "English";
        else if (shortName.toLowerCase().includes("general aware") || shortName.toLowerCase().includes("ga")) shortName = "GA";
        else if (shortName.length > 10) shortName = shortName.slice(0, 9) + "…";

        return {
          section: shortName,
          fullName: secName,
          "Mock 1": s1?.score ?? 0,
          "Mock 2": s2?.score ?? 0,
          maxMarks: s2?.maxMarks || s1?.maxMarks || 50,
        };
      });
    }

    // Fallback if no sections: compare Total Score, Accuracy %, and Correct Count
    return [
      {
        section: "Total Score",
        fullName: "Total Marks",
        "Mock 1": attempt1.score,
        "Mock 2": attempt2.score,
      },
      {
        section: "Accuracy",
        fullName: "Strike Accuracy %",
        "Mock 1": attempt1.accuracy || 0,
        "Mock 2": attempt2.accuracy || 0,
      },
      {
        section: "Correct",
        fullName: "Correct Questions",
        "Mock 1": attempt1.correctCount || 0,
        "Mock 2": attempt2.correctCount || 0,
      },
    ];
  }, [attempt1, attempt2]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Side-by-Side Mock Comparison</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {activeExam.shortCode || activeExam.name} • Visualizing score and section delta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Comparison"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* 1. Side-by-side Overview Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* Mock 1 (Attempt 1) */}
            <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Mock 1 (Earlier)
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tabular-nums">
                  {attempt1.date}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-black font-display text-slate-900 dark:text-slate-100 truncate">
                {attempt1.title}
              </h4>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-display text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {attempt1.score}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {attempt1.maxMarks}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 flex-wrap pt-1 border-t border-indigo-100 dark:border-indigo-900/60">
                <span>Acc: <strong className="text-slate-800 dark:text-slate-200">{attempt1.accuracy}%</strong></span>
                <span>•</span>
                <span>Type: {attempt1.testType}</span>
              </div>
            </div>

            {/* Mock 2 (Attempt 2) */}
            <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Mock 2 (Later)
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tabular-nums">
                  {attempt2.date}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-black font-display text-slate-900 dark:text-slate-100 truncate">
                {attempt2.title}
              </h4>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {attempt2.score}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {attempt2.maxMarks}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 flex-wrap pt-1 border-t border-emerald-100 dark:border-emerald-900/60">
                <span>Acc: <strong className="text-slate-800 dark:text-slate-200">{attempt2.accuracy}%</strong></span>
                <span>•</span>
                <span>Type: {attempt2.testType}</span>
              </div>
            </div>
          </div>

          {/* 2. Delta Pill Summary */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                Score Delta
              </span>
              <span className={`text-base font-black font-display tabular-nums flex items-center justify-center gap-1 ${
                scoreDiff > 0 ? "text-emerald-600 dark:text-emerald-400" : scoreDiff < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-600"
              }`}>
                {scoreDiff > 0 ? <TrendingUp className="w-4 h-4" /> : scoreDiff < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                <span>{scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} marks</span>
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                Accuracy Delta
              </span>
              <span className={`text-base font-black font-display tabular-nums flex items-center justify-center gap-1 ${
                accDiff > 0 ? "text-emerald-600 dark:text-emerald-400" : accDiff < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-600"
              }`}>
                {accDiff > 0 ? `+${accDiff}%` : `${accDiff}%`}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                Overall Trend
              </span>
              <span className="text-xs font-black font-display text-slate-800 dark:text-slate-200 mt-0.5 block">
                {scoreDiff > 0 ? "Score Improved 🚀" : scoreDiff < 0 ? "Needs Review ⚠️" : "Consistent Score 🎯"}
              </span>
            </div>
          </div>

          {/* 3. Small Bar Chart: Side-by-Side Comparison */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black font-display text-slate-800 dark:text-slate-200">
                Performance Comparison Chart
              </span>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                  <span>Mock 1</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Mock 2</span>
                </span>
              </div>
            </div>

            <div className="w-full h-52 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis
                    dataKey="section"
                    tick={{ fill: "#64748B", fontSize: 11, fontWeight: 700 }}
                    axisLine={{ stroke: "rgba(148, 163, 184, 0.3)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ComparisonTooltip />} />
                  <Bar
                    dataKey="Mock 1"
                    fill="#6366F1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="Mock 2"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Section-by-Section Granular Performance Delta */}
          {chartData.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                Detailed Section Breakdown
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chartData.map((item, idx) => {
                  const s1Val = item["Mock 1"];
                  const s2Val = item["Mock 2"];
                  const diff = Math.round((s2Val - s1Val) * 10) / 10;

                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate">
                          {item.fullName || item.section}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          {s1Val} → {s2Val} marks
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-black font-mono tabular-nums px-2 py-0.5 rounded-md ${
                          diff > 0
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : diff < 0
                            ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-xs rounded-xl cursor-pointer transition-colors font-display"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
