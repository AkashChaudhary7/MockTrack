import React, { useState } from "react";
import { ExamProfile } from "../types";
import { motion } from "motion/react";
import { X, Plus, Sparkles } from "lucide-react";

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: ExamProfile) => void;
}

export const AddProfileModal: React.FC<AddProfileModalProps> = ({
  isOpen,
  onClose,
  onAddProfile,
}) => {
  const [name, setName] = useState<string>("");
  const [shortCode, setShortCode] = useState<string>("");
  const [totalMarks, setTotalMarks] = useState<number>(200);
  const [duration, setDuration] = useState<number>(60);
  const [penaltyRatio, setPenaltyRatio] = useState<number>(0.5);
  const [examDate, setExamDate] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `profile-${Date.now()}`;
    const code = shortCode.trim() || name.split(" ")[0];

    onAddProfile({
      id: newId,
      name: name.trim(),
      shortCode: code,
      totalMarks: Number(totalMarks),
      defaultDurationMinutes: Number(duration),
      examDate: examDate || undefined,
      negativeMarkingRatio: Number(penaltyRatio),
      isSelected: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
              Add Target Exam Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Full Exam Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. IBPS RRB PO 2026 Mains"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Short Badge Code
              </label>
              <input
                type="text"
                placeholder="e.g. RRB PO"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Total Exam Marks
              </label>
              <input
                type="number"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 200)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Neg Marking Penalty
              </label>
              <select
                value={penaltyRatio}
                onChange={(e) => setPenaltyRatio(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-xs"
              >
                <option value={0.5}>-0.5 Marks (SSC Tier 1)</option>
                <option value={0.25}>-0.25 Marks (IBPS Bank PO)</option>
                <option value={0.33}>-0.33 Marks (1/3rd Penalty)</option>
                <option value={0.66}>-0.66 Marks (UPSC GS-1)</option>
                <option value={0}>0 (No Negative Penalty)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Target Exam Date (Optional)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border font-bold text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 text-xs font-bold text-slate-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Create Profile</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
