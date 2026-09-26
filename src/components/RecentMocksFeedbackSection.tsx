import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Heart, Check, Copy, Sparkles, Send } from "lucide-react";
import { HapticService } from "../services/HapticService";
import { ExamProfile } from "../types";

interface RecentMocksFeedbackSectionProps {
  activeExam?: ExamProfile;
  candidateName?: string;
  onOpenInAppModal?: () => void;
}

/**
 * Handcrafted Sweet SVG Vector Graphic: Compact Envelope with Heart & Sparkles
 */
const SvgSweetFeedbackGraphic: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="select-none filter drop-shadow-2xs"
  >
    <defs>
      <linearGradient id="fb-env-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      <linearGradient id="fb-heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="30" cy="54" rx="20" ry="3.5" fill="#1E1B4B" opacity="0.1" />
    {/* Envelope Body */}
    <rect x="10" y="20" width="40" height="28" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
    <path d="M 10 24 L 30 38 L 50 24" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    {/* Inner Letter Sheet */}
    <rect x="16" y="14" width="28" height="18" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <line x1="20" y1="19" x2="34" y2="19" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="20" y1="24" x2="40" y2="24" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    {/* Sweet Center Heart */}
    <path
      d="M 30 25 C 30 20 35 18 38 21 C 41 18 46 20 46 25 C 46 32 38 37 38 37 C 38 37 30 32 30 25 Z"
      fill="url(#fb-heart-grad)"
      transform="scale(0.7) translate(14, 5)"
    />
    {/* Vector Sparkle */}
    <polygon points="12,12 13.5,8 15,12 19,13.5 15,15 13.5,19 12,15 8,13.5" fill="#FBBF24" />
    <circle cx="48" cy="14" r="2" fill="#38BDF8" />
  </svg>
);

export const RecentMocksFeedbackSection: React.FC<RecentMocksFeedbackSectionProps> = ({
  activeExam,
  candidateName = "Aspirant",
  onOpenInAppModal,
}) => {
  const [copied, setCopied] = useState(false);
  const recipientEmail = "mobographie@gmail.com";

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticService.lightTap();
    navigator.clipboard.writeText(recipientEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEmail = () => {
    HapticService.selection();
    const emailSubject = encodeURIComponent(
      `MockTrack Feedback — ${activeExam?.shortCode || activeExam?.name || "Exam Prep"}`
    );
    const emailBody = encodeURIComponent(
      `Hi,\n\nI am using MockTrack for my ${activeExam?.name || "exam"} prep.\n\nFeedback / Suggestion:\n\nThanks!\n— ${candidateName}`
    );
    window.location.href = `mailto:${recipientEmail}?subject=${emailSubject}&body=${emailBody}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card-luminous rounded-2xl p-3.5 sm:p-4 border border-indigo-200/80 dark:border-indigo-800/60 bg-gradient-to-r from-indigo-50/60 via-white to-sky-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden transition-all shadow-2xs"
    >
      {/* Left: SVG Vector Graphic + Short Sweet Text */}
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div className="shrink-0 p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shadow-2xs">
          <SvgSweetFeedbackGraphic size={38} />
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900 font-display">
              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
              <span>Feedback</span>
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-display">
              Have an idea or feedback?
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-sm">
            We improve MockTrack every week based on your suggestions.
          </p>
        </div>
      </div>

      {/* Right: Short & Sweet Single-Tap Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        {onOpenInAppModal ? (
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              onOpenInAppModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer transition-all font-display"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Share Feedback</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenEmail}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 cursor-pointer transition-all font-display"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Feedback</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCopyEmail}
          className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title={`Copy email (${recipientEmail})`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Mail className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500" />
          )}
        </button>
      </div>
    </motion.div>
  );
};
