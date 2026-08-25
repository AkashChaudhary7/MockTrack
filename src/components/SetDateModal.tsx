import React, { useState } from "react";
import { ExamProfile } from "../types";
import { motion } from "motion/react";
import { X, Calendar, Target } from "lucide-react";

interface SetDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: ExamProfile;
  onSaveDate: (examId: string, examDate: string | undefined) => void;
}

export const SetDateModal: React.FC<SetDateModalProps> = ({
  isOpen,
  onClose,
  activeExam,
  onSaveDate,
}) => {
  const [examDate, setExamDate] = useState<string>(activeExam.examDate || "2026-09-17");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDate(activeExam.id, examDate || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
              Set Target Exam Date
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
              {activeExam.name} Exam Date
            </label>
            <input
              type="date"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Configuring the target date powers the countdown pill (🎯 X Days Left) in the app header.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 text-xs font-bold text-slate-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Save Target Date
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
