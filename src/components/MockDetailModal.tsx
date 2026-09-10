import React, { useRef, useState } from "react";
import { MockAttempt, PlatformId, CandidateProfile, ExamProfile } from "../types";
import { PLATFORMS } from "../data/platforms";
import { PlatformLogo } from "./PlatformLogo";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Share2,
  Edit3,
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  Target,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Download,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { HapticService } from "../services/HapticService";
import { Doodle3DTarget, Doodle3DSparkle, Doodle3DTrophy } from "./Doodles3D";

interface MockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mock: MockAttempt | null;
  candidate: CandidateProfile;
  activeExam: ExamProfile;
  onEditMock: (mock: MockAttempt) => void;
}

export const MockDetailModal: React.FC<MockDetailModalProps> = ({
  isOpen,
  onClose,
  mock,
  candidate,
  activeExam,
  onEditMock,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !mock) return null;

  const platformInfo = PLATFORMS[mock.platform as PlatformId] || PLATFORMS["other"];
  const targetScore = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.8);
  const targetDelta = Math.round((mock.score - targetScore) * 10) / 10;
  const isTargetAchieved = targetDelta >= 0;
  const pct = mock.maxMarks > 0 ? ((mock.score / mock.maxMarks) * 100).toFixed(1) : "0";

  // Share Card as Image / Web Share
  const handleShare = async () => {
    HapticService.selection();
    setIsSharing(true);

    const shareText = `🎯 ${candidate.name}'s Mock Result\n📝 ${mock.title} (${platformInfo.name})\n⭐ Score: ${mock.score}/${mock.maxMarks} (${pct}%)\n🎯 Target: ${targetScore} (${isTargetAchieved ? `+${targetDelta} Met!` : `${targetDelta} to goal`})\n🎯 Accuracy: ${mock.accuracy}%\nTracked with MockTrack!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mock.title} Scorecard — MockTrack`,
          text: shareText,
        });
        setIsSharing(false);
        return;
      } catch (err) {
        // Fallback to clipboard if dismissed or unsupported
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Share failed", e);
    }
    setIsSharing(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden my-auto z-10"
        >
          {/* Top Decorative 3D Ambient Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 p-5 text-white">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute left-1/3 -top-10 w-28 h-28 bg-sky-300/15 rounded-full blur-lg pointer-events-none" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                {/* Candidate Name Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Aspirant: {candidate.name}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black font-display tracking-tight text-white truncate pt-1">
                  {mock.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-indigo-100/90 font-bold flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {mock.date}
                  </span>
                  <span>•</span>
                  <span>{platformInfo.name}</span>
                  <span>•</span>
                  <span className="bg-white/15 px-2 py-0.5 rounded-md text-[10px] font-black">
                    {mock.testType || "Full Mock"}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div ref={cardRef} className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
            {/* Score & Target Achievement Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
                  Total Marks Obtained
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-display text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {mock.score}
                  </span>
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500 font-sans">
                    / {mock.maxMarks}
                  </span>
                </div>

                {/* Target Delta Pill */}
                <div className="pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${
                      isTargetAchieved
                        ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <Target className="w-3 h-3" />
                    <span>
                      {isTargetAchieved
                        ? `Target Reached (+${targetDelta} pts)`
                        : `${targetDelta} pts from target (${targetScore})`}
                    </span>
                  </span>
                </div>
              </div>

              {/* 3D Target Doodle / Trophy */}
              <div className="shrink-0">
                {isTargetAchieved ? (
                  <Doodle3DTrophy size={56} />
                ) : (
                  <Doodle3DTarget size={56} />
                )}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 block truncate">Accuracy</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-display tabular-nums">
                  {mock.accuracy}%
                </span>
                <span className="text-[9px] text-slate-400 block">Precision</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 block truncate">Percentile</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-display tabular-nums">
                  {mock.percentile !== undefined && mock.percentile > 0 ? `${mock.percentile}%ile` : "--"}
                </span>
                <span className="text-[9px] text-slate-400 block">Standing</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 block truncate">Rank</span>
                <span className="text-base font-black text-amber-500 dark:text-amber-400 font-display tabular-nums">
                  {mock.rank ? `#${mock.rank}` : "--"}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {mock.totalCandidates ? `of ${mock.totalCandidates}` : "Aspirants"}
                </span>
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>Question Attempt Breakdown</span>
                <span className="text-rose-500 dark:text-rose-400 text-[11px]">
                  Penalty: -{mock.negativePenalty || 0} marks
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">Correct</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ✓ {mock.correctCount || 0}
                  </span>
                </div>

                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200/60 dark:border-rose-800/50">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 block">Incorrect</span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    ✕ {mock.incorrectCount || 0}
                  </span>
                </div>

                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Unattempted</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">
                    - {mock.unattemptedCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject-wise Section Breakdown if Logged */}
            {mock.sections && mock.sections.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display block">
                  Subject-Wise Sectional Score
                </span>
                <div className="space-y-2">
                  {mock.sections.map((sec, idx) => {
                    const secPct = sec.maxMarks > 0 ? Math.round((sec.score / sec.maxMarks) * 100) : 0;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-900 dark:text-slate-100 truncate">{sec.name}</span>
                          <span className="font-black tabular-nums text-indigo-600 dark:text-indigo-400">
                            {sec.score} / {sec.maxMarks}{" "}
                            <span className="text-[10px] text-slate-400">({secPct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                            style={{ width: `${Math.min(100, Math.max(0, secPct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weak Areas & Critical Tags */}
            {mock.weakAreas && mock.weakAreas.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display block">
                  Weak Areas to Revise
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mock.weakAreas.map((w, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/60"
                    >
                      ⚠️ {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate Takeaway Notes */}
            {mock.notes && mock.notes.trim() && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  Test Reflection & Takeaways
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {mock.notes}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            {/* Left: Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-black border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
              title="Share Scorecard"
            >
              <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{copied ? "Copied to Clipboard!" : "Share Result"}</span>
            </button>

            {/* Right: Edit Mock Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  onClose();
                  onEditMock(mock);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Mock</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
