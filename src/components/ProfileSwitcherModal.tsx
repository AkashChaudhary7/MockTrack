import React, { useState } from "react";
import { ExamProfile } from "../types";
import { calculateDaysLeft } from "../utils/analytics";
import { motion } from "motion/react";
import { X, CheckCircle2, Calendar, Plus, Sparkles } from "lucide-react";

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  examProfiles: ExamProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenSetDateModal: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  examProfiles,
  activeProfileId,
  onSelectProfile,
  onOpenAddModal,
  onOpenSetDateModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Switch Target Exam Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isolate mock test logs &amp; baseline stats per exam
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {examProfiles.map((p) => {
            const isSelected = p.id === activeProfileId;
            const daysLeft = calculateDaysLeft(p.examDate);

            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProfile(p.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-500 dark:border-indigo-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-400"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {p.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Max Marks: {p.totalMarks} • Penalty: -{p.negativeMarkingRatio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <Calendar className="w-3.5 h-3.5" />
                  {daysLeft !== null ? <span>🎯 {daysLeft}d</span> : <span>Set Date</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenAddModal();
            }}
            className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Exam Profile</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSetDateModal();
            }}
            className="text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Set Target Exam Date</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
