import React, { useState, useMemo } from "react";
import { MockAttempt, ExamProfile, PlatformId, CandidateProfile } from "../types";
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
  Eye,
  BookOpen,
  BarChart3,
  Check,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { FileService } from "../services/FileService";
import { HapticService } from "../services/HapticService";
import { downloadBilingualReportPDF } from "../utils/pdfExport";
import { EmptyState } from "./EmptyState";
import { PlatformLogo } from "./PlatformLogo";
import { BulkLogModal } from "./BulkLogModal";
import { MockDetailModal } from "./MockDetailModal";
import { MockComparisonModal } from "./MockComparisonModal";
import { Doodle3DScorecard, Doodle3DTarget } from "./Doodles3D";
import { MascotCharacter } from "./MascotCharacter";

interface HistoryScreenProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  candidate?: CandidateProfile;
  onEditMock: (mock: MockAttempt) => void;
  onDeleteMock: (id: string) => void;
  onOpenLogModal: () => void;
  onBulkAddAttempts?: (attempts: Omit<MockAttempt, "id">[]) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  attempts,
  activeExam,
  candidate = {
    name: "Aspirant",
    targetExam: "",
    streak: 1,
    totalTimeSpentMinutes: 0,
    avatarSeed: "aspirant",
    activeExamProfileId: "",
    theme: "system" as const,
    showSplashOnStartup: false,
  },
  onEditMock,
  onDeleteMock,
  onOpenLogModal,
  onBulkAddAttempts,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState<boolean>(false);
  const [selectedMockForDetail, setSelectedMockForDetail] = useState<MockAttempt | null>(null);

  // Visual Comparison State
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  const examMocks = useMemo(() => {
    return attempts.filter((a) => a.profileId === activeExam.id);
  }, [attempts, activeExam.id]);

  // Toggle mock selection for comparison (max 2)
  const handleToggleCompareSelection = (mockId: string) => {
    HapticService.selection();
    setSelectedCompareIds((prev) => {
      if (prev.includes(mockId)) {
        return prev.filter((id) => id !== mockId);
      }
      if (prev.length >= 2) {
        // If already 2 selected, replace the second one
        return [prev[0], mockId];
      }
      return [...prev, mockId];
    });
  };

  const handleOpenComparison = () => {
    if (selectedCompareIds.length === 2) {
      HapticService.achievement();
      setIsComparisonModalOpen(true);
    }
  };

  const handleExitCompareMode = () => {
    HapticService.lightTap();
    setIsCompareMode(false);
    setSelectedCompareIds([]);
  };

  // Selected mock objects for comparison
  const mockA = useMemo(
    () => attempts.find((m) => m.id === selectedCompareIds[0]),
    [attempts, selectedCompareIds]
  );
  const mockB = useMemo(
    () => attempts.find((m) => m.id === selectedCompareIds[1]),
    [attempts, selectedCompareIds]
  );

  // Extract all unique available subjects for this exam & attempts
  const availableSubjects = useMemo(() => {
    const subjectMap = new Map<string, number>();

    // From activeExam config
    if (activeExam.subjects && activeExam.subjects.length > 0) {
      activeExam.subjects.forEach((s) => {
        if (s.name && !subjectMap.has(s.name)) {
          subjectMap.set(s.name, 0);
        }
      });
    }

    // Tally occurrence in actual mock attempts
    examMocks.forEach((mock) => {
      if (mock.sections && mock.sections.length > 0) {
        mock.sections.forEach((sec) => {
          if (sec.name) {
            subjectMap.set(sec.name, (subjectMap.get(sec.name) || 0) + 1);
          }
        });
      }
    });

    return Array.from(subjectMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [activeExam.subjects, examMocks]);

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
          const matchesPlatform = (PLATFORMS[mock.platform as PlatformId]?.name || mock.platform).toLowerCase().includes(q);
          const matchesWeak = (mock.weakAreas || []).some((w) => w.toLowerCase().includes(q));
          const matchesNotes = (mock.notes || "").toLowerCase().includes(q);
          if (!matchesTitle && !matchesPlatform && !matchesWeak && !matchesNotes) return false;
        }
        // Platform filter
        if (selectedPlatform !== "all" && mock.platform !== selectedPlatform) {
          return false;
        }
        // Subject filter (allows users to view attempts by specific subjects)
        if (selectedSubject !== "all") {
          const subLower = selectedSubject.toLowerCase();
          const hasSection = (mock.sections || []).some(
            (sec) => sec.name.toLowerCase() === subLower
          );
          const hasTitle = mock.title.toLowerCase().includes(subLower);
          const hasWeak = (mock.weakAreas || []).some((w) =>
            w.toLowerCase().includes(subLower)
          );
          if (!hasSection && !hasTitle && !hasWeak) return false;
        }
        // Test type filter
        if (selectedTestType !== "all" && mock.testType !== selectedTestType) {
          return false;
        }
        // Filter options combined into sorting selector
        if (sortBy === "last7") {
          const mDate = new Date(mock.date + "T00:00:00").getTime();
          const diffDays = (now - mDate) / (1000 * 60 * 60 * 24);
          if (!(diffDays >= -1 && diffDays <= 7)) return false;
        } else if (sortBy === "last30") {
          const mDate = new Date(mock.date + "T00:00:00").getTime();
          const diffDays = (now - mDate) / (1000 * 60 * 60 * 24);
          if (!(diffDays >= -1 && diffDays <= 30)) return false;
        } else if (sortBy === "topScores") {
          if (!(mock.score >= target || (mock.maxMarks > 0 && (mock.score / mock.maxMarks) >= 0.75))) return false;
        } else if (sortBy === "highAccuracy") {
          if (mock.accuracy < 85) return false;
        } else if (sortBy === "needsReview") {
          if (!((mock.weakAreas && mock.weakAreas.length > 0) || mock.accuracy < 70)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === "highest" || sortBy === "topScores") return b.score - a.score;
        if (sortBy === "lowest") return a.score - b.score;
        if (sortBy === "highAccuracy") return b.accuracy - a.accuracy;
        // Default: newest first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [examMocks, searchTerm, selectedPlatform, selectedSubject, selectedTestType, sortBy, activeExam]);

  // Subject-specific granular diagnostics when a subject is filtered
  const subjectStats = useMemo(() => {
    if (selectedSubject === "all") return null;
    const subLower = selectedSubject.toLowerCase();
    const matchingSections: { score: number; maxMarks: number; accuracy?: number }[] = [];

    filteredMocks.forEach((m) => {
      const sec = (m.sections || []).find((s) => s.name.toLowerCase() === subLower);
      if (sec) {
        matchingSections.push({
          score: sec.score,
          maxMarks: sec.maxMarks,
          accuracy: sec.accuracy,
        });
      }
    });

    if (matchingSections.length === 0) return null;

    const totalSubScore = matchingSections.reduce((acc, s) => acc + s.score, 0);
    const avgSubScore = Math.round((totalSubScore / matchingSections.length) * 10) / 10;
    const bestSubScore = Math.max(...matchingSections.map((s) => s.score));
    const maxMarks = matchingSections[0]?.maxMarks || 50;
    const accuracies = matchingSections.filter((s) => typeof s.accuracy === "number").map((s) => s.accuracy!);
    const avgAccuracy = accuracies.length > 0 
      ? Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
      : Math.round((avgSubScore / maxMarks) * 100);

    return {
      name: selectedSubject,
      count: matchingSections.length,
      avgScore: avgSubScore,
      bestScore: bestSubScore,
      maxMarks,
      avgAccuracy,
    };
  }, [selectedSubject, filteredMocks]);

  const handleExportCSV = () => {
    HapticService.lightTap();
    FileService.exportMocksCSV(filteredMocks);
  };

  const handleExportPDF = () => {
    HapticService.achievement();
    downloadBilingualReportPDF(candidate, activeExam, examMocks);
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
              title="Import / Export Data"
              aria-label="Import or Export Data"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {isDataMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDataMenuOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDataMenuOpen(false);
                      handleExportPDF();
                    }}
                    disabled={examMocks.length === 0}
                    className="w-full px-2.5 py-2 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer disabled:opacity-40"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Export Full PDF Report</span>
                  </button>

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

        <div className="flex items-center gap-2">
          {/* Visual Comparison Toggle Button */}
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              if (isCompareMode) {
                handleExitCompareMode();
              } else {
                setIsCompareMode(true);
              }
            }}
            disabled={examMocks.length < 2}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all ${
              isCompareMode
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30"
                : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800"
            } disabled:opacity-40`}
            title={examMocks.length < 2 ? "Log at least 2 mocks to compare" : "Visual Mock Comparison"}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>{isCompareMode ? "Comparing" : "Compare"}</span>
            {isCompareMode && selectedCompareIds.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center">
                {selectedCompareIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={examMocks.length === 0}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all disabled:opacity-40"
            title="Download Complete Performance PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">PDF Report</span>
          </button>
        </div>
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

        {/* Platform, Subject, and Sorting controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Subject Filter (Specific subject breakdown review) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <select
              value={selectedSubject}
              onChange={(e) => {
                HapticService.lightTap();
                setSelectedSubject(e.target.value);
              }}
              className="w-full bg-transparent font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs truncate"
              title="Filter by Subject"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub.name} value={sub.name}>
                  {sub.name} {sub.count > 0 ? `(${sub.count})` : ""}
                </option>
              ))}
            </select>
          </div>

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

          {/* Sort & Filter By (Unified Selector defaulting to Newest First) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-transparent font-black text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest">Sort: Newest First (Default)</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest">Sort: Highest Score</option>
              <option value="lowest">Sort: Lowest Score</option>
              <option value="last7">Filter: Last 7 Days</option>
              <option value="last30">Filter: Last 30 Days</option>
              <option value="topScores">Filter: Top Scores (≥ Target)</option>
              <option value="highAccuracy">Filter: High Accuracy (85%+)</option>
              <option value="needsReview">Filter: Needs Review / Mistakes</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4.5. Granular Subject Diagnostic Banner (Visible when subject is filtered) */}
      {selectedSubject !== "all" && subjectStats && (
        <div className="card-luminous rounded-2xl p-3.5 sm:p-4 border border-indigo-200/80 dark:border-indigo-800/70 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-blue-950/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 hidden sm:block">
              <MascotCharacter pose="analyzing" size={56} />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Subject Breakdown
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate font-display">
                  {selectedSubject}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-bold flex-wrap tabular-nums pt-0.5">
                <span>{subjectStats.count} Attempts</span>
                <span>•</span>
                <span>Avg: <strong className="text-indigo-600 dark:text-indigo-400">{subjectStats.avgScore}</strong>/{subjectStats.maxMarks}</span>
                <span>•</span>
                <span>PB: <strong className="text-emerald-600 dark:text-emerald-400">{subjectStats.bestScore}</strong>/{subjectStats.maxMarks}</span>
                <span>•</span>
                <span>Acc: <strong className="text-slate-800 dark:text-slate-200">{subjectStats.avgAccuracy}%</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setSelectedSubject("all");
            }}
            className="px-2.5 py-1 text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/70 dark:hover:bg-indigo-950 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* 4.7. Visual Mock Comparison Active Banner */}
      {isCompareMode && (
        <div className="card-luminous rounded-2xl p-3.5 sm:p-4 border-2 border-indigo-500/80 dark:border-indigo-500/80 bg-gradient-to-r from-indigo-50/90 via-white to-emerald-50/70 dark:from-indigo-950/60 dark:via-slate-900 dark:to-emerald-950/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-display">
                  Select 2 Mocks to Compare
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {selectedCompareIds.length} / 2 Selected
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {selectedCompareIds.length === 0
                  ? "Tap any 2 attempts below to compare their scores and sectional breakdown."
                  : selectedCompareIds.length === 1
                  ? "Selected 1 mock! Now tap a second mock attempt to compare."
                  : "Both selected! Click Compare Side-by-Side to see scores and bar charts."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 justify-end">
            <button
              type="button"
              onClick={handleOpenComparison}
              disabled={selectedCompareIds.length !== 2}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all font-display"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Compare Side-by-Side</span>
            </button>

            <button
              type="button"
              onClick={handleExitCompareMode}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 5. Mock Records List */}
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
            const targetScore = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.75);
            const targetDiff = Math.round((mock.score - targetScore) * 10) / 10;
            const isTargetReached = targetDiff >= 0;
            const isSelectedForCompare = selectedCompareIds.includes(mock.id);
            const compareIndex = selectedCompareIds.indexOf(mock.id);

            return (
              <div
                key={mock.id}
                onClick={() => {
                  if (isCompareMode) {
                    handleToggleCompareSelection(mock.id);
                  }
                }}
                className={`card-luminous rounded-2xl p-4 sm:p-5 transition-all space-y-3 relative overflow-hidden ${
                  isCompareMode
                    ? isSelectedForCompare
                      ? "ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md cursor-pointer"
                      : "hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                    : "hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Compare Selection Checkbox Pill */}
                    {isCompareMode && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompareSelection(mock.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer ${
                          isSelectedForCompare
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs scale-105"
                            : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 bg-white dark:bg-slate-800"
                        }`}
                        title={isSelectedForCompare ? "Deselect" : "Select for comparison"}
                      >
                        {isSelectedForCompare ? (
                          <span className="text-[11px] font-black font-display">
                            {compareIndex + 1}
                          </span>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </div>
                    )}

                    <PlatformLogo platformId={mock.platform} size="lg" />
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate">
                        {mock.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-0.5 flex-wrap">
                        <span className="capitalize">{mock.customPlatformName || platformInfo.name}</span>
                        <span>•</span>
                        <span className="tabular-nums">{mock.date}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-bold text-slate-600 dark:text-slate-400">
                          {mock.customTestType || mock.testType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Target Reached Indicator (No percentage clutter) */}
                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums font-display">
                      {mock.score}{" "}
                      <span className="text-xs font-bold text-slate-400 font-sans">/ {mock.maxMarks}</span>
                    </div>
                    <div
                      className={`text-[11px] font-black tabular-nums flex items-center justify-end gap-1 ${
                        isTargetReached
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {isTargetReached ? (
                        <span>+{targetDiff} Target Met 🎯</span>
                      ) : (
                        <span>{targetDiff} to Target</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Granular Subject Performance Highlight when filtered */}
                {selectedSubject !== "all" && (() => {
                  const sec = (mock.sections || []).find(
                    (s) => s.name.toLowerCase() === selectedSubject.toLowerCase()
                  );
                  if (!sec) return null;
                  const secPct = sec.maxMarks > 0 ? Math.round((sec.score / sec.maxMarks) * 100) : 0;
                  return (
                    <div className="p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>{selectedSubject} Score:</span>
                      </div>
                      <div className="font-display font-black text-indigo-700 dark:text-indigo-300 tabular-nums">
                        {sec.score} / {sec.maxMarks}{" "}
                        <span className="text-[11px] font-sans font-bold text-indigo-500 dark:text-indigo-400">
                          ({sec.accuracy !== undefined ? sec.accuracy : secPct}% accuracy)
                        </span>
                      </div>
                    </div>
                  );
                })()}

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
                  {mock.sections && mock.sections.length > 0 && (
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200/60 dark:border-indigo-800 text-[10px]">
                      {mock.sections.length} Sections
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

                {/* Card Controls with View Details & Compare */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        HapticService.selection();
                        setSelectedMockForDetail(mock);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700 text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                      <span>View Details</span>
                    </button>

                    {/* Quick Compare Trigger from individual card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        HapticService.selection();
                        if (!isCompareMode) {
                          setIsCompareMode(true);
                          setSelectedCompareIds([mock.id]);
                        } else {
                          handleToggleCompareSelection(mock.id);
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${
                        isSelectedForCompare
                          ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200/60 dark:border-slate-700"
                      }`}
                      title="Compare this mock with another"
                    >
                      <ArrowLeftRight className="w-3 h-3 text-indigo-500" />
                      <span className="hidden sm:inline">
                        {isSelectedForCompare ? "Selected" : "Compare"}
                      </span>
                    </button>
                  </div>

                  {deleteConfirmId === mock.id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/70 p-1.5 rounded-2xl border border-rose-200 dark:border-rose-800"
                    >
                      <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                        Delete?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => confirmDelete(mock.id)}
                          className="px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded-xl cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 ml-auto"
                    >
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

      {/* Visual Mock Comparison Side-by-Side Modal */}
      {isComparisonModalOpen && mockA && mockB && (
        <MockComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          mockA={mockA}
          mockB={mockB}
          activeExam={activeExam}
        />
      )}

      {/* Mock Detail Pop-up Modal */}
      {selectedMockForDetail && (
        <MockDetailModal
          isOpen={!!selectedMockForDetail}
          onClose={() => setSelectedMockForDetail(null)}
          mock={selectedMockForDetail}
          candidate={candidate}
          activeExam={activeExam}
          onEditMock={(m) => {
            setSelectedMockForDetail(null);
            onEditMock(m);
          }}
        />
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
