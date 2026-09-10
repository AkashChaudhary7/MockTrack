import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Sparkles, Send, Copy, Check, ExternalLink, Heart } from "lucide-react";
import { Doodle3DFeedbackMail, Doodle3DSparkle } from "./Doodles3D";
import { HapticService } from "../services/HapticService";
import { ExamProfile } from "../types";

interface RecentMocksFeedbackSectionProps {
  activeExam?: ExamProfile;
  candidateName?: string;
  onOpenInAppModal?: () => void;
}

export const RecentMocksFeedbackSection: React.FC<RecentMocksFeedbackSectionProps> = ({
  activeExam,
  candidateName = "Aspirant",
  onOpenInAppModal,
}) => {
  const [copied, setCopied] = useState(false);
  const recipientEmail = "mobographie@gmail.com";

  // Construct direct Gmail web compose link & native mailto
  const emailSubject = encodeURIComponent(
    `MockTrack Feedback & App Suggestion — ${activeExam?.shortCode || activeExam?.name || "Exam Prep"}`
  );
  const emailBody = encodeURIComponent(
    `Hi,\n\nI am using MockTrack for my ${activeExam?.name || "exam"} preparation.\n\nHere is something I'd love to suggest or change in the app:\n\n1. Feedback / Feature Idea:\n\n2. Any exam pattern or scoring issue:\n\nThanks!\n— ${candidateName}`
  );

  // Gmail direct web URL (works seamlessly in browser & desktop)
  const gmailWebComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${emailSubject}&body=${emailBody}`;
  const mailtoUrl = `mailto:${recipientEmail}?subject=${emailSubject}&body=${emailBody}`;

  const handleOpenGmail = () => {
    HapticService.selection();
    // Try opening direct Gmail web compose in a new tab; fallback to mailto
    const opened = window.open(gmailWebComposeUrl, "_blank", "noopener,noreferrer");
    if (!opened || opened.closed || typeof opened.closed === "undefined") {
      window.location.href = mailtoUrl;
    }
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    HapticService.lightTap();
    navigator.clipboard.writeText(recipientEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/70 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all"
    >
      {/* Soft Ambient Clay Light Blur */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-rose-400/10 dark:bg-rose-500/10 blur-xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: 3D Doodle + Title + Human Description */}
        <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
          <div className="shrink-0 transition-transform duration-300 hover:scale-110 hover:-rotate-3 pt-0.5">
            <Doodle3DFeedbackMail size={64} className="sm:w-18 sm:h-18" />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider font-display">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                Community & Feedback
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Direct to Developer
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black font-display text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              Want to change something in the app?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Every mock insight, chapter breakdown, or exam format you need — we listen personally.
              Drop your thoughts directly to our inbox.
            </p>

            {/* Email pill with click-to-copy */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer shadow-2xs"
                title="Click to copy email address"
              >
                <Mail className="w-3 h-3 text-indigo-500" />
                <span>{recipientEmail}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
              {copied && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  Copied!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Direct Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          {/* Main Primary Button requested by User */}
          <button
            type="button"
            onClick={handleOpenGmail}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-black font-display shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-95 group"
          >
            <Mail className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5" />
            <span className="text-center">
              Give feedback / Want to change something in app
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-200 shrink-0 opacity-80" />
          </button>

          {/* Optional in-app quick modal if preferred */}
          {onOpenInAppModal && (
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                onOpenInAppModal();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>In-App Form</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
