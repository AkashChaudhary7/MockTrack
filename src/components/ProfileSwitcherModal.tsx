import React, { useState, useMemo } from "react";
import { ExamProfile, ExamCategory } from "../types";
import { MASTER_EXAM_CATALOG, EXAM_CATEGORIES } from "../data/allExamsCatalog";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckCircle2,
  Search,
  Plus,
  Sparkles,
  SlidersHorizontal,
  BookmarkCheck,
} from "lucide-react";
import { HapticService } from "../services/HapticService";

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  examProfiles: ExamProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSelectCatalogExam?: (profile: ExamProfile) => void;
  onOpenAddModal: () => void;
  onOpenSetDateModal?: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  examProfiles,
  activeProfileId,
  onSelectProfile,
  onSelectCatalogExam,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | "ALL" | "POPULAR">("ALL");

  // Merge custom user-created profiles with master catalog
  const mergedCatalog = useMemo(() => {
    // Custom user profiles that are not in the master catalog
    const customUserProfiles = examProfiles.filter(
      (p) => !MASTER_EXAM_CATALOG.some((c) => c.id === p.id)
    );

    // Map master catalog with saved user overrides if any
    const catalogWithOverrides = MASTER_EXAM_CATALOG.map((catItem) => {
      const savedUserItem = examProfiles.find((p) => p.id === catItem.id);
      return savedUserItem || catItem;
    });

    return [...customUserProfiles, ...catalogWithOverrides];
  }, [examProfiles]);

  // Popular exams set for quick filter
  const popularExamIds = new Set([
    "dsssb-tgt-cs",
    "ssc-cgl-2026",
    "ibps-po-2026",
    "rpsc-ras-pre",
    "rssb-patwari",
    "upsc-cse-gs1",
    "uppcs-prelims",
    "upsssc-pet",
    "ctet-paper1",
    "rrb-ntpc-2026",
    "delhi-police-constable",
  ]);

  // Filtered exams list
  const filteredExams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return mergedCatalog.filter((exam) => {
      // Category check
      if (selectedCategory === "POPULAR") {
        if (!popularExamIds.has(exam.id) && !exam.isCustom) return false;
      } else if (selectedCategory === "CUSTOM") {
        if (!exam.isCustom && !examProfiles.some((p) => p.id === exam.id && p.isCustom)) return false;
      } else if (selectedCategory !== "ALL") {
        if (exam.category !== selectedCategory) return false;
      }

      // Search query check
      if (query) {
        const matchName = exam.name.toLowerCase().includes(query);
        const matchCode = exam.shortCode.toLowerCase().includes(query);
        const matchCat = (exam.category || "").toLowerCase().includes(query);
        const matchSubjects = (exam.subjects || []).some((s) => s.name.toLowerCase().includes(query));
        return matchName || matchCode || matchCat || matchSubjects;
      }

      return true;
    });
  }, [mergedCatalog, searchQuery, selectedCategory, examProfiles]);

  if (!isOpen) return null;

  const handleSelectExam = (exam: ExamProfile) => {
    HapticService.selection();
    if (onSelectCatalogExam) {
      onSelectCatalogExam(exam);
    } else {
      onSelectProfile(exam.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Minimalist Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 font-display">
                  Switch Target Exam Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Select your exam to adapt sectional mock tracking &amp; analysis
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimal Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UPSC, SSC, DSSSB, RPSC, RSSB, Bank, State..."
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 -mx-1 px-1">
            {EXAM_CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    HapticService.lightTap();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isCatActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className="text-[13px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimalist Icon-Wise List of Exams */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 space-y-1.5 custom-scrollbar">
          {filteredExams.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No exams matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  You can quickly create a custom exam profile with your specific subjects.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  HapticService.selection();
                  onClose();
                  onOpenAddModal();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30 cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Custom Exam Profile</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredExams.map((exam) => {
                const isSelected = exam.id === activeProfileId;
                const isSavedInUserList = examProfiles.some((p) => p.id === exam.id);

                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => handleSelectExam(exam)}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 active:scale-[0.98] ${
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs"
                        : "bg-white dark:bg-slate-950/50 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Icon + Exam Name */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Crisp Exam Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg border transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700"
                        }`}
                      >
                        {exam.icon || "📝"}
                      </div>

                      {/* Clean Exam Name */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4
                            className={`font-black text-xs sm:text-sm truncate transition-colors ${
                              isSelected
                                ? "text-indigo-900 dark:text-indigo-200"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {exam.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                          <span className="uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-extrabold">
                            {exam.category || exam.shortCode}
                          </span>
                          {exam.hasParts && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">2-Part Exam</span>
                            </>
                          )}
                          {exam.isCustom && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600 dark:text-purple-400 font-bold">Custom</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Minimal Active Indicator */}
                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      ) : isSavedInUserList ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Added
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Minimalist Bottom Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/90 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onClose();
              onOpenAddModal();
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Custom Exam Profile</span>
          </button>

          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {filteredExams.length} Exams available
          </p>
        </div>
      </motion.div>
    </div>
  );
};
