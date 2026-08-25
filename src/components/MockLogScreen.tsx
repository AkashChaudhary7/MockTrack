import React, { useState } from "react";
import { MockAttempt, PlatformId, TestType, ExamProfile, CandidateProfile } from "../types";
import { PLATFORMS } from "../data/platforms";
import { generateBilingualReportHTML } from "../utils/pdfExport";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  FileText,
  Calendar,
  Percent,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MockLogScreenProps {
  activeExam: ExamProfile;
  candidate: CandidateProfile;
  attempts: MockAttempt[];
  onOpenLogModal: (initial?: Partial<MockAttempt>) => void;
  onDeleteAttempt: (id: string) => void;
  onSelectAttempt: (attempt: MockAttempt) => void;
}

export const MockLogScreen: React.FC<MockLogScreenProps> = ({
  activeExam,
  candidate,
  attempts,
  onOpenLogModal,
  onDeleteAttempt,
  onSelectAttempt,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);

  const filteredAttempts = examAttempts.filter((att) => {
    const matchesSearch =
      att.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.notes && att.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlatform =
      selectedPlatform === "all" || att.platform === selectedPlatform;

    const matchesType =
      selectedTestType === "all" || att.testType === selectedTestType;

    return matchesSearch && matchesPlatform && matchesType;
  });

  const sortedAttempts = [...filteredAttempts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Mock Log History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Full Searchable History for {activeExam.name} ({examAttempts.length} Entries)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const html = generateBilingualReportHTML(candidate, activeExam, attempts);
              const win = window.open("", "_blank");
              if (win) {
                win.document.write(html);
                win.document.close();
              }
            }}
            className="py-2.5 px-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Export</span>
          </button>

          <button
            onClick={() => onOpenLogModal()}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Log Score</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3 card-interactive">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test title or takeaways notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
        </div>

        {/* Platform Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedPlatform("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
              selectedPlatform === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            All Platforms
          </button>
          {(Object.keys(PLATFORMS) as PlatformId[]).map((pid) => {
            const info = PLATFORMS[pid];
            const isSelected = selectedPlatform === pid;

            return (
              <button
                key={pid}
                onClick={() => setSelectedPlatform(pid)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? `${info.badgeClass} shadow-xs`
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {info.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log Feed */}
      {sortedAttempts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-2 card-interactive">
          <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
            No mock attempts match your search criteria.
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Try clearing search filters or click &quot;+ Log Score&quot; to create a test entry.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedAttempts.map((attempt) => {
            const platform = PLATFORMS[attempt.platform] || PLATFORMS.offline;
            const isExpanded = expandedId === attempt.id;

            return (
              <div
                key={attempt.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs card-interactive group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
                  className="p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${platform.badgeClass}`}>
                      {platform.name}
                    </span>

                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {attempt.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{attempt.testType}</span>
                        <span>•</span>
                        <span>{attempt.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                        {attempt.score} <span className="text-xs text-slate-400">/ {attempt.maxMarks}</span>
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {attempt.accuracy}% Accuracy (-{attempt.negativePenalty} penalty)
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 block text-[10px]">Correct Answers</span>
                          <strong className="text-emerald-600 font-extrabold text-sm">{attempt.correctCount} Qs</strong>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 block text-[10px]">Incorrect Answers</span>
                          <strong className="text-red-600 font-extrabold text-sm">{attempt.incorrectCount} Qs</strong>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 block text-[10px]">Negative Penalty</span>
                          <strong className="text-red-500 font-extrabold text-sm">-{attempt.negativePenalty} Marks</strong>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 block text-[10px]">Percentile</span>
                          <strong className="text-purple-600 font-extrabold text-sm">{attempt.percentile || "N/A"} %ile</strong>
                        </div>
                      </div>

                      {/* Sectional score breakdown if present */}
                      {attempt.sections && attempt.sections.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Subject Sectional Breakdown
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {attempt.sections.map((sec) => (
                              <div key={sec.name} className="p-2 bg-white dark:bg-slate-900 rounded-xl border text-xs">
                                <div className="text-[11px] text-slate-500 font-bold truncate">{sec.name}</div>
                                <div className="font-black text-indigo-600 dark:text-indigo-400">{sec.score} / {sec.maxMarks}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {attempt.notes && (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                          <span className="font-bold text-slate-500 block mb-1">Takeaways &amp; Weak Areas:</span>
                          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                            {attempt.notes}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => onOpenLogModal(attempt)}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-100"
                        >
                          Edit Entry
                        </button>
                        <button
                          onClick={() => onDeleteAttempt(attempt.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-100 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
