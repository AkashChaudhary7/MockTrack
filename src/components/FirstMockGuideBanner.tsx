import React from "react";
import { Plus, Camera, Sparkles } from "lucide-react";
import { ExamProfile } from "../types";
import { HapticService } from "../services/HapticService";

interface FirstMockGuideBannerProps {
  activeExam: ExamProfile;
  onOpenLogModal: () => void;
  onOpenOcrModal: () => void;
}

/**
 * Handcrafted animated SVG vector illustration for First Mock Onboarding
 */
const FirstMockVectorIllustration: React.FC<{ size?: number }> = ({ size = 88 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="filter drop-shadow-sm select-none"
  >
    <defs>
      <linearGradient id="sheet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F8FAFC" />
      </linearGradient>
      <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      <linearGradient id="star-g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="50" cy="92" rx="36" ry="6" fill="#1E1B4B" opacity="0.12" />
    {/* Mock Sheet with folded corner */}
    <path
      d="M 24 16 C 24 12 28 8 32 8 L 62 8 L 76 22 L 76 80 C 76 84 72 88 68 88 L 32 88 C 28 88 24 84 24 80 Z"
      fill="url(#sheet-grad)"
      stroke="#CBD5E1"
      strokeWidth="2"
    />
    {/* Fold corner */}
    <path d="M 62 8 L 62 22 L 76 22 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Exam Header Bar */}
    <rect x="32" y="18" width="24" height="4" rx="2" fill="#4F46E5" />
    {/* Content lines */}
    <rect x="32" y="28" width="36" height="3" rx="1.5" fill="#E2E8F0" />
    <rect x="32" y="36" width="30" height="3" rx="1.5" fill="#E2E8F0" />
    <rect x="32" y="44" width="24" height="3" rx="1.5" fill="#E2E8F0" />
    {/* Target Seal */}
    <circle cx="56" cy="62" r="16" fill="url(#badge-grad)" />
    <circle cx="56" cy="62" r="12" fill="#FFFFFF" />
    <circle cx="56" cy="62" r="8" fill="#EF4444" />
    <circle cx="56" cy="62" r="4" fill="#FFFFFF" />
    {/* Gold Pencil */}
    <g transform="translate(62, 44) rotate(42)">
      <rect x="0" y="0" width="6" height="24" rx="1.5" fill="url(#star-g)" stroke="#D97706" strokeWidth="0.5" />
      <polygon points="0,24 6,24 3,30" fill="#F87171" />
      <polygon points="2,28 4,28 3,30" fill="#1E293B" />
      <rect x="0" y="0" width="6" height="5" fill="#94A3B8" />
    </g>
    {/* Sparkles */}
    <polygon points="18,30 20,24 22,30 28,32 22,34 20,40 18,34 12,32" fill="#FBBF24" />
    <circle cx="82" cy="74" r="2.5" fill="#38BDF8" />
  </svg>
);

export const FirstMockGuideBanner: React.FC<FirstMockGuideBannerProps> = ({
  activeExam,
  onOpenLogModal,
  onOpenOcrModal,
}) => {
  return (
    <div className="card-luminous rounded-2xl p-4 sm:p-5 border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/60 via-white to-amber-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-800/80 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative overflow-hidden transition-all">
      {/* SVG Vector Graphic */}
      <div className="shrink-0 flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-800/90 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
        <FirstMockVectorIllustration size={76} />
      </div>

      {/* Short, Sweet, Simple Message & CTAs */}
      <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
          <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>Ready to Begin</span>
        </div>

        <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-slate-100 leading-snug">
          Log your first {activeExam.shortCode || activeExam.name} mock test
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-md">
          Record your score to unlock your personal baseline, subject mastery radar, and negative penalty analysis.
        </p>

        {/* Clean, Single-Line SVG Action Buttons */}
        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              onOpenLogModal();
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl cursor-pointer transition-all shadow-sm shadow-indigo-600/20 inline-flex items-center gap-1.5 font-display"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Log Mock Score</span>
          </button>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onOpenOcrModal();
            }}
            className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer border border-slate-200/80 dark:border-slate-700 transition-all inline-flex items-center gap-1.5 font-display"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-500" />
            <span>Scan Scorecard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
