import React, { useState } from "react";
import {
  CandidateProfile,
  MistakeReviewItem,
  MockAttempt,
  AchievementBadge,
} from "../types";
import { ACHIEVEMENTS_LIST } from "../data/mockSeedData";
import {
  Award,
  Flame,
  CheckCircle2,
  Sparkles,
  Plus,
  Filter,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  X,
  Target,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ReviewScreenProps {
  candidate: CandidateProfile;
  mistakes: MistakeReviewItem[];
  attempts: MockAttempt[];
  onToggleReviewMistake: (mistakeId: string) => void;
  onAddMistake: (item: Omit<MistakeReviewItem, "id">) => void;
  onSelectTab: (tab: any) => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  candidate,
  mistakes,
  attempts,
  onToggleReviewMistake,
  onAddMistake,
  onSelectTab,
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed" | "badges" | "all">("pending");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state for adding mistake
  const [mockId, setMockId] = useState<string>(attempts[0]?.id || "");
  const [subject, setSubject] = useState<
    "Quantitative Aptitude" | "Reasoning Ability" | "English Comprehension" | "General Awareness"
  >("Quantitative Aptitude");
  const [questionSnippet, setQuestionSnippet] = useState<string>("");
  const [errorCategory, setErrorCategory] = useState<
    "Calculation Error" | "Formula / Concept Flaw" | "Misread Question" | "Time Rush" | "Wild Guess"
  >("Calculation Error");
  const [takeawayNote, setTakeawayNote] = useState<string>("");

  // XP & Level calculations
  const totalXp = candidate.reviewPoints || 0;
  const currentLevel = Math.floor(totalXp / 100) + 1;
  const xpInCurrentLevel = totalXp % 100;
  const nextLevelXp = 100;

  // Level titles
  const levelTitles: Record<number, string> = {
    1: "Novice Reviewer",
    2: "Mistake Surgeon",
    3: "Error Eradicator",
    4: "Master Analyst",
    5: "Cutoff Conqueror",
  };
  const levelTitle = levelTitles[currentLevel] || "Cutoff Conqueror";

  // Filtered mistakes
  const filteredMistakes = mistakes.filter((m) => {
    if (activeTab === "pending" && m.isReviewed) return false;
    if (activeTab === "reviewed" && !m.isReviewed) return false;
    if (selectedSubject !== "all" && m.subject !== selectedSubject) return false;
    return true;
  });

  const pendingCount = mistakes.filter((m) => !m.isReviewed).length;
  const reviewedCount = mistakes.filter((m) => m.isReviewed).length;

  const handleCreateMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionSnippet.trim() || !takeawayNote.trim()) return;

    const selectedMock = attempts.find((a) => a.id === mockId);
    onAddMistake({
      mockId,
      mockTitle: selectedMock ? selectedMock.title : "Custom Mock",
      subject,
      questionSnippet,
      errorCategory,
      takeawayNote,
      isReviewed: false,
    });

    // Reset form
    setQuestionSnippet("");
    setTakeawayNote("");
    setShowAddModal(false);
  };

  const getSubjectBadgeColor = (subj: string) => {
    switch (subj) {
      case "Quantitative Aptitude":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "Reasoning Ability":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "English Comprehension":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "General Awareness":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
    }
  };

  const getErrorCategoryBg = (cat: string) => {
    switch (cat) {
      case "Calculation Error":
        return "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800";
      case "Formula / Concept Flaw":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "Time Rush":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Wild Guess":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto">
      {/* Gamified Level & XP Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 shadow-lg border border-indigo-700/50">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none translate-x-4 -translate-y-4">
          <Award className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Level {currentLevel}
              </span>
              <span className="text-xs font-semibold text-indigo-200">
                {levelTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-700/60 text-xs font-extrabold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{candidate.reviewStreakDays || 1} Day Streak</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              Gamified Review Center
            </h2>
            <div className="text-right">
              <span className="text-lg font-black text-amber-300">{totalXp}</span>
              <span className="text-xs text-indigo-300"> XP</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-indigo-200">
              <span>Next Level Progress</span>
              <span>
                {xpInCurrentLevel} / {nextLevelXp} XP
              </span>
            </div>
            <div className="w-full bg-indigo-950/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-indigo-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(xpInCurrentLevel / nextLevelXp) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-indigo-200/90 leading-tight">
              Earn <strong className="text-amber-300">+10 XP</strong> per reviewed mistake and unlock exam readiness badges!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Log Mistake
            </button>
          </div>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "pending"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab("reviewed")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "reviewed"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Reviewed ({reviewedCount})
        </button>

        <button
          onClick={() => setActiveTab("badges")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "badges"
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          Badges ({ACHIEVEMENTS_LIST.length})
        </button>
      </div>

      {/* Subject Filter Chips (Only shown when viewing mistakes) */}
      {activeTab !== "badges" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["all", "Quantitative Aptitude", "Reasoning Ability", "English Comprehension", "General Awareness"].map((subj) => {
            const labelMap: Record<string, string> = {
              all: "All Subjects",
              "Quantitative Aptitude": "Quant",
              "Reasoning Ability": "Reasoning",
              "English Comprehension": "English",
              "General Awareness": "GA",
            };

            const isSelected = selectedSubject === subj;
            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {labelMap[subj] || subj}
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      {activeTab === "badges" ? (
        /* Achievements / Badges Showcase Grid */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Achievements & Unlocked Badges
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {(candidate.unlockedBadgeIds || []).length} / {ACHIEVEMENTS_LIST.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACHIEVEMENTS_LIST.map((badge) => {
              const isUnlocked = (candidate.unlockedBadgeIds || []).includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isUnlocked
                      ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-sm"
                      : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                        isUnlocked
                          ? "bg-amber-100 dark:bg-amber-900/50 shadow-inner"
                          : "bg-slate-100 dark:bg-slate-800 grayscale"
                      }`}
                    >
                      {badge.icon}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {badge.title}
                        </h4>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            isUnlocked
                              ? "bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          +{badge.xpReward} XP
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight">
                        {badge.description}
                      </p>

                      <div className="pt-1.5 flex items-center justify-between text-[10px]">
                        <span
                          className={`font-bold ${
                            isUnlocked ? "text-amber-700 dark:text-amber-400" : "text-slate-400"
                          }`}
                        >
                          {isUnlocked ? "✓ Unlocked" : "Locked"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Mistake Review Queue List */
        <div className="space-y-3">
          {filteredMistakes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {activeTab === "pending" ? "Zero Pending Errors!" : "No Reviewed Mistakes Yet"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {activeTab === "pending"
                  ? "You have analyzed all logged mistake items for this filter! Click 'Log Mistake' above to add specific speed traps or questions to analyze."
                  : "Start reviewing your pending incorrect questions to earn XP and unlock mastery badges."}
              </p>
            </div>
          ) : (
            filteredMistakes.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-4 shadow-sm space-y-3 ${
                    item.isReviewed
                      ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getSubjectBadgeColor(
                          item.subject
                        )}`}
                      >
                        {item.subject}
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getErrorCategoryBg(
                          item.errorCategory
                        )}`}
                      >
                        {item.errorCategory}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {item.mockTitle}
                    </span>
                  </div>

                  {/* Question Snippet */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Question / Topic
                    </span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {item.questionSnippet}
                    </p>
                  </div>

                  {/* Corrective Logic / Takeaway Note */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      Correct Concept & Takeaway
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {item.takeawayNote}
                    </p>
                  </div>

                  {/* Review Action Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400">
                      {item.isReviewed
                        ? `Reviewed on ${item.reviewedAt || "Today"}`
                        : "Awaiting Analysis"}
                    </span>

                    <button
                      onClick={() => onToggleReviewMistake(item.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                        item.isReviewed
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      }`}
                    >
                      {item.isReviewed ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          Mark Unreviewed
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                          Mark Analyzed (+10 XP)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Mistake Analysis Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-md shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Log Mistake Analysis
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMistake} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Mock Test
                  </label>
                  <select
                    value={mockId}
                    onChange={(e) => setMockId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {attempts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Quantitative Aptitude">Quant</option>
                      <option value="Reasoning Ability">Reasoning</option>
                      <option value="English Comprehension">English</option>
                      <option value="General Awareness">General Awareness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Error Type
                    </label>
                    <select
                      value={errorCategory}
                      onChange={(e) => setErrorCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Calculation Error">Calculation Error</option>
                      <option value="Formula / Concept Flaw">Formula / Concept Flaw</option>
                      <option value="Misread Question">Misread Question</option>
                      <option value="Time Rush">Time Rush</option>
                      <option value="Wild Guess">Wild Guess</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question / Speed Trap Snippet
                  </label>
                  <input
                    type="text"
                    value={questionSnippet}
                    onChange={(e) => setQuestionSnippet(e.target.value)}
                    placeholder="e.g. Incircle radius calculation of right angled triangle"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correct Concept & Takeaway Lesson
                  </label>
                  <textarea
                    value={takeawayNote}
                    onChange={(e) => setTakeawayNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Use direct formula r = (a + b - c)/2 to save 1.5 minutes!"
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
                  >
                    Save Mistake Takeaway
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
