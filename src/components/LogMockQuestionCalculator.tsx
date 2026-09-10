import React, { useState, useEffect } from "react";
import {
  MARKING_SCHEMES,
  MarkingSchemePreset,
  calculateScoreFromQuestions,
  calculateSkippedQuestions,
  calculateAccuracy,
  getAccuracyTier,
} from "../utils/mockCalculator";
import { Calculator, Check, Sparkles, AlertCircle, Settings2 } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface LogMockQuestionCalculatorProps {
  initialCorrect: string;
  initialIncorrect: string;
  initialTotalQuestions?: number;
  activeExamName: string;
  totalMarks: number;
  onApplyScore: (score: number, accuracy: number, correct: number, incorrect: number, skipped: number) => void;
  onApplyQuestionCounts: (correct: number, incorrect: number, skipped: number) => void;
  currentScoreValue: string;
}

export const LogMockQuestionCalculator: React.FC<LogMockQuestionCalculatorProps> = ({
  initialCorrect,
  initialIncorrect,
  initialTotalQuestions = 100,
  activeExamName,
  totalMarks,
  onApplyScore,
  onApplyQuestionCounts,
  currentScoreValue,
}) => {
  // Select initial preset based on exam name
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const name = activeExamName.toLowerCase();
    if (name.includes("neet")) return "neet_ug";
    if (name.includes("jee")) return "jee_main";
    if (name.includes("bank") || name.includes("ibps") || name.includes("sbi")) return "bank_prelims";
    if (name.includes("railway") || name.includes("rrb") || name.includes("ntpc")) return "rrb_railways";
    if (name.includes("upsc")) return "upsc_prelims";
    return "ssc_cgl";
  });

  const selectedPreset = MARKING_SCHEMES.find((s) => s.id === selectedPresetId) || MARKING_SCHEMES[0];

  const [correctMarks, setCorrectMarks] = useState<number>(selectedPreset.correctMarks);
  const [penaltyMarks, setPenaltyMarks] = useState<number>(selectedPreset.penaltyMarks);
  const [totalQuestions, setTotalQuestions] = useState<string>(
    String(selectedPreset.defaultQuestions || 100)
  );

  const [correct, setCorrect] = useState<string>(initialCorrect || "");
  const [incorrect, setIncorrect] = useState<string>(initialIncorrect || "");
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [showCustomConfig, setShowCustomConfig] = useState<boolean>(false);

  // Sync preset changes
  const handlePresetSelect = (preset: MarkingSchemePreset) => {
    HapticService.lightTap();
    setSelectedPresetId(preset.id);
    setCorrectMarks(preset.correctMarks);
    setPenaltyMarks(preset.penaltyMarks);
    setTotalQuestions(String(preset.defaultQuestions));
    if (preset.id === "custom") {
      setShowCustomConfig(true);
    } else {
      setShowCustomConfig(false);
    }
  };

  const numCorrect = parseInt(correct, 10) || 0;
  const numIncorrect = parseInt(incorrect, 10) || 0;
  const numTotalQ = parseInt(totalQuestions, 10) || 100;

  const { grossScore, penaltyLost, netScore } = calculateScoreFromQuestions(
    numCorrect,
    numIncorrect,
    correctMarks,
    penaltyMarks
  );

  const numSkipped = calculateSkippedQuestions(numTotalQ, numCorrect, numIncorrect);
  const calculatedAcc = calculateAccuracy(numCorrect, numIncorrect);
  const accTier = getAccuracyTier(calculatedAcc);

  // Auto sync if enabled
  useEffect(() => {
    if (autoSync && (correct || incorrect)) {
      onApplyScore(netScore, calculatedAcc, numCorrect, numIncorrect, numSkipped);
    }
  }, [netScore, calculatedAcc, numCorrect, numIncorrect, numSkipped, autoSync]);

  const handleApplyClick = () => {
    HapticService.success();
    onApplyScore(netScore, calculatedAcc, numCorrect, numIncorrect, numSkipped);
  };

  const isCurrentScoreDifferent =
    currentScoreValue !== "" && Math.abs(parseFloat(currentScoreValue) - netScore) > 0.05;

  return (
    <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-3.5 border border-indigo-100/80 dark:border-indigo-900/50">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calculator className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-black font-display uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
              Auto Score &amp; Accuracy Calculator
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Computes net score, penalties &amp; skipped count automatically
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomConfig(!showCustomConfig)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{showCustomConfig ? "Hide Scheme" : "Change Scheme"}</span>
        </button>
      </div>

      {/* Marking Scheme Presets (Visible when expanding or if custom) */}
      {showCustomConfig && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl space-y-2.5 border border-slate-200/80 dark:border-slate-700 animate-in fade-in duration-150">
          <label className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider block">
            Select Exam Marking Scheme
          </label>
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

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="text-[9.5px] font-bold text-slate-500 uppercase block">
                Marks / Correct
              </label>
              <input
                type="number"
                step="any"
                value={correctMarks}
                onChange={(e) => {
                  setCorrectMarks(parseFloat(e.target.value) || 0);
                  setSelectedPresetId("custom");
                }}
                className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[9.5px] font-bold text-slate-500 uppercase block">
                Penalty / Wrong
              </label>
              <input
                type="number"
                step="any"
                value={penaltyMarks}
                onChange={(e) => {
                  setPenaltyMarks(parseFloat(e.target.value) || 0);
                  setSelectedPresetId("custom");
                }}
                className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[9.5px] font-bold text-slate-500 uppercase block">
                Total Questions
              </label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                className="w-full px-2 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Question Inputs: Correct, Incorrect, Auto-Calculated Skipped */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Correct */}
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              ✓ Correct
            </label>
            <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold">
              +{correctMarks} ea
            </span>
          </div>
          <input
            type="number"
            min="0"
            max={numTotalQ}
            placeholder="0"
            value={correct}
            onChange={(e) => setCorrect(e.target.value)}
            className="w-full text-xl font-black font-display text-emerald-900 dark:text-emerald-100 bg-transparent border-b-2 border-emerald-300 dark:border-emerald-700 focus:outline-hidden"
          />
        </div>

        {/* Incorrect */}
        <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-200/80 dark:border-rose-900/50">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-wide">
              ✗ Incorrect
            </label>
            <span className="text-[9.5px] text-rose-600 dark:text-rose-400 font-bold">
              -{penaltyMarks} ea
            </span>
          </div>
          <input
            type="number"
            min="0"
            max={numTotalQ}
            placeholder="0"
            value={incorrect}
            onChange={(e) => setIncorrect(e.target.value)}
            className="w-full text-xl font-black font-display text-rose-900 dark:text-rose-100 bg-transparent border-b-2 border-rose-300 dark:border-rose-700 focus:outline-hidden"
          />
        </div>

        {/* Skipped (Auto-calculated!) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              - Skipped
            </label>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
              Auto
            </span>
          </div>
          <div className="text-xl font-black font-display text-slate-800 dark:text-slate-200">
            {numSkipped}
          </div>
          <span className="text-[9.5px] text-slate-400 font-medium">
            of {numTotalQ} Qs
          </span>
        </div>
      </div>

      {/* Auto Calculation Result Strip */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Auto-Calculated Net Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-display text-indigo-600 dark:text-indigo-400">
                {netScore}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                (Gross: {grossScore} | Loss: -{penaltyLost})
              </span>
            </div>
          </div>

          {/* Accuracy pill */}
          <div className="border-l border-indigo-200 dark:border-indigo-800 pl-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Accuracy
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs">{accTier.icon}</span>
              <span className={`text-xs font-black font-display ${accTier.textColor}`}>
                {calculatedAcc}%
              </span>
            </div>
          </div>
        </div>

        {/* Action button & Auto-sync toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Auto-sync with score</span>
          </label>

          {!autoSync && isCurrentScoreDifferent && (
            <button
              type="button"
              onClick={handleApplyClick}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply {netScore}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
