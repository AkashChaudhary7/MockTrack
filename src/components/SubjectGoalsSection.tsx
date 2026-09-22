import React, { useState } from "react";
import { ExamProfile, MockAttempt, SubjectGoal } from "../types";
import { Target, Plus, Trash2, Edit3, X, Sparkles } from "lucide-react";
import { HapticService } from "../services/HapticService";
import { getSubjectsForProfile } from "../data/allExamsCatalog";

interface SubjectGoalsSectionProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onUpdateExamProfile: (updatedProfile: ExamProfile) => void;
  onOpenLogModal?: () => void;
}

export const SubjectGoalsSection: React.FC<SubjectGoalsSectionProps> = ({
  activeExam,
  attempts,
  onUpdateExamProfile,
}) => {
  const currentGoals = activeExam.subjectGoals || [];
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Modal form state
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
  const [customSubjectName, setCustomSubjectName] = useState<string>("");
  const [targetScore, setTargetScore] = useState<string>("45");
  const [maxMarks, setMaxMarks] = useState<string>("50");

  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);

  // Suggested subjects based on active exam profile config
  const profileSubjects = getSubjectsForProfile(activeExam);
  const defaultSuggestions = profileSubjects.map((s) => s.name);

  // Available suggestions (exclude those already added)
  const availableSuggestions = defaultSuggestions.filter(
    (name) => !currentGoals.some((g) => g.subjectName.toLowerCase() === name.toLowerCase())
  );

  const handleOpenAddModal = (existingGoal?: SubjectGoal) => {
    HapticService.lightTap();
    if (existingGoal) {
      setEditingGoalId(existingGoal.id);
      setSelectedSubjectName(existingGoal.subjectName);
      setCustomSubjectName("");
      setTargetScore(String(existingGoal.targetScore));
      setMaxMarks(String(existingGoal.maxMarks));
    } else {
      setEditingGoalId(null);
      const initialSubject = availableSuggestions[0] || "custom";
      setSelectedSubjectName(initialSubject);
      setCustomSubjectName("");
      setTargetScore(String(Math.round((activeExam.totalMarks / 4) * 0.8) || 45));
      setMaxMarks(String(Math.round(activeExam.totalMarks / 4) || 50));
    }
    setIsAddModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubjectName =
      selectedSubjectName === "custom"
        ? customSubjectName.trim()
        : selectedSubjectName.trim();

    if (!finalSubjectName) return;

    const numTarget = parseFloat(targetScore) || 0;
    const numMax = parseFloat(maxMarks) || 50;

    let updatedGoals: SubjectGoal[];
    if (editingGoalId) {
      updatedGoals = currentGoals.map((g) =>
        g.id === editingGoalId
          ? { ...g, subjectName: finalSubjectName, targetScore: numTarget, maxMarks: numMax }
          : g
      );
    } else {
      const newGoal: SubjectGoal = {
        id: `goal-${Date.now()}`,
        subjectName: finalSubjectName,
        targetScore: numTarget,
        maxMarks: numMax,
      };
      updatedGoals = [...currentGoals, newGoal];
    }

    HapticService.success();
    onUpdateExamProfile({
      ...activeExam,
      subjectGoals: updatedGoals,
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    HapticService.lightTap();
    const updatedGoals = currentGoals.filter((g) => g.id !== id);
    onUpdateExamProfile({
      ...activeExam,
      subjectGoals: updatedGoals,
    });
  };

  // Compute stats per goal
  const goalItems = currentGoals.map((goal) => {
    const matchingScores: number[] = [];
    const queryLower = goal.subjectName.toLowerCase().trim();

    examAttempts.forEach((att) => {
      if (att.sections && att.sections.length > 0) {
        const foundSec = att.sections.find((sec) => {
          const sName = sec.name.toLowerCase().trim();
          return sName === queryLower || sName.includes(queryLower) || queryLower.includes(sName);
        });
        if (foundSec && typeof foundSec.score === "number") {
          matchingScores.push(foundSec.score);
        }
      }
    });

    const hasData = matchingScores.length > 0;
    const latestScore = hasData ? matchingScores[0] : 0;
    const avgScore = hasData
      ? Number((matchingScores.reduce((acc, s) => acc + s, 0) / matchingScores.length).toFixed(1))
      : 0;

    return {
      ...goal,
      hasData,
      currentScore: hasData ? latestScore : 0,
      avgScore,
    };
  });

  return (
    <div className="space-y-2.5">
      {/* Header with compact + Add Subject action */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-indigo-600" />
          <span>Subject Milestones &amp; Goals</span>
        </h3>

        <button
          type="button"
          onClick={() => handleOpenAddModal()}
          className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Subject</span>
        </button>
      </div>

      {/* Body: Show ONLY subjects with goals */}
      {goalItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-center shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
            No subject milestones set. Add subjects you want to set specific score targets for.
          </p>
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-black border border-indigo-200/80 dark:border-indigo-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Subject</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
          {goalItems.map((goal) => (
            <div
              key={goal.id}
              className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
            >
              {/* Minimalist Subject Name */}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                  {goal.subjectName}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {goal.hasData ? `Current: ${goal.currentScore}` : "No mocks logged"}
                </span>
              </div>

              {/* Minimalist Current / Target Score Display */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {goal.hasData ? goal.currentScore : "--"} / {goal.targetScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 block">
                    Target Score
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal(goal)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Edit Goal"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                {editingGoalId ? "Edit Subject Goal" : "Add Subject Goal"}
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Subject
                </label>
                <select
                  value={selectedSubjectName}
                  onChange={(e) => setSelectedSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  {availableSuggestions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="custom">+ Custom Subject...</option>
                </select>
              </div>

              {selectedSubjectName === "custom" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Custom Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Current Affairs"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Score
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="45"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-indigo-600 dark:text-indigo-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="50"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
