import React, { useState, useRef, useEffect } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, ScoreCardConfig, ScoreCardTheme } from "../types";
import { prepareScoreCardData, generateScoreCardBlob, ScoreCardData } from "../utils/scoreCardCanvas";
import { calculateStreakStats, calculatePracticeTimeStats } from "../utils/habitUtils";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Palette,
  User,
  Sliders,
  Sparkles,
  Flame,
  Clock,
  Target,
  Trophy,
  Calendar,
  Layers,
} from "lucide-react";
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
  initialTheme = "obsidian",
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "customize">("preview");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<ScoreCardConfig>({
    theme: initialTheme,
    avatarType: candidate.photoUrl ? "photo" : "initials",
    avatarEmoji: "🎯",
    photoUrl: candidate.photoUrl,
    scope: "current_exam",
    showStreak: true,
    showPracticeTime: true,
    showLongestStreak: false,
    showWeeklyMocks: true,
    showAccuracy: true,
  });

  // Derived stats
  const streakStats = calculateStreakStats(attempts);
  const practiceStats = calculatePracticeTimeStats(attempts, activeExam.defaultDurationMinutes);
  const weeklyGoal = candidate.weeklyGoal || 7;

  const cardData: ScoreCardData = prepareScoreCardData(
    candidate,
    activeExam,
    attempts,
    config,
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

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setConfig((prev) => ({
          ...prev,
          photoUrl: result,
          avatarType: "photo",
        }));
        HapticService.selection();
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate and Download Image
  const handleDownloadImage = async () => {
    try {
      setIsGenerating(true);
      HapticService.lightTap();
      const blob = await generateScoreCardBlob(cardData, config);
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
      const blob = await generateScoreCardBlob(cardData, config);
      const fileName = `MockTrack_${cardData.userName}_${cardData.examName}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const shareText = `🎯 My ${cardData.examName} Mock Preparation on MockTrack:\n` +
        `• ${cardData.totalMocks} Mocks Logged\n` +
        `• Highest Score: ${cardData.highestScoreDisplay}\n` +
        `• Average Score: ${cardData.averageScoreDisplay}\n` +
        (cardData.streakDays ? `• 🔥 ${cardData.streakDays} Day Streak\n` : "") +
        (cardData.practiceTimeDisplay ? `• ⏱ ${cardData.practiceTimeDisplay} Practice Time\n` : "") +
        `\nTrack, improve & master your exams with MockTrack!`;

      // Check if navigator.canShare with files is supported
      if (
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
      } else if (navigator.share) {
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
      (cardData.streakDays ? `• 🔥 ${cardData.streakDays} Day Streak\n` : "") +
      (cardData.practiceTimeDisplay ? `• ⏱ ${cardData.practiceTimeDisplay} Practice Time\n` : "") +
      `\nMade with MockTrack • Track. Improve. Repeat.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      HapticService.success();
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Theme Styles for In-App Live Card Preview
  const themeClasses: Record<ScoreCardTheme, { bg: string; card: string; border: string; text: string; sub: string; statBox: string; accent: string }> = {
    obsidian: {
      bg: "from-slate-950 via-slate-900 to-indigo-950",
      card: "bg-slate-900/90 text-slate-100",
      border: "border-slate-800",
      text: "text-slate-100",
      sub: "text-slate-400",
      statBox: "bg-slate-800/70 border-slate-700/60",
      accent: "text-indigo-400",
    },
    indigo: {
      bg: "from-indigo-950 via-slate-900 to-sky-950",
      card: "bg-indigo-950/80 text-white",
      border: "border-indigo-800/80",
      text: "text-white",
      sub: "text-indigo-200/80",
      statBox: "bg-indigo-900/60 border-indigo-700/60",
      accent: "text-sky-400",
    },
    emerald: {
      bg: "from-emerald-950 via-slate-900 to-teal-950",
      card: "bg-emerald-950/80 text-white",
      border: "border-emerald-800/80",
      text: "text-white",
      sub: "text-emerald-200/80",
      statBox: "bg-emerald-900/60 border-emerald-700/60",
      accent: "text-emerald-300",
    },
    minimal: {
      bg: "from-slate-100 via-slate-50 to-slate-200",
      card: "bg-white text-slate-900 shadow-xl",
      border: "border-slate-200",
      text: "text-slate-900",
      sub: "text-slate-500",
      statBox: "bg-slate-50 border-slate-200/80",
      accent: "text-indigo-600",
    },
  };

  const currentThemeStyle = themeClasses[config.theme] || themeClasses.obsidian;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xs">
              MT
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">
                Shareable Score Card
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Export high-resolution achievement card
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tab switch between Preview & Customize */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl text-xs font-bold mr-1">
              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setActiveTab("preview");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Card
              </button>
              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setActiveTab("customize");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeTab === "customize"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <button
              onClick={() => {
                HapticService.lightTap();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === "preview" ? (
            /* ---------------- LIVE CARD PREVIEW ---------------- */
            <div className="flex flex-col items-center">
              <div
                className={`w-full max-w-sm rounded-3xl p-5 border bg-gradient-to-b ${currentThemeStyle.bg} ${currentThemeStyle.border} shadow-2xl space-y-4 transition-all duration-200 select-none`}
              >
                {/* Brand & Milestone Pill */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wider text-indigo-400 uppercase">
                      MockTrack
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">
                      Track. Improve. Repeat.
                    </span>
                  </div>
                  {cardData.milestoneTitle && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 truncate">
                      {cardData.milestoneTitle}
                    </span>
                  )}
                </div>

                {/* Candidate Identity */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {config.avatarType === "photo" && cardData.avatarPhotoUrl ? (
                      <img
                        src={cardData.avatarPhotoUrl}
                        alt="Avatar"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
                      />
                    ) : config.avatarType === "emoji" ? (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl border-2 border-indigo-400 shadow-md">
                        {cardData.avatarEmoji}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-lg border-2 border-indigo-400 shadow-md">
                        {cardData.avatarSeed}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className={`text-lg font-black tracking-tight truncate ${currentThemeStyle.text}`}>
                      {cardData.userName}
                    </h3>
                    <div className="inline-block mt-0.5 px-2 py-0.5 rounded-lg bg-white/10 text-[11px] font-bold text-slate-200 border border-white/10 truncate max-w-full">
                      {cardData.examName}
                    </div>
                  </div>
                </div>

                {/* Core Primary Stats Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {/* Total Mocks */}
                  <div className={`p-3 rounded-2xl border ${currentThemeStyle.statBox} text-center space-y-0.5`}>
                    <span className={`text-2xl font-black block tabular-nums leading-none ${currentThemeStyle.accent}`}>
                      {cardData.totalMocks}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${currentThemeStyle.sub}`}>
                      Mocks
                    </span>
                  </div>

                  {/* Highest Score */}
                  <div className={`p-3 rounded-2xl border ${currentThemeStyle.statBox} text-center space-y-0.5`}>
                    <span className="text-2xl font-black block tabular-nums leading-none text-amber-400">
                      {cardData.highestScoreDisplay}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${currentThemeStyle.sub}`}>
                      Highest
                    </span>
                  </div>

                  {/* Average Score */}
                  <div className={`p-3 rounded-2xl border ${currentThemeStyle.statBox} text-center space-y-0.5`}>
                    <span className="text-2xl font-black block tabular-nums leading-none text-emerald-400">
                      {cardData.averageScoreDisplay}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${currentThemeStyle.sub}`}>
                      Average
                    </span>
                  </div>
                </div>

                {/* Optional Stats Highlights */}
                {(cardData.streakDays || cardData.practiceTimeDisplay || cardData.accuracyDisplay) && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {cardData.streakDays !== undefined && (
                      <div className={`p-2 rounded-xl border ${currentThemeStyle.statBox} text-center`}>
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          🔥 Streak
                        </span>
                        <span className={`text-xs font-black block truncate ${currentThemeStyle.text}`}>
                          {cardData.streakDays} Days
                        </span>
                      </div>
                    )}
                    {cardData.practiceTimeDisplay && (
                      <div className={`p-2 rounded-xl border ${currentThemeStyle.statBox} text-center`}>
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          ⏱ Practice
                        </span>
                        <span className={`text-xs font-black block truncate ${currentThemeStyle.text}`}>
                          {cardData.practiceTimeDisplay}
                        </span>
                      </div>
                    )}
                    {cardData.accuracyDisplay && (
                      <div className={`p-2 rounded-xl border ${currentThemeStyle.statBox} text-center`}>
                        <span className="text-[10px] font-bold text-slate-400 block truncate">
                          🎯 Accuracy
                        </span>
                        <span className={`text-xs font-black block truncate ${currentThemeStyle.text}`}>
                          {cardData.accuracyDisplay}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Footer: Subtle branding */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold">Made with MockTrack</span>
                  <span className="text-[10px] font-medium opacity-80">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Format Hint */}
              <p className="text-[11px] text-slate-400 text-center mt-3">
                Exported at 1080×1350 HD — ready for WhatsApp, Instagram Stories &amp; Telegram
              </p>
            </div>
          ) : (
            /* ---------------- CUSTOMIZATION TAB ---------------- */
            <div className="space-y-4">
              {/* Theme Picker */}
              <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                    Card Theme
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: "obsidian", label: "Obsidian Dark", preview: "bg-slate-900 border-indigo-500" },
                      { id: "indigo", label: "Royal Indigo", preview: "bg-indigo-950 border-sky-400" },
                      { id: "emerald", label: "Emerald Ace", preview: "bg-emerald-950 border-emerald-400" },
                      { id: "minimal", label: "Minimal Light", preview: "bg-slate-100 text-slate-900 border-slate-300" },
                    ] as const
                  ).map((themeOption) => (
                    <button
                      key={themeOption.id}
                      type="button"
                      onClick={() => {
                        HapticService.lightTap();
                        setConfig((prev) => ({ ...prev, theme: themeOption.id }));
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        config.theme === themeOption.id
                          ? "ring-2 ring-indigo-500 border-transparent bg-indigo-600/20 text-white"
                          : "border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className={`w-full h-5 rounded-md mb-1.5 border ${themeOption.preview}`} />
                      <span className="truncate block text-[11px]">{themeOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                      Identity &amp; Avatar
                    </span>
                  </div>
                  {/* Hidden Photo file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    + Upload Photo
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      HapticService.lightTap();
                      setConfig((prev) => ({ ...prev, avatarType: "initials" }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                      config.avatarType === "initials"
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-2xs"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Initials ({cardData.avatarSeed})
                  </button>

                  {["🎯", "🎓", "🏆", "⚡", "🦁", "🦅"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        HapticService.lightTap();
                        setConfig((prev) => ({ ...prev, avatarType: "emoji", avatarEmoji: emoji }));
                      }}
                      className={`w-9 h-9 rounded-xl text-base border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        config.avatarType === "emoji" && config.avatarEmoji === emoji
                          ? "bg-indigo-600 border-indigo-400 scale-105"
                          : "bg-slate-900 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}

                  {config.photoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        HapticService.lightTap();
                        setConfig((prev) => ({ ...prev, avatarType: "photo" }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                        config.avatarType === "photo"
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-2xs"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      My Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Data Scope (Current Exam Profile vs All Exams) */}
              <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                      Statistics Scope
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {config.scope === "current_exam" ? activeExam.shortCode || activeExam.name : "All Exam Mocks"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      HapticService.lightTap();
                      setConfig((prev) => ({ ...prev, scope: "current_exam" }));
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      config.scope === "current_exam"
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-2xs"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Current Exam Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      HapticService.lightTap();
                      setConfig((prev) => ({ ...prev, scope: "all_exams" }));
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      config.scope === "all_exams"
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-2xs"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    All Mocks Combined
                  </button>
                </div>
              </div>

              {/* Optional Stats Toggles */}
              <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                    Optional Highlights
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showStreak}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showStreak: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300 font-bold">🔥 Current Streak</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showPracticeTime}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showPracticeTime: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300 font-bold">⏱ Practice Time</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showAccuracy}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showAccuracy: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300 font-bold">🎯 Overall Accuracy</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showWeeklyMocks}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showWeeklyMocks: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300 font-bold">📅 Weekly Goal</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* 1. Primary Share Action */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleShare}
              className="col-span-2 sm:col-span-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {shareSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Shared!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Progress</span>
                </>
              )}
            </button>

            {/* 2. Download Image */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadImage}
              className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-100 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-slate-300" />
                  <span>Save Image</span>
                </>
              )}
            </button>

            {/* 3. Copy Text */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleCopyText}
              className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-100 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
