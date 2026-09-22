import React, { useState, useEffect, useMemo } from "react";
import {
  MARKING_SCHEMES,
  MarkingSchemePreset,
  calculateScoreFromQuestions,
  calculateSkippedQuestions,
  calculateAccuracy,
  getAccuracyTier,
} from "../utils/mockCalculator";
import {
  Calculator,
  Settings2,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { HapticService } from "../services/HapticService";
import { ExamProfile } from "../types";

interface LogMockQuestionCalculatorProps {
  score: string;
  onScoreChange: (val: string) => void;
  maxMarks: string;
  onMaxMarksChange: (val: string) => void;
  percentile: string;
  onPercentileChange: (val: string) => void;
  correctCount: string;
  onCorrectCountChange: (val: string) => void;
  incorrectCount: string;
  onIncorrectCountChange: (val: string) => void;
  unattemptedCount: string;
  onUnattemptedCountChange: (val: string) => void;
  activeExam: ExamProfile;
}

export const LogMockQuestionCalculator: React.FC<LogMockQuestionCalculatorProps> = ({
  score,
  onScoreChange,
  maxMarks,
  onMaxMarksChange,
  percentile,
  onPercentileChange,
  correctCount,
  onCorrectCountChange,
  incorrectCount,
  onIncorrectCountChange,
  unattemptedCount,
  onUnattemptedCountChange,
  activeExam,
}) => {
  // Select initial preset based on exam name or negative penalty ratio
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const name = (activeExam.name || "").toLowerCase();
    if (name.includes("neet")) return "neet_ug";
    if (name.includes("jee")) return "jee_main";
    if (name.includes("bank") || name.includes("ibps") || name.includes("sbi")) return "bank_prelims";
    if (name.includes("railway") || name.includes("rrb") || name.includes("ntpc")) return "rrb_railways";
    if (name.includes("upsc")) return "upsc_prelims";
    return "ssc_cgl";
  });

  const selectedPreset =
    MARKING_SCHEMES.find((s) => s.id === selectedPresetId) || MARKING_SCHEMES[0];

  const [correctMarks, setCorrectMarks] = useState<number>(selectedPreset.correctMarks);
  const [penaltyMarks, setPenaltyMarks] = useState<number>(
    activeExam.negativeMarkingRatio !== undefined
      ? activeExam.negativeMarkingRatio
      : selectedPreset.penaltyMarks
  );
  const [totalQuestions, setTotalQuestions] = useState<string>(
    String(selectedPreset.defaultQuestions || 100)
  );

  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [showCustomConfig, setShowCustomConfig] = useState<boolean>(false);

  // Parse numbers
  const numCorrect = parseInt(correctCount, 10) || 0;
  const numIncorrect = parseInt(incorrectCount, 10) || 0;
  const numTotalQ = parseInt(totalQuestions, 10) || 100;

  // Compute question metrics
  const { grossScore, penaltyLost, netScore } = calculateScoreFromQuestions(
    numCorrect,
    numIncorrect,
    correctMarks,
    penaltyMarks
  );

  const calculatedSkipped = calculateSkippedQuestions(numTotalQ, numCorrect, numIncorrect);
  const calculatedAcc = calculateAccuracy(numCorrect, numIncorrect);
  const accTier = getAccuracyTier(calculatedAcc);

  // Sync preset changes
  const handlePresetSelect = (preset: MarkingSchemePreset) => {
    HapticService.lightTap();
    setSelectedPresetId(preset.id);
    setCorrectMarks(preset.correctMarks);
    setPenaltyMarks(preset.penaltyMarks);
    setTotalQuestions(String(preset.defaultQuestions));
    if (preset.id === "custom") {
      setShowCustomConfig(true);
    }
  };

  // Auto-sync question calculation with score and unattempted counts
  useEffect(() => {
    if (autoSync && (correctCount !== "" || incorrectCount !== "")) {
      onScoreChange(String(netScore));
      onUnattemptedCountChange(String(calculatedSkipped));
    }
  }, [netScore, calculatedSkipped, autoSync, correctCount, incorrectCount]);

  const handleApplyNetScore = () => {
    HapticService.success();
    onScoreChange(String(netScore));
    onUnattemptedCountChange(String(calculatedSkipped));
  };

  const isCurrentScoreDifferent =
    score !== "" && Math.abs(parseFloat(score) - netScore) > 0.05;

  return (
    <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-4 border border-indigo-100/90 dark:border-indigo-900/60 shadow-xs">
      {/* 1. UNIFIED HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-xs">
            <Calculator className="w-4 h-4 stroke-[2.3]" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black font-display uppercase tracking-wider text-slate-800 dark:text-slate-100 block">
              2. Score, Accuracy &amp; Penalty Summary
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Auto-computes net score, penalties &amp; precision from question counts
            </span>
          </div>
        </div>

        {/* Badges & Marking Scheme Trigger */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {/* Accuracy Badge */}
          {numCorrect + numIncorrect > 0 && (
            <span
              className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${accTier.badgeClass}`}
              title="Overall Question Accuracy"
            >
              <span>{accTier.icon}</span>
              <span>{calculatedAcc}% Acc</span>
            </span>
          )}

          {/* Penalty Badge */}
          {penaltyLost > 0 && (
            <span
              className="text-[10.5px] font-black px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 text-rose-600 dark:text-rose-400"
              title="Negative Penalty Marks Lost"
            >
              -{penaltyLost} Penalty
            </span>
          )}

          {/* Marking Scheme Toggle Button */}
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setShowCustomConfig(!showCustomConfig);
            }}
            className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            title="Configure Exam Marking Scheme (+/- marks per question)"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{selectedPreset.shortLabel}</span>
          </button>
        </div>
      </div>

      {/* 2. MARKING SCHEME CONFIGURATOR (Collapsible) */}
      {showCustomConfig && (
        <div className="p-3.5 bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl space-y-3 border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">
              Marking Scheme Presets
            </span>
            <span className="text-[10px] text-slate-400">
              Adapts for {activeExam.shortCode || activeExam.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MARKING_SCHEMES.map((scheme) => {
              const isSelected = selectedPresetId === scheme.id;
              return (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => handlePresetSelect(scheme)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {scheme.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                + Marks / Correct
              </label>
              <input
                type="number"
                step="any"
                value={correctMarks}
                onChange={(e) => {
                  setCorrectMarks(parseFloat(e.target.value) || 0);
                  setSelectedPresetId("custom");
                }}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                - Penalty / Wrong
              </label>
              <input
                type="number"
                step="any"
                value={penaltyMarks}
                onChange={(e) => {
                  setPenaltyMarks(parseFloat(e.target.value) || 0);
                  setSelectedPresetId("custom");
                }}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Total Test Questions
              </label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. QUESTION BREAKDOWN CARDS (3 Columns) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Correct Questions */}
        <div className="p-3 sm:p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 transition-all focus-within:ring-2 focus-within:ring-emerald-500/30">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] sm:text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              ✓ Correct
            </label>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100/80 dark:bg-emerald-900/50 px-1.5 py-0.2 rounded-md">
              +{correctMarks}
            </span>
          </div>
          <input
            type="number"
            min="0"
            max={numTotalQ}
            placeholder="0"
            value={correctCount}
            onChange={(e) => onCorrectCountChange(e.target.value)}
            className="w-full text-lg sm:text-xl font-black font-display text-emerald-900 dark:text-emerald-100 bg-transparent border-b-2 border-emerald-300 dark:border-emerald-700 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Incorrect Questions */}
        <div className="p-3 sm:p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 transition-all focus-within:ring-2 focus-within:ring-rose-500/30">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] sm:text-[11px] font-black text-rose-800 dark:text-rose-300 uppercase tracking-wide">
              ✗ Incorrect
            </label>
            <span className="text-[9px] sm:text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-100/80 dark:bg-rose-900/50 px-1.5 py-0.2 rounded-md">
              -{penaltyMarks}
            </span>
          </div>
          <input
            type="number"
            min="0"
            max={numTotalQ}
            placeholder="0"
            value={incorrectCount}
            onChange={(e) => onIncorrectCountChange(e.target.value)}
            className="w-full text-lg sm:text-xl font-black font-display text-rose-900 dark:text-rose-100 bg-transparent border-b-2 border-rose-300 dark:border-rose-700 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        {/* Skipped / Unattempted Questions */}
        <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 transition-all focus-within:ring-2 focus-within:ring-slate-400/30">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] sm:text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              - Skipped
            </label>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
              Auto
            </span>
          </div>
          <input
            type="number"
            min="0"
            placeholder={String(calculatedSkipped)}
            value={unattemptedCount}
            onChange={(e) => onUnattemptedCountChange(e.target.value)}
            className="w-full text-lg sm:text-xl font-black font-display text-slate-800 dark:text-slate-200 bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:outline-hidden focus:border-slate-500"
          />
        </div>
      </div>

      {/* 4. OVERALL SCORE & NET PERFORMANCE STRIP */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-200/80 dark:border-indigo-800/70 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Marks Scored (Large Input) */}
          <div className="sm:col-span-7">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10.5px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider font-display">
                Marks Scored *
              </label>
              <span className="text-[9.5px] text-indigo-500/90 font-bold">
                (Gross: {grossScore} | Loss: -{penaltyLost})
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="text"
                required
                placeholder="0"
                value={score}
                onChange={(e) => {
                  const val = e.target.value;
                  onScoreChange(val);
                  if (val.includes("/")) {
                    const parts = val.split("/");
                    const enteredScore = parts[0]?.trim();
                    const enteredTotal = parts[1]?.trim();
                    if (enteredScore && !isNaN(Number(enteredScore))) {
                      onScoreChange(enteredScore);
                    }
                    if (enteredTotal && !isNaN(Number(enteredTotal))) {
                      onMaxMarksChange(enteredTotal);
                    }
                  }
                }}
                className="w-36 sm:w-44 text-2xl sm:text-3xl font-black font-display text-indigo-900 dark:text-indigo-100 bg-transparent border-b-2 border-indigo-400 dark:border-indigo-600 focus:outline-hidden focus:border-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-400">/</span>
              <input
                type="number"
                step="any"
                value={maxMarks}
                onChange={(e) => onMaxMarksChange(e.target.value)}
                placeholder="200"
                className="w-16 sm:w-20 text-base font-bold font-display text-slate-700 dark:text-slate-300 bg-transparent border-b border-indigo-300 dark:border-indigo-700 focus:outline-hidden"
                title="Max Marks"
              />
            </div>
          </div>

          {/* Percentile % Entry */}
          <div className="sm:col-span-5 flex flex-col justify-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Percentile % (Optional)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 96.5"
                value={percentile}
                onChange={(e) => onPercentileChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black font-display text-slate-800 dark:text-slate-200 focus:outline-hidden"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Auto Sync Toggle & Apply button */}
        <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span className="text-[11px]">Auto-sync score with question counts</span>
          </label>

          {!autoSync && isCurrentScoreDifferent && (
            <button
              type="button"
              onClick={handleApplyNetScore}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer flex items-center gap-1 transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Computed {netScore}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
