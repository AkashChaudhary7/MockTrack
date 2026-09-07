import React, { useState, useMemo } from "react";
import { ExamProfile, MockAttempt, PlatformId, TestType } from "../types";
import { PLATFORMS } from "../data/platforms";
import { PlatformLogo } from "./PlatformLogo";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Sparkles,
  X,
  FileText,
  Copy,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { HapticService } from "../services/HapticService";

interface BulkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: ExamProfile;
  onBulkAddAttempts: (attempts: Omit<MockAttempt, "id">[]) => void;
}

interface ParsedRow {
  date: string;
  title: string;
  platform: PlatformId;
  score: number;
  maxMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
  negativePenalty: number;
  testType: TestType;
  notes?: string;
  isValid: boolean;
  errorReason?: string;
}

const SAMPLE_CSV = `Date, Title, Platform, Score, MaxMarks, Correct, Incorrect, Unattempted, Notes
2026-02-15, Live Mock #1, testbook, 138.5, 200, 72, 11, 17, Good speed in reasoning; missed 3 geometry questions
2026-02-22, Full Length Test 2, oliveboard, 146.0, 200, 76, 8, 16, High accuracy in English; revised modern history
2026-03-01, All India Mock #3, testbook, 154.5, 200, 80, 7, 13, Personal Best! Time management was on point
2026-03-05, Speed Test Sectional, adda247, 44.0, 50, 22, 2, 1, 90% accuracy in Quantitative Aptitude`;

export const BulkLogModal: React.FC<BulkLogModalProps> = ({
  isOpen,
  onClose,
  activeExam,
  onBulkAddAttempts,
}) => {
  const [csvText, setCsvText] = useState<string>("");
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Parse CSV whenever csvText changes
  const parsedRows: ParsedRow[] = useMemo(() => {
    if (!csvText.trim()) return [];

    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return [];

    // Helper to split CSV line with basic quoted string handling
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ""));
      return result;
    };

    const firstLineCols = parseLine(lines[0]).map((c) => c.toLowerCase());
    const isHeaderPresent =
      firstLineCols.some((c) => c.includes("date") || c.includes("score") || c.includes("mark") || c.includes("title"));

    const dataLines = isHeaderPresent ? lines.slice(1) : lines;

    return dataLines.map((line, idx) => {
      const cols = parseLine(line);
      if (cols.length < 2) {
        return {
          date: new Date().toISOString().split("T")[0],
          title: `Imported Mock #${idx + 1}`,
          platform: "testbook",
          score: 0,
          maxMarks: activeExam.totalMarks,
          correctCount: 0,
          incorrectCount: 0,
          unattemptedCount: 0,
          accuracy: 0,
          negativePenalty: 0,
          testType: "Full Mock",
          isValid: false,
          errorReason: "Not enough columns in row",
        };
      }

      // Column mapping heuristics:
      // [0] Date, [1] Title/Platform, [2] Platform/Title, [3] Score, [4] MaxMarks, [5] Correct, [6] Incorrect, [7] Unattempted, [8] Notes
      let rawDate = cols[0] || new Date().toISOString().split("T")[0];
      // Normalize date if in DD/MM/YYYY or DD-MM-YYYY format
      if (rawDate.includes("/") || (rawDate.includes("-") && rawDate.split("-")[0].length < 4)) {
        const sep = rawDate.includes("/") ? "/" : "-";
        const parts = rawDate.split(sep);
        if (parts.length === 3) {
          if (parts[2].length === 4) {
            rawDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
          }
        }
      }

      const rawTitle = cols[1] || `${activeExam.shortCode || activeExam.name} Mock #${idx + 1}`;
      const rawPlatform = (cols[2] || "testbook").toLowerCase().trim();
      
      // Match platform ID
      let matchedPlatform: PlatformId = "testbook";
      if (PLATFORMS[rawPlatform as PlatformId]) {
        matchedPlatform = rawPlatform as PlatformId;
      } else if (rawPlatform.includes("olive")) {
        matchedPlatform = "oliveboard";
      } else if (rawPlatform.includes("pw") || rawPlatform.includes("physics")) {
        matchedPlatform = "physicswallah";
      } else if (rawPlatform.includes("adda")) {
        matchedPlatform = "adda247";
      } else if (rawPlatform.includes("byju")) {
        matchedPlatform = "byjus";
      } else if (rawPlatform.includes("unacad")) {
        matchedPlatform = "unacademy";
      } else if (rawPlatform.includes("offline") || rawPlatform.includes("coaching")) {
        matchedPlatform = "offline";
      } else {
        matchedPlatform = "other";
      }

      const score = parseFloat(cols[3]) || 0;
      const maxMarks = parseFloat(cols[4]) || activeExam.totalMarks || 200;
      const correctCount = parseInt(cols[5]) || Math.round(score > 0 ? (score / (maxMarks / 100)) * 0.45 : 0);
      const incorrectCount = parseInt(cols[6]) || 0;
      const unattemptedCount = parseInt(cols[7]) || Math.max(0, Math.round(maxMarks / 2 - (correctCount + incorrectCount)));
      const notes = cols[8] ? cols[8].trim() : undefined;

      const totalAttempted = correctCount + incorrectCount;
      const accuracy = totalAttempted > 0
        ? Number(((correctCount / totalAttempted) * 100).toFixed(1))
        : maxMarks > 0
        ? Number(((score / maxMarks) * 100).toFixed(1))
        : 0;

      const negativePenalty = Number((incorrectCount * activeExam.negativeMarkingRatio).toFixed(1));
      const testType: TestType = maxMarks < activeExam.totalMarks * 0.7 ? "Sectional" : "Full Mock";

      const isValid = !isNaN(score) && maxMarks > 0;

      return {
        date: rawDate,
        title: rawTitle,
        platform: matchedPlatform,
        score,
        maxMarks,
        correctCount,
        incorrectCount,
        unattemptedCount,
        accuracy,
        negativePenalty,
        testType,
        notes,
        isValid,
        errorReason: !isValid ? "Invalid score or marks" : undefined,
      };
    });
  }, [csvText, activeExam]);

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    HapticService.selection();
    setCsvText(SAMPLE_CSV);
  };

  const handleCopyTemplate = () => {
    HapticService.lightTap();
    navigator.clipboard.writeText("Date, Title, Platform, Score, MaxMarks, Correct, Incorrect, Unattempted, Notes\nYYYY-MM-DD, Mock Title, testbook, 140.0, 200, 72, 8, 20, Key notes or takeaways");
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        HapticService.success();
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleImportAll = () => {
    if (validRows.length === 0) return;

    HapticService.achievement();
    const attemptsToSave: Omit<MockAttempt, "id">[] = validRows.map((r) => ({
      profileId: activeExam.id,
      platform: r.platform,
      title: r.title,
      testType: r.testType,
      score: r.score,
      maxMarks: r.maxMarks,
      correctCount: r.correctCount,
      incorrectCount: r.incorrectCount,
      unattemptedCount: r.unattemptedCount,
      accuracy: r.accuracy,
      negativePenalty: r.negativePenalty,
      date: r.date,
      notes: r.notes,
    }));

    onBulkAddAttempts(attemptsToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Bulk Log Mock Tests</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  CSV Import
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Migrate or paste past mock results for <strong className="text-slate-700 dark:text-slate-300 font-extrabold">{activeExam.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Upload CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample CSV</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedNotification ? "Copied!" : "Copy Header Template"}</span>
              </button>

              {csvText && (
                <button
                  type="button"
                  onClick={() => setCsvText("")}
                  className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* CSV Input Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Paste CSV Lines (Date, Title, Platform, Score, MaxMarks, Correct, Incorrect, Unattempted, Notes)</span>
              <span>{linesCount(csvText)} lines</span>
            </div>
            <textarea
              rows={5}
              placeholder={`Date, Title, Platform, Score, MaxMarks, Correct, Incorrect, Unattempted, Notes\n2026-03-01, Full Mock #1, testbook, 142.5, 200, 74, 9, 17, Solid accuracy in Reasoning\n2026-03-04, Mock #2, oliveboard, 148.0, 200, 77, 6, 17, Great time management`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full font-mono text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                    Parsed Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {validRows.length} Valid Mocks
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                      {invalidRows.length} Errors
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-bold text-slate-400">
                  Target: {activeExam.shortCode || activeExam.name}
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto max-h-56">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-extrabold text-[10px] uppercase border-b border-slate-200 dark:border-slate-700">
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Platform</th>
                      <th className="p-2.5">Score</th>
                      <th className="p-2.5">Accuracy</th>
                      <th className="p-2.5">Notes</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {parsedRows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={
                          r.isValid
                            ? "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            : "bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300"
                        }
                      >
                        <td className="p-2.5 font-bold whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {r.date}
                        </td>
                        <td className="p-2.5 font-black text-slate-900 dark:text-slate-100 max-w-[140px] truncate">
                          {r.title}
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold capitalize text-[10px]">
                            {r.platform}
                          </span>
                        </td>
                        <td className="p-2.5 font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {r.score} <span className="text-[10px] text-slate-400">/ {r.maxMarks}</span>
                        </td>
                        <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                          {r.accuracy}%
                        </td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px] max-w-[150px] truncate">
                          {r.notes || "—"}
                        </td>
                        <td className="p-2.5 text-center">
                          {r.isValid ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 inline" />
                          ) : (
                            <span title={r.errorReason}>
                              <AlertCircle className="w-4 h-4 text-rose-500 inline" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={validRows.length === 0}
            onClick={handleImportAll}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all ${
              validRows.length > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-98"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>Import All ({validRows.length} Mocks)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function linesCount(text: string): number {
  if (!text.trim()) return 0;
  return text.split(/\r?\n/).filter((l) => l.trim().length > 0).length;
}
