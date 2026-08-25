import React, { useState, useMemo } from "react";
import { MockAttempt, ExamProfile, PlatformId } from "../types";
import { PLATFORMS } from "../data/platforms";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  Edit3,
  Calendar,
  AlertTriangle,
  Award,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { FileService } from "../services/FileService";
import { HapticService } from "../services/HapticService";
import { EmptyState } from "./EmptyState";
import { PlatformLogo } from "./PlatformLogo";

interface HistoryScreenProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  onEditMock: (mock: MockAttempt) => void;
  onDeleteMock: (id: string) => void;
  onOpenLogModal: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  attempts,
  activeExam,
  onEditMock,
  onDeleteMock,
  onOpenLogModal,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const examMocks = useMemo(() => {
    return attempts.filter((a) => a.profileId === activeExam.id);
  }, [attempts, activeExam.id]);

  const filteredMocks = useMemo(() => {
    return examMocks
      .filter((mock) => {
        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesTitle = mock.title.toLowerCase().includes(q);
          const matchesPlatform = (PLATFORMS[mock.platform]?.name || mock.platform).toLowerCase().includes(q);
          const matchesWeak = (mock.weakAreas || []).some((w) => w.toLowerCase().includes(q));
          const matchesNotes = (mock.notes || "").toLowerCase().includes(q);
          if (!matchesTitle && !matchesPlatform && !matchesWeak && !matchesNotes) return false;
        }
        // Platform filter
        if (selectedPlatform !== "all" && mock.platform !== selectedPlatform) {
          return false;
        }
        // Test type filter
        if (selectedTestType !== "all" && mock.testType !== selectedTestType) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === "highest") return b.score - a.score;
        if (sortBy === "lowest") return a.score - b.score;
        return 0;
      });
  }, [examMocks, searchTerm, selectedPlatform, selectedTestType, sortBy]);

  const handleExportCSV = () => {
    HapticService.lightTap();
    FileService.exportMocksCSV(filteredMocks);
  };

  const confirmDelete = (id: string) => {
    HapticService.warning();
    onDeleteMock(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Mock History</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold">
              {filteredMocks.length} Records
            </span>
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Target Exam: {activeExam.name} ({activeExam.shortCode})
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredMocks.length === 0}
          className="self-start sm:self-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-indigo-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filters Card */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 card-interactive">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search mock name, platform, weak topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Platform Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Platforms</option>
              {Object.keys(PLATFORMS).map((p) => (
                <option key={p} value={p}>
                  {PLATFORMS[p as PlatformId]?.name || p}
                </option>
              ))}
            </select>
          </div>

          {/* Test Type Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Test Types</option>
              <option value="Full Mock">Full Mock</option>
              <option value="Sectional">Sectional</option>
              <option value="Topic Test">Topic / Chapter Test</option>
              <option value="Previous Year Paper">Previous Year Paper</option>
              <option value="Offline Test">Offline Test</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mock Records List */}
      {filteredMocks.length === 0 ? (
        <EmptyState
          type="history"
          title="No Mock Records Found"
          description="Log your first mock test result to track your score history and baseline performance."
          actionLabel="+ LOG YOUR FIRST MOCK"
          onAction={() => {
            HapticService.selection();
            onOpenLogModal();
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredMocks.map((mock) => {
            const platformInfo = PLATFORMS[mock.platform as PlatformId] || PLATFORMS["other"];
            const pct = ((mock.score / mock.maxMarks) * 100).toFixed(1);

            return (
              <div
                key={mock.id}
                className="p-3.5 sm:p-4 rounded-2xl card-bevel-3d transition-all space-y-3 group"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PlatformLogo platformId={mock.platform} size="lg" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                        {mock.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-0.5">
                        <span className="capitalize">{platformInfo.name}</span>
                        <span>•</span>
                        <span>{mock.date}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-slate-600 dark:text-slate-400">
                          {mock.testType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="text-right">
                    <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      {mock.score}{" "}
                      <span className="text-xs font-semibold text-slate-400">/ {mock.maxMarks}</span>
                    </div>
                    <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {pct}%
                    </div>
                  </div>
                </div>

                {/* Sub Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  {mock.accuracy !== undefined && (
                    <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      Accuracy: <strong className="text-slate-900 dark:text-slate-100">{mock.accuracy}%</strong>
                    </span>
                  )}
                  {mock.rank !== undefined && (
                    <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg">
                      Rank: #{mock.rank}
                    </span>
                  )}
                  {mock.difficulty && (
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg">
                      {mock.difficulty}
                    </span>
                  )}
                  {mock.weakAreas && mock.weakAreas.length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      <span className="text-slate-400">Weak:</span>
                      {mock.weakAreas.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg text-[10px]"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-1">
                  {deleteConfirmId === mock.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                        Delete this record?
                      </span>
                      <button
                        onClick={() => confirmDelete(mock.id)}
                        className="px-2.5 py-1 bg-rose-600 text-white font-extrabold text-xs rounded-lg cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => {
                          HapticService.lightTap();
                          onEditMock(mock);
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Mock"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          HapticService.lightTap();
                          setDeleteConfirmId(mock.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Mock"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
