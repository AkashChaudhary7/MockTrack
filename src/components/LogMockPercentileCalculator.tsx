import React, { useState, useEffect } from "react";
import {
  calculatePercentileFromRank,
  calculateRankFromPercentile,
  calculateTimePacing,
} from "../utils/mockCalculator";
import { Award, Clock, ChevronDown, ChevronUp, Sparkles, Hash, Users, Timer } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface LogMockPercentileCalculatorProps {
  percentile: string;
  rank: string;
  totalCandidates: string;
  timeSpentMinutes: string;
  questionsAttempted: number;
  onUpdateRankPercentile: (percentile: string, rank: string, totalCandidates: string) => void;
  onUpdateTimeSpent: (timeSpent: string) => void;
}

export const LogMockPercentileCalculator: React.FC<LogMockPercentileCalculatorProps> = ({
  percentile,
  rank,
  totalCandidates,
  timeSpentMinutes,
  questionsAttempted,
  onUpdateRankPercentile,
  onUpdateTimeSpent,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(
    Boolean(percentile || rank || totalCandidates || timeSpentMinutes)
  );

  const numRank = parseInt(rank, 10) || 0;
  const numTotal = parseInt(totalCandidates, 10) || 0;
  const numPercentile = parseFloat(percentile);

  // Auto calculate percentile if rank and total are available
  const autoPercentile = calculatePercentileFromRank(numRank, numTotal);

  // Auto calculate pacing
  const numTime = parseInt(timeSpentMinutes, 10) || 0;
  const pacingInfo = calculateTimePacing(numTime, questionsAttempted);

  const handleRankChange = (val: string) => {
    const r = parseInt(val, 10) || 0;
    if (r > 0 && numTotal > 0 && r <= numTotal) {
      const calculatedPct = calculatePercentileFromRank(r, numTotal);
      onUpdateRankPercentile(calculatedPct !== null ? String(calculatedPct) : percentile, val, totalCandidates);
    } else {
      onUpdateRankPercentile(percentile, val, totalCandidates);
    }
  };

  const handleTotalCandidatesChange = (val: string) => {
    const tot = parseInt(val, 10) || 0;
    if (numRank > 0 && tot > 0 && numRank <= tot) {
      const calculatedPct = calculatePercentileFromRank(numRank, tot);
      onUpdateRankPercentile(calculatedPct !== null ? String(calculatedPct) : percentile, rank, val);
    } else if (!isNaN(numPercentile) && numPercentile > 0 && tot > 0 && !rank) {
      const calculatedRank = calculateRankFromPercentile(numPercentile, tot);
      onUpdateRankPercentile(percentile, calculatedRank !== null ? String(calculatedRank) : rank, val);
    } else {
      onUpdateRankPercentile(percentile, rank, val);
    }
  };

  const handlePercentileChange = (val: string) => {
    const pct = parseFloat(val);
    if (!isNaN(pct) && numTotal > 0 && !rank) {
      const calculatedRank = calculateRankFromPercentile(pct, numTotal);
      onUpdateRankPercentile(val, calculatedRank !== null ? String(calculatedRank) : rank, totalCandidates);
    } else {
      onUpdateRankPercentile(val, rank, totalCandidates);
    }
  };

  const hasData = Boolean(percentile || rank || totalCandidates || timeSpentMinutes);

  return (
    <div className="card-luminous rounded-2xl p-4 space-y-3 border border-slate-200/80 dark:border-slate-800">
      <button
        type="button"
        onClick={() => {
          HapticService.lightTap();
          setIsExpanded(!isExpanded);
        }}
        className="w-full flex items-center justify-between cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Award className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Percentile, Rank &amp; Time Pacing (Optional)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Auto-derives percentile from rank &amp; calculates speed per question
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          {hasData && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-black border border-blue-200 dark:border-blue-900">
              Active
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
          {/* 3 Columns: Rank, Total Candidates, Auto-derived Percentile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Rank */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                <Hash className="w-3 h-3 text-slate-400" />
                <span>Your Rank</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 420"
                value={rank}
                onChange={(e) => handleRankChange(e.target.value)}
                className="w-full text-base font-black font-display text-slate-800 dark:text-slate-200 bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-hidden"
              />
            </div>

            {/* Total Candidates */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Total Candidates</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={totalCandidates}
                onChange={(e) => handleTotalCandidatesChange(e.target.value)}
                className="w-full text-base font-black font-display text-slate-800 dark:text-slate-200 bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-hidden"
              />
            </div>

            {/* Percentile */}
            <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/70 dark:border-blue-900/50">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  Percentile %
                </label>
                {autoPercentile !== null && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Auto
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 98.32"
                value={percentile}
                onChange={(e) => handlePercentileChange(e.target.value)}
                className="w-full text-base font-black font-display text-blue-900 dark:text-blue-100 bg-transparent border-b border-blue-300 dark:border-blue-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Time Pacing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Time Spent Input */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                <Timer className="w-3 h-3 text-slate-400" />
                <span>Time Taken (Minutes)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 55"
                value={timeSpentMinutes}
                onChange={(e) => onUpdateTimeSpent(e.target.value)}
                className="w-full text-base font-black font-display text-slate-800 dark:text-slate-200 bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-hidden"
              />
            </div>

            {/* Auto Pacing Result */}
            <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                Pacing Speed Analysis
              </span>
              {pacingInfo ? (
                <div className="flex items-baseline justify-between gap-2 mt-0.5">
                  <span className="text-sm font-black font-display text-indigo-900 dark:text-indigo-100">
                    ⚡ {pacingInfo.formattedPacing}
                  </span>
                  <span className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
                    {pacingInfo.statusLabel}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Enter minutes &amp; questions to see pace
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
