import React, { useState, useMemo } from "react";
import {
  Lightbulb,
  Sparkles,
  MessageSquareHeart,
  ChevronRight,
  RefreshCw,
  X,
  MessageSquarePlus,
} from "lucide-react";
import { ExamProfile, MockAttempt } from "../types";
import { HapticService } from "../services/HapticService";

interface ExperienceFeedbackBannerProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onOpenFeedbackModal: () => void;
}

export const ExperienceFeedbackBanner: React.FC<ExperienceFeedbackBannerProps> = ({
  activeExam,
  attempts,
  onOpenFeedbackModal,
}) => {
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Derive dynamic smart suggestions based on user mock data
  const dynamicSuggestions = useMemo(() => {
    const list: { title: string; desc: string; badge: string }[] = [];

    const fullMocks = attempts.filter((a) => a.testType === "full");
    const totalAttempts = attempts.length;

    // 1. Data-driven dynamic tip
    if (totalAttempts === 0) {
      list.push({
        badge: "First Step",
        title: "Take a Diagnostic Full Mock",
        desc: `Log your first full-length test for ${activeExam.shortCode || activeExam.name} to identify baseline accuracy and strongest chapters.`,
      });
    } else {
      const avgAccuracy =
        attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalAttempts;
      
      if (avgAccuracy < 72) {
        list.push({
          badge: "Accuracy Tip",
          title: "Avoid Negative Marking Penalties",
          desc: `In ${activeExam.shortCode || activeExam.name}, skipping 5 doubtful guesses can protect up to 2.5 to 5 net marks on the final scorecard.`,
        });
      } else if (fullMocks.length < 2) {
        list.push({
          badge: "Stamina Drill",
          title: "Build 2-Hour Exam Endurance",
          desc: "Sectional mocks boost subject speed, but full-length timed mocks train mental resilience under pressure.",
        });
      } else {
        list.push({
          badge: "Review Strategy",
          title: "Master the Post-Mock Review",
          desc: "Spend 1.5× the test duration re-solving mistakes. Tag root causes in your Mistake Log before your next mock.",
        });
      }
    }

    // Curated high-yield exam tips
    list.push(
      {
        badge: "Exam Strategy",
        title: "Execute the Two-Pass Method",
        desc: "Pass 1: Knock out all 100% certain questions in 35-40 mins. Pass 2: Allocate remaining time to calculation-heavy questions.",
      },
      {
        badge: "Speed Protocol",
        title: "The 90-Second Rule",
        desc: "Never let a single question trap you for over 90 seconds. Mark for review and keep moving forward.",
      },
      {
        badge: "Consistency",
        title: "Active Error Notebook",
        desc: "Reviewing formulas and concepts from past mistakes gives double the score boost of taking another unreviewed test.",
      },
      {
        badge: "Prep Rhythm",
        title: "Simulate Real Exam Timing",
        desc: `Attempt mocks in the same time slot as your official ${activeExam.shortCode || activeExam.name} shift to align your circadian peak alertness.`,
      }
    );

    return list;
  }, [attempts, activeExam]);

  const currentSuggestion = dynamicSuggestions[tipIndex % dynamicSuggestions.length];

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticService.lightTap();
    setTipIndex((prev) => (prev + 1) % dynamicSuggestions.length);
  };

  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Show Suggestions &amp; Feedback</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50/90 via-sky-50/50 to-white dark:from-slate-900 dark:via-indigo-950/25 dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-800/60 rounded-2xl p-3.5 sm:p-4 shadow-xs transition-all">
      {/* Background Accent Glow */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Tip & Dynamic Suggestion */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white dark:bg-indigo-500 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Lightbulb className="w-4.5 h-4.5" />
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {currentSuggestion.badge}
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                {currentSuggestion.title}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {currentSuggestion.desc}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {/* Cycle Tip Button */}
          <button
            type="button"
            onClick={handleNextTip}
            className="p-1.5 rounded-lg bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
            title="Next Study Tip"
            aria-label="Next Study Tip"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Give Suggestion & Feedback CTA */}
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              onOpenFeedbackModal();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title="Share feedback or suggest a feature"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Give Feedback</span>
          </button>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Dismiss banner"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
