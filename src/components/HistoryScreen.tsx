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
  Plus,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { FileService } from "../services/FileService";
import { HapticService } from "../services/HapticService";
import { EmptyState } from "./EmptyState";
import { PlatformLogo } from "./PlatformLogo";
import { BulkLogModal } from "./BulkLogModal";

interface HistoryScreenProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  onEditMock: (mock: MockAttempt) => void;
  onDeleteMock: (id: string) => void;
  onOpenLogModal: () => void;
  onBulkAddAttempts?: (attempts: Omit<MockAttempt, "id">[]) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  attempts,
  activeExam,
  onEditMock,
  onDeleteMock,
  onOpenLogModal,
  onBulkAddAttempts,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<"all" | "last7" | "last30" | "topScores" | "highAccuracy" | "needsReview">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState<boolean>(false);

  const examMocks = useMemo(() => {
    return attempts.filter((a) => a.profileId === activeExam.id);
  }, [attempts, activeExam.id]);

  // Quick Filter Counts
  const quickFilterCounts = useMemo(() => {
    const now = new Date().getTime();
    let last7 = 0;
    let last30 = 0;
    let topScores = 0;
    let highAccuracy = 0;
    let needsReview = 0;

    const target = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.75);

    examMocks.forEach((m) => {
      const mDate = new Date(m.date + "T00:00:00").getTime();
      const diffDays = (now - mDate) / (1000 * 60 * 60 * 24);
      if (diffDays >= -1 && diffDays <= 7) last7++;
      if (diffDays >= -1 && diffDays <= 30) last30++;
      if (m.score >= target || (m.maxMarks > 0 && (m.score / m.maxMarks) >= 0.75)) topScores++;
      if (m.accuracy >= 85) highAccuracy++;
      if ((m.weakAreas && m.weakAreas.length > 0) || m.accuracy < 70) needsReview++;
    });

    return {
      all: examMocks.length,
      last7,
      last30,
      topScores,
      highAccuracy,
      needsReview,
    };
  }, [examMocks, activeExam]);

  // Summary Metrics calculations
  const totalMocksCount = examMocks.length;
  const avgScore = totalMocksCount > 0 
    ? Math.round(examMocks.reduce((sum, m) => sum + m.score, 0) / totalMocksCount) 
    : 0;
  const bestScore = totalMocksCount > 0 
    ? Math.max(...examMocks.map((m) => m.score)) 
    : 0;

  const testTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: examMocks.length,
      "Full Mock": 0,
      "Sectional": 0,
      "Topic Test": 0,
      "Previous Year Paper": 0,
    };
    examMocks.forEach((m) => {
      if (counts[m.testType] !== undefined) {
        counts[m.testType]++;
      }
    });
    return counts;
  }, [examMocks]);

  const filteredMocks = useMemo(() => {
    const now = new Date().getTime();
    const target = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.75);

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
        // Quick filter chips
        if (quickFilter !== "all") {
          const mDate = new Date(mock.date + "T00:00:00").getTime();
          const diffDays = (now - mDate) / (1000 * 60 * 60 * 24);
          if (quickFilter === "last7" && !(diffDays >= -1 && diffDays <= 7)) return false;
          if (quickFilter === "last30" && !(diffDays >= -1 && diffDays <= 30)) return false;
          if (quickFilter === "topScores" && !(mock.score >= target || (mock.maxMarks > 0 && (mock.score / mock.maxMarks) >= 0.75))) return false;
          if (quickFilter === "highAccuracy" && mock.accuracy < 85) return false;
          if (quickFilter === "needsReview" && !((mock.weakAreas && mock.weakAreas.length > 0) || mock.accuracy < 70)) return false;
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
  }, [examMocks, searchTerm, selectedPlatform, selectedTestType, quickFilter, sortBy, activeExam]);

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
    <div className="space-y-4 pb-28 max-w-3xl mx-auto">
      {/* 1. Header Bar with Compact [⇅] Data Action */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Mock History</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black border border-indigo-200/60 dark:border-indigo-800 font-display">
              {filteredMocks.length}
            </span>
          </h1>

          {/* Icon-only action [⇅] beside Mock History */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                setIsDataMenuOpen(!isDataMenuOpen);
              }}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center active:scale-95"
              title="Import / Export CSV"
              aria-label="Import or Export CSV"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {isDataMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDataMenuOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  {onBulkAddAttempts && (
                    <button
                      type="button"
                      onClick={() => {
                        HapticService.selection();
                        setIsDataMenuOpen(false);
                        setIsBulkModalOpen(true);
                      }}
                      className="w-full px-2.5 py-2 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Bulk CSV Import</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsDataMenuOpen(false);
                      handleExportCSV();
                    }}
                    disabled={filteredMocks.length === 0}
                    className="w-full px-2.5 py-2 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            onOpenLogModal();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Mock</span>
        </button>
      </div>

      {/* 2. Top Metric Strip Card (Screenshots 5 & 6) */}
      <div className="card-luminous rounded-2xl p-4 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums font-display">
            {totalMocksCount}
          </span>
          <span className="text-[11px] font-bold text-slate-400 mt-0.5">
            Total Mocks
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums font-display">
            {avgScore} <span className="text-xs font-bold text-slate-400 font-sans">/ {activeExam.totalMarks}</span>
          </span>
          <span className="text-[11px] font-bold text-slate-400 mt-0.5">
            Avg Score
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-display">
            {bestScore} <span className="text-xs font-bold text-slate-400 font-sans">PB</span>
          </span>
          <span className="text-[11px] font-bold text-slate-400 mt-0.5">
            Best Score
          </span>
        </div>
      </div>

      {/* 3. Horizontal Pill Filter Row (Screenshots 5 & 6) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: `All (${testTypeCounts.all})` },
          { id: "Full Mock", label: `Full Mock (${testTypeCounts["Full Mock"] || 0})` },
          { id: "Sectional", label: `Sectional (${testTypeCounts["Sectional"] || 0})` },
          { id: "Topic Test", label: `Topic Drill (${testTypeCounts["Topic Test"] || 0})` },
          { id: "Previous Year Paper", label: `PYQ (${testTypeCounts["Previous Year Paper"] || 0})` },
        ].map((tab) => {
          const isActive = selectedTestType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                HapticService.lightTap();
                setSelectedTestType(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Search & Detailed Filter Card */}
      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search mock name, platform, weak areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Platform and Sorting controls */}
        <div className="grid grid-cols-2 gap-2">
          {/* Platform Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full bg-transparent font-extrabold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Platforms</option>
              {Object.keys(PLATFORMS).map((p) => (
                <option key={p} value={p}>
                  {PLATFORMS[p as PlatformId]?.name || p}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-transparent font-extrabold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Filter Chips Row (Last 7 Days, Top Scores, High Accuracy, etc.) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Quick Filter Attempts
          </span>
          {quickFilter !== "all" && (
            <button
              onClick={() => {
                HapticService.lightTap();
                setQuickFilter("all");
              }}
              className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All", icon: "📋", count: quickFilterCounts.all },
            { id: "last7", label: "Last 7 Days", icon: "⚡", count: quickFilterCounts.last7 },
            { id: "last30", label: "Last 30 Days", icon: "🗓️", count: quickFilterCounts.last30 },
            { id: "topScores", label: "Top Scores", icon: "🏆", count: quickFilterCounts.topScores },
            { id: "highAccuracy", label: "Accuracy 85%+", icon: "🎯", count: quickFilterCounts.highAccuracy },
            { id: "needsReview", label: "Needs Review", icon: "⚠️", count: quickFilterCounts.needsReview },
          ].map((chip) => {
            const isActive = quickFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  HapticService.selection();
                  setQuickFilter(chip.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs ring-2 ring-blue-500/50"
                    : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Mock Records List (Matching Screenshot 5 & 6) */}
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
                className="card-luminous rounded-2xl p-4 sm:p-5 transition-all space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlatformLogo platformId={mock.platform} size="lg" />
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                        {mock.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-0.5">
                        <span className="capitalize">{platformInfo.name}</span>
                        <span>•</span>
                        <span className="tabular-nums">{mock.date}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-bold text-slate-600 dark:text-slate-400">
                          {mock.testType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums font-display">
                      {mock.score}{" "}
                      <span className="text-xs font-bold text-slate-400 font-sans">/ {mock.maxMarks}</span>
                    </div>
                    <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {pct}%
                    </div>
                  </div>
                </div>

                {/* Sub Stats Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {mock.accuracy !== undefined && (
                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 tabular-nums">
                      Accuracy: <strong className="text-slate-900 dark:text-slate-100">{mock.accuracy}%</strong>
                    </span>
                  )}
                  {mock.rank !== undefined && (
                    <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-200/60 dark:border-amber-800">
                      Rank: #{mock.rank}
                    </span>
                  )}
                  {mock.difficulty && (
                    <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200/60 dark:border-purple-800">
                      {mock.difficulty}
                    </span>
                  )}
                  {mock.weakAreas && mock.weakAreas.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      <span className="text-slate-400 text-xs">Weak:</span>
                      {mock.weakAreas.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-extrabold border border-rose-200/60 dark:border-rose-900"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes & Reflections / Takeaways Banner */}
                {mock.notes && mock.notes.trim() && (
                  <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/60 text-xs flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                        Test Takeaway &amp; Reflection
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold leading-relaxed whitespace-pre-wrap break-words">
                        {mock.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Controls */}
                <div className="flex items-center justify-between pt-1">
                  {deleteConfirmId === mock.id ? (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/70 p-2 rounded-2xl border border-rose-200 dark:border-rose-800 w-full justify-between">
                      <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                        Delete this attempt record?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => confirmDelete(mock.id)}
                          className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-xl cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => {
                          HapticService.lightTap();
                          onEditMock(mock);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Mock"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          HapticService.lightTap();
                          setDeleteConfirmId(mock.id);
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

      {/* Bulk Log CSV Import Modal */}
      {isBulkModalOpen && onBulkAddAttempts && (
        <BulkLogModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          activeExam={activeExam}
          onBulkAddAttempts={onBulkAddAttempts}
        />
      )}
    </div>
  );
};
