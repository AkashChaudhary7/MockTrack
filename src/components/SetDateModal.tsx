import React, { useState, useEffect } from "react";
import { ExamProfile } from "../types";
import { motion } from "motion/react";
import { X, Calendar, Target, Bell, BellRing, Check, AlertCircle } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface SetDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: ExamProfile;
  onSaveDate: (examId: string, examDate: string | undefined, targetScore?: number) => void;
}

export const SetDateModal: React.FC<SetDateModalProps> = ({
  isOpen,
  onClose,
  activeExam,
  onSaveDate,
}) => {
  const [examDate, setExamDate] = useState<string>(activeExam.examDate || "2026-11-20");
  const [targetScore, setTargetScore] = useState<number>(
    activeExam.targetScore || Math.round(activeExam.totalMarks * 0.8)
  );
  
  const reminderStorageKey = `mocktrack_exam_reminder_${activeExam.id}`;
  const [remindMe, setRemindMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(reminderStorageKey);
      return saved ? JSON.parse(saved).enabled : false;
    } catch {
      return false;
    }
  });
  const [notificationStatus, setNotificationStatus] = useState<"granted" | "denied" | "default" | "unsupported">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleRemindMe = async () => {
    HapticService.selection();
    const nextState = !remindMe;

    if (nextState) {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          try {
            const perm = await Notification.requestPermission();
            setNotificationStatus(perm);
            if (perm === "granted") {
              setRemindMe(true);
              HapticService.achievement();
            } else {
              setRemindMe(false);
              HapticService.warning();
            }
          } catch {
            setRemindMe(false);
          }
        } else if (Notification.permission === "granted") {
          setRemindMe(true);
          HapticService.lightTap();
        } else {
          setRemindMe(false);
          HapticService.warning();
        }
      } else {
        setRemindMe(false);
        setNotificationStatus("unsupported");
      }
    } else {
      setRemindMe(false);
      HapticService.lightTap();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    HapticService.success();

    // Save reminder settings in localStorage & dispatch notification confirmation if enabled
    try {
      if (remindMe) {
        localStorage.setItem(
          reminderStorageKey,
          JSON.stringify({
            enabled: true,
            examId: activeExam.id,
            examName: activeExam.name,
            examDate,
            targetScore,
            updatedAt: new Date().toISOString(),
          })
        );

        // Send confirmation reminder notification if permission granted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(`🎯 Exam Reminder: ${activeExam.name}`, {
              body: `Reminder active for ${examDate}. Target Goal: ${targetScore} / ${activeExam.totalMarks} Marks!`,
              icon: "/favicon.ico",
              tag: `exam-remind-${activeExam.id}`,
            });
          } catch (err) {
            console.warn("Notification error:", err);
          }
        }
      } else {
        localStorage.removeItem(reminderStorageKey);
      }
    } catch {
      /* ignore */
    }

    onSaveDate(
      activeExam.id,
      examDate || undefined,
      targetScore ? Number(targetScore) : undefined
    );
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
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
              Set Target Score &amp; Exam Date
            </h3>
          </div>
          <button
            onClick={() => {
              HapticService.lightTap();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Target Goal Score (out of {activeExam.totalMarks})
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={1}
                max={activeExam.totalMarks}
                value={targetScore}
                onChange={(e) => setTargetScore(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                Marks
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Drives the interactive dashboard progress ring to track goal completion.
            </p>
          </div>

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
              Powers the countdown pill (🎯 X Days Left) in the app header.
            </p>
          </div>

          {/* Remind Me Toggle with Notifications API */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl transition-colors ${remindMe ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                  {remindMe ? <BellRing className="w-4 h-4 animate-bounce" /> : <Bell className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                    Remind Me
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Browser notification countdown alerts
                  </span>
                </div>
              </div>

              {/* iOS style toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={remindMe}
                onClick={handleToggleRemindMe}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                  remindMe ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    remindMe ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Notification permission guidance / status */}
            {remindMe && notificationStatus === "granted" && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Notification permission granted. You will receive exam reminders.</span>
              </div>
            )}

            {notificationStatus === "denied" && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-bold pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Notifications are blocked in your browser settings.</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                onClose();
              }}
              className="py-2 px-3 text-xs font-bold text-slate-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Save Goal &amp; Date
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

