import React, { useState } from "react";
import { motion } from "motion/react";
import { X, User } from "lucide-react";

interface NameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentGender?: "male" | "female";
  onSaveName: (name: string, gender?: "male" | "female") => void;
}

export const NameEditModal: React.FC<NameEditModalProps> = ({
  isOpen,
  onClose,
  currentName,
  currentGender = "male",
  onSaveName,
}) => {
  const [name, setName] = useState<string>(currentName);
  const [gender, setGender] = useState<"male" | "female">(currentGender);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSaveName(name.trim(), gender);
      onClose();
    }
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
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
              Edit Candidate Identity
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
              Candidate Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Aspirant Iconography
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  gender === "male"
                    ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span className="text-lg">👨‍🎓</span>
                <span>Male Aspirant</span>
              </button>

              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-black transition-all cursor-pointer ${
                  gender === "female"
                    ? "bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span className="text-lg">👩‍🎓</span>
                <span>Female Aspirant</span>
              </button>
            </div>
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
              Save Profile
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
