import React from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Plus,
  FileText,
  Camera,
  Link as LinkIcon,
  CheckCircle2,
  TrendingUp,
  Target,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { ExamProfile } from "../types";
import { HapticService } from "../services/HapticService";

interface FirstMockGuideBannerProps {
  activeExam: ExamProfile;
  onOpenLogModal: () => void;
  onOpenOcrModal: () => void;
}

export const FirstMockGuideBanner: React.FC<FirstMockGuideBannerProps> = ({
  activeExam,
  onOpenLogModal,
  onOpenOcrModal,
}) => {
  return (
    <div className="card-luminous rounded-3xl p-5 sm:p-6 space-y-4 border-2 border-indigo-500/20 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag & Title */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black font-display uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Get Started • Zero Mocks Logged</span>
          </span>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            100% Private &amp; Offline
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-snug">
          Log your first mock test for {activeExam.shortCode || activeExam.name}
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-xl">
          Track your marks, negative penalties, and sectional percentiles across Testbook, Oliveboard, PW, or offline papers. Once you log your first mock, MockTrack will instantly generate your:
        </p>
      </div>

      {/* 3 Quick Benefit Chips */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Personal Baseline
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
              Target gap to your {activeExam.targetScore || 160} marks goal.
            </p>
          </div>
        </div>

        <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Accuracy &amp; Penalty
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
              Identify marks lost to negative guessing.
            </p>
          </div>
        </div>

        <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Subject Radar
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
              Spot your strongest and weakest topics.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Manual + Scan */}
      <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            HapticService.selection();
            onOpenLogModal();
          }}
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-2xl text-xs sm:text-sm font-black font-display shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Your First Mock Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            onOpenOcrModal();
          }}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-slate-200 rounded-2xl text-xs sm:text-sm font-bold font-display border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Scan Scorecard Photo</span>
        </button>
      </div>
    </div>
  );
};
