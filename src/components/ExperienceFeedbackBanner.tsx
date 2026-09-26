import React, { useState, useMemo } from "react";
import { Sparkles, MessageSquareHeart, RefreshCw, X } from "lucide-react";
import { ExamProfile, MockAttempt } from "../types";
import { HapticService } from "../services/HapticService";

interface ExperienceFeedbackBannerProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onOpenFeedbackModal: () => void;
}

/**
 * Handcrafted SVG Vector Lightbulb with Spark Rays
 */
const SvgLightbulbTip: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="filter drop-shadow-2xs select-none"
  >
    <defs>
      <linearGradient id="bulb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Bulb Head */}
    <circle cx="20" cy="18" r="11" fill="url(#bulb-grad)" />
    {/* Base Screw */}
    <path d="M 16 27 L 24 27 L 22 33 L 18 33 Z" fill="#94A3B8" />
    <circle cx="20" cy="34" r="1.5" fill="#64748B" />
    {/* Filament Glow */}
    <path d="M 17 18 Q 20 14 23 18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85" />
    {/* Spark Rays */}
    <line x1="20" y1="3" x2="20" y2="5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="12" x2="9" y2="14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="33" y1="12" x2="31" y2="14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ExperienceFeedbackBanner: React.FC<ExperienceFeedbackBannerProps> = ({
  activeExam,
  attempts,
  onOpenFeedbackModal,
}) => {
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const dynamicSuggestions = useMemo(() => {
    const list: { title: string; desc: string; badge: string }[] = [];
    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      list.push({
        badge: "Tip",
        title: "Take a Diagnostic Mock",
        desc: `Log your first test for ${activeExam.shortCode || activeExam.name} to establish baseline accuracy.`,
      });
    } else {
      const avgAccuracy = attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalAttempts;
      if (avgAccuracy < 75) {
        list.push({
          badge: "Accuracy",
          title: "Negative Shield",
          desc: "Skipping doubtful guesses protects 2.5 to 5 marks on your scorecard.",
        });
      } else {
        list.push({
          badge: "Review",
          title: "Silly Mistakes Review",
          desc: "Logging why marks were lost turns repeated errors into guaranteed marks.",
        });
      }
    }
    return list;
  }, [attempts, activeExam]);

  const currentSuggestion = dynamicSuggestions[tipIndex % dynamicSuggestions.length];

  if (isDismissed) return null;

  return (
    <div className="card-luminous rounded-2xl p-3 sm:p-3.5 border border-amber-200/80 dark:border-amber-800/60 bg-gradient-to-r from-amber-50/60 via-white to-indigo-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-between gap-3 relative overflow-hidden transition-all shadow-2xs">
      {/* SVG Vector Graphic */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="shrink-0 p-1 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 flex items-center justify-center">
          <SvgLightbulbTip size={28} />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {currentSuggestion.badge}
            </span>
            <span className="text-xs font-black font-display text-slate-800 dark:text-slate-200 truncate">
              {currentSuggestion.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight truncate">
            {currentSuggestion.desc}
          </p>
        </div>
      </div>

      {/* Action Button & Dismiss */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            HapticService.selection();
            onOpenFeedbackModal();
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-[11px] font-black shadow-2xs transition-all cursor-pointer font-display"
        >
          <MessageSquareHeart className="w-3 h-3" />
          <span>Feedback</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
