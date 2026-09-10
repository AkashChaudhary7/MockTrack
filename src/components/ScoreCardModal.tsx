import React, { useState, useEffect } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, ScoreCardTheme } from "../types";
import { prepareScoreCardData, generateScoreCardBlob, ScoreCardData } from "../utils/scoreCardCanvas";
import { calculateStreakStats, calculatePracticeTimeStats } from "../utils/habitUtils";
import { X, Share2, Download, Copy, Check, Sparkles } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface ScoreCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  milestoneTitle?: string;
  initialTheme?: ScoreCardTheme;
}

export const ScoreCardModal: React.FC<ScoreCardModalProps> = ({
  isOpen,
  onClose,
  candidate,
  activeExam,
  attempts,
  milestoneTitle,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  // Derived stats
  const streakStats = calculateStreakStats(attempts);
  const practiceStats = calculatePracticeTimeStats(attempts, activeExam.defaultDurationMinutes);
  const weeklyGoal = candidate.weeklyGoal || 7;

  const cardData: ScoreCardData = prepareScoreCardData(
    candidate,
    activeExam,
    attempts,
    { scope: "current_exam" },
    streakStats.currentStreak,
    streakStats.longestStreak,
    practiceStats.allTimeMinutes,
    streakStats.weeklyCompletionCount,
    weeklyGoal,
    milestoneTitle
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate and Download Image
  const handleDownloadImage = async () => {
    try {
      setIsGenerating(true);
      HapticService.lightTap();
      const blob = await generateScoreCardBlob(cardData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeExam = (cardData.examName || "MockTrack").replace(/[^a-zA-Z0-9]/g, "_");
      a.href = url;
      a.download = `MockTrack_ScoreCard_${safeExam}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
      HapticService.success();
    } catch (err) {
      console.error("Failed to export score card image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Native Share or Fallback
  const handleShare = async () => {
    try {
      setIsGenerating(true);
      HapticService.lightTap();
      const blob = await generateScoreCardBlob(cardData);
      const fileName = `MockTrack_${cardData.userName}_${cardData.examName}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const shareText = `🎯 My ${cardData.examName} Mock Preparation on MockTrack:\n` +
        `• ${cardData.totalMocks} Mocks Logged\n` +
        `• Highest Score: ${cardData.highestScoreDisplay}\n` +
        `• Average Score: ${cardData.averageScoreDisplay}\n` +
        (cardData.accuracyDisplay ? `• Accuracy: ${cardData.accuracyDisplay}\n` : "") +
        (cardData.streakDays ? `• 🔥 ${cardData.streakDays} Day Streak\n` : "") +
        (cardData.practiceTimeDisplay ? `• ⏱ ${cardData.practiceTimeDisplay} Practice Time\n` : "") +
        `\nDownload MockTrack : Mock Score Tracker from Google Play Store!`;

      // Check if navigator.canShare with files is supported
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `MockTrack Performance — ${cardData.userName}`,
          text: shareText,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
        HapticService.achievement();
      } else if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `MockTrack Performance — ${cardData.userName}`,
          text: shareText,
          url: window.location.origin,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
        HapticService.achievement();
      } else {
        // Fallback: Copy share text and trigger image download
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        await handleDownloadImage();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Summary Text
  const handleCopyText = async () => {
    const text = `🎯 My ${cardData.examName} Mock Preparation on MockTrack:\n` +
      `• ${cardData.totalMocks} Mocks Logged\n` +
      `• Highest Score: ${cardData.highestScoreDisplay}\n` +
      `• Average Score: ${cardData.averageScoreDisplay}\n` +
      (cardData.accuracyDisplay ? `• Accuracy: ${cardData.accuracyDisplay}\n` : "") +
      (cardData.streakDays ? `• 🔥 ${cardData.streakDays} Day Streak\n` : "") +
      (cardData.practiceTimeDisplay ? `• ⏱ ${cardData.practiceTimeDisplay} Practice Time\n` : "") +
      `\nDownload MockTrack : Mock Score Tracker from Google Play Store`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      HapticService.success();
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Clean Modal Header - No Subheadings, No Edit Tabs */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
              Share Card
            </h2>
          </div>

          <button
            onClick={() => {
              HapticService.lightTap();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Direct Ivory White Card with Doodles */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50 dark:bg-slate-950/40">
          {/* THE IVORY WHITE CARD WITH DOODLES & HIGH-VISIBILITY TEXT */}
          <div className="relative w-full rounded-3xl p-4 sm:p-5 border-2 border-[#E4DDD3] bg-[#FAF8F5] shadow-xl overflow-hidden select-none space-y-4">
            {/* Background Hand-Drawn Vector Doodles */}
            <CardDoodlesOverlay />

            {/* Content Layer (Relative z-10 for High Visibility) */}
            <div className="relative z-10 space-y-3.5">
              {/* Card Header: Brand & Target Status Pill */}
              <div className="flex items-center justify-between gap-2 border-b border-[#E8E2D9] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#4338CA] flex items-center justify-center shadow-xs">
                    <span className="text-xs font-black text-white">MT</span>
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wider text-[#1E1B4B] uppercase block leading-none">
                      MockTrack
                    </span>
                    <span className="text-[9.5px] text-[#64748B] font-bold tracking-tight">
                      OFFICIAL SCORECARD
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black border ${
                      cardData.targetMet
                        ? "bg-[#ECFDF5] text-[#065F46] border-[#10B981]/40"
                        : "bg-[#EEF2FF] text-[#3730A3] border-[#6366F1]/40"
                    }`}
                  >
                    {cardData.milestoneTitle || (cardData.targetMet ? "🎯 TARGET MET" : "🚀 ON TRACK")}
                  </span>
                </div>
              </div>

              {/* Candidate Identity: Initials ONLY Avatar + Name + Exam */}
              <div className="flex items-center gap-3">
                {/* Initials Badge Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#312E81] to-[#4338CA] flex items-center justify-center text-white font-black text-xl border-2 border-[#C7D2FE] shadow-md shrink-0">
                  {cardData.userInitials}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-[#0F172A] truncate">
                    {cardData.userName.toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[10.5px] font-bold text-[#1E293B] border border-[#CBD5E1] truncate">
                      📚 {cardData.examName}
                    </span>
                    {cardData.targetDeltaDisplay && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border truncate ${
                          cardData.targetMet
                            ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                            : "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                        }`}
                      >
                        🎯 {cardData.targetDeltaDisplay}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Core 3 Hero Stat Cards (High Contrast on White Boxes) */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* 1. Mocks Logged */}
                <div className="p-2.5 sm:p-3 rounded-2xl border-2 border-[#C7D2FE] bg-white text-center shadow-xs space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black block tabular-nums leading-none text-[#3730A3]">
                    {cardData.totalMocks}
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider block text-[#1E293B]">
                    Mocks
                  </span>
                  <span className="text-[9px] font-semibold text-[#64748B] block truncate">
                    Attempts
                  </span>
                </div>

                {/* 2. Highest Score */}
                <div className="p-2.5 sm:p-3 rounded-2xl border-2 border-[#FDE68A] bg-white text-center shadow-xs space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black block tabular-nums leading-none text-[#B45309]">
                    {cardData.highestScoreRaw ? cardData.highestScoreRaw : "--"}
                    {cardData.highestScoreMax ? (
                      <span className="text-xs text-[#78350F] font-bold">/{cardData.highestScoreMax}</span>
                    ) : null}
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider block text-[#1E293B]">
                    Highest
                  </span>
                  <span className="text-[9px] font-semibold text-[#B45309] block truncate">
                    {cardData.highestScorePct ? `${cardData.highestScorePct}% PB` : "Best Score"}
                  </span>
                </div>

                {/* 3. Average Score */}
                <div className="p-2.5 sm:p-3 rounded-2xl border-2 border-[#A7F3D0] bg-white text-center shadow-xs space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black block tabular-nums leading-none text-[#047857]">
                    {cardData.averageScoreRaw ? cardData.averageScoreRaw : "--"}
                    {cardData.averageScoreMax ? (
                      <span className="text-xs text-[#064E3B] font-bold">/{cardData.averageScoreMax}</span>
                    ) : null}
                  </span>
                  <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider block text-[#1E293B]">
                    Average
                  </span>
                  <span className="text-[9px] font-semibold text-[#047857] block truncate">
                    Full Mocks
                  </span>
                </div>
              </div>

              {/* Secondary Cool Stats Row (High-Impact Badges) */}
              <div className="grid grid-cols-3 gap-2">
                {cardData.accuracyDisplay ? (
                  <div className="p-2 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] text-center">
                    <span className="text-[9px] font-bold text-[#0369A1] uppercase tracking-wider block truncate">
                      🎯 Accuracy
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#0369A1] block truncate">
                      {cardData.accuracyDisplay}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] text-center">
                    <span className="text-[9px] font-bold text-[#0369A1] uppercase tracking-wider block truncate">
                      🎯 Precision
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#0369A1] block truncate">
                      High
                    </span>
                  </div>
                )}

                {cardData.streakDays ? (
                  <div className="p-2 rounded-xl border border-[#FFEDD5] bg-[#FFF7ED] text-center">
                    <span className="text-[9px] font-bold text-[#C2410C] uppercase tracking-wider block truncate">
                      🔥 Streak
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#C2410C] block truncate">
                      {cardData.streakDays} Days
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl border border-[#FFEDD5] bg-[#FFF7ED] text-center">
                    <span className="text-[9px] font-bold text-[#C2410C] uppercase tracking-wider block truncate">
                      🔥 Daily Drill
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#C2410C] block truncate">
                      Active
                    </span>
                  </div>
                )}

                {cardData.practiceTimeDisplay ? (
                  <div className="p-2 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] text-center">
                    <span className="text-[9px] font-bold text-[#6D28D9] uppercase tracking-wider block truncate">
                      ⏱ Practice
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#6D28D9] block truncate">
                      {cardData.practiceTimeDisplay}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] text-center">
                    <span className="text-[9px] font-bold text-[#0F766E] uppercase tracking-wider block truncate">
                      ⚡ Discipline
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#0F766E] block truncate">
                      Top Tier
                    </span>
                  </div>
                )}
              </div>

              {/* Motivational Tagline Banner */}
              <div className="py-1.5 px-2.5 rounded-xl bg-white/90 border border-[#E2E8F0] text-center shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-black text-[#1E293B] uppercase tracking-wider">
                  ⚡ Consistency Beats Talent • Track. Improve. Repeat. ⚡
                </span>
              </div>

              {/* Google Play Badging Inside Card */}
              <div className="pt-2 border-t border-[#E8E2D9] flex flex-col items-center justify-center gap-1.5 text-center">
                {/* Official Google Play Style Badge */}
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-black rounded-xl border border-slate-700 shadow-md">
                  {/* Google Play 4-Color Icon */}
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" className="shrink-0">
                    <path d="M4 4 L22 20 L4 36 Z" fill="#00D2FF" />
                    <path d="M4 4 L29 13 L22 20 Z" fill="#00E676" />
                    <path d="M4 36 L29 27 L22 20 Z" fill="#FF334B" />
                    <path d="M22 20 L29 13 L37 20 L29 27 Z" fill="#FFCB00" />
                  </svg>
                  <div className="text-left leading-none">
                    <span className="text-[8px] font-semibold text-slate-300 uppercase tracking-wider block">
                      GET IT ON
                    </span>
                    <span className="text-xs font-black text-white tracking-tight block">
                      Google Play
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-black text-[#0F172A] tracking-tight">
                  Download MockTrack : Mock Score Tracker from Google Play Store
                </span>
              </div>
            </div>
          </div>

          {/* External Google Play Store Badging Banner Below Card */}
          <div className="p-3 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Google Play Logo */}
              <div className="w-9 h-9 rounded-xl bg-black border border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                  <path d="M4 4 L22 20 L4 36 Z" fill="#00D2FF" />
                  <path d="M4 4 L29 13 L22 20 Z" fill="#00E676" />
                  <path d="M4 36 L29 27 L22 20 Z" fill="#FF334B" />
                  <path d="M22 20 L29 13 L37 20 L29 27 Z" fill="#FFCB00" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 block leading-tight uppercase tracking-wider">
                  Available On Android
                </span>
                <span className="text-xs sm:text-sm font-black text-white block truncate">
                  MockTrack : Mock Score Tracker
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <span className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/20 inline-block">
                Google Play
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Footer (Share, Save Image, Copy Text) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="flex-1 py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 active:scale-95 text-indigo-700 dark:text-indigo-300 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save Image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="inline-block animate-spin text-sm">⏳</span>
            ) : shareSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Shared!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Card</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Handcrafted SVG Doodles Overlay for the Ivory White Card Preview
 */
const CardDoodlesOverlay: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden opacity-30"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 480"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* 1. Target Bullseye Doodle with Arrow (Top Right) */}
      <g transform="translate(355, 30)">
        <circle cx="0" cy="0" r="14" fill="none" stroke="#4338CA" strokeWidth="1.8" />
        <circle cx="0" cy="0" r="8" fill="none" stroke="#4338CA" strokeWidth="1.6" />
        <circle cx="0" cy="0" r="3" fill="#4338CA" />
        <line x1="12" y1="-12" x2="0" y2="0" stroke="#4338CA" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 -12 L7 -12 M12 -12 L12 -7" stroke="#4338CA" strokeWidth="1.6" strokeLinecap="round" />
      </g>

      {/* 2. Sparkle Star (Top Left) */}
      <path
        d="M 28 35 Q 28 45 38 45 Q 28 45 28 55 Q 28 45 18 45 Q 28 45 28 35 Z"
        fill="none"
        stroke="#D97706"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* 3. Small Sparkle (Near Middle Right) */}
      <path
        d="M 370 180 Q 370 188 378 188 Q 370 188 370 196 Q 370 188 362 188 Q 370 188 370 180 Z"
        fill="none"
        stroke="#D97706"
        strokeWidth="1.5"
      />

      {/* 4. Trophy Doodle (Mid Left) */}
      <g transform="translate(20, 185) scale(0.7)">
        <path d="M 5 0 L 25 0 Q 25 18 15 22 Q 5 18 5 0 Z" fill="none" stroke="#D97706" strokeWidth="2" />
        <line x1="15" y1="22" x2="15" y2="30" stroke="#D97706" strokeWidth="2" />
        <line x1="5" y1="30" x2="25" y2="30" stroke="#D97706" strokeWidth="2" />
        <path d="M 5 4 Q -3 8 5 14" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <path d="M 25 4 Q 33 8 25 14" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 5. Graduation Mortarboard (Near Top Center-Right) */}
      <g transform="translate(360, 105) scale(0.65)">
        <polygon points="15,0 30,7 15,14 0,7" fill="none" stroke="#475569" strokeWidth="2" />
        <path d="M 7 10 Q 15 18 23 10" fill="none" stroke="#475569" strokeWidth="2" />
        <line x1="15" y1="7" x2="26" y2="16" stroke="#475569" strokeWidth="1.5" />
      </g>

      {/* 6. Fire Flame Doodle (Lower Left) */}
      <g transform="translate(18, 320) scale(0.65)">
        <path
          d="M 12 24 C 20 20 20 12 12 0 C 8 8 6 12 12 24 Z"
          fill="none"
          stroke="#EA580C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* 7. Stopwatch Doodle (Lower Right) */}
      <g transform="translate(365, 330) scale(0.65)">
        <circle cx="12" cy="14" r="10" fill="none" stroke="#4338CA" strokeWidth="2" />
        <line x1="12" y1="4" x2="12" y2="1" stroke="#4338CA" strokeWidth="2" />
        <line x1="9" y1="1" x2="15" y2="1" stroke="#4338CA" strokeWidth="2" />
        <line x1="12" y1="14" x2="12" y2="8" stroke="#4338CA" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="12" y1="14" x2="16" y2="14" stroke="#4338CA" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* 8. Upward Growth Zigzag Arrow (Bottom Left) */}
      <g transform="translate(20, 420) scale(0.7)">
        <path d="M 0 16 L 8 8 L 14 12 L 24 2" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
        <path d="M 18 2 L 24 2 L 24 8" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 9. Math Symbols Doodle */}
      <text x="365" y="270" fill="#4338CA" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
        %
      </text>
      <text x="18" y="120" fill="#059669" fontSize="14" fontWeight="900" fontFamily="sans-serif">
        100
      </text>
      <text x="365" y="420" fill="#D97706" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
        ★
      </text>
      <text x="22" y="260" fill="#64748B" fontSize="16" fontWeight="900" fontFamily="sans-serif">
        +
      </text>

      {/* 10. Subtle Dotted Confetti */}
      <circle cx="340" cy="70" r="1.8" fill="#64748B" />
      <circle cx="30" cy="80" r="1.8" fill="#64748B" />
      <circle cx="375" cy="140" r="1.8" fill="#64748B" />
      <circle cx="25" cy="380" r="1.8" fill="#64748B" />
      <circle cx="360" cy="380" r="1.8" fill="#64748B" />
      <circle cx="340" cy="450" r="1.8" fill="#64748B" />
    </svg>
  );
};
