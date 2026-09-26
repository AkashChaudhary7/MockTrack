import React, { useState } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, NavTab, ThemeMode } from "../types";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Languages,
  Vibrate,
  Bell,
  Download,
  Upload,
  Trash2,
  Share2,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Info,
  AlertOctagon,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useTranslation, LanguageCode } from "../i18n/LanguageContext";
import { HapticService } from "../services/HapticService";
import { PlatformLogo } from "./PlatformLogo";
import { AppLogo } from "./AppLogo";
import { PLATFORMS } from "../data/platforms";

interface SettingsScreenProps {
  candidate: CandidateProfile;
  activeExam: ExamProfile;
  onSetTheme: (theme: ThemeMode) => void;
  onToggleTheme: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenWalkthrough?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  candidate,
  activeExam,
  onSetTheme,
  onToggleTheme,
  onExportData,
  onImportData,
  onClearAllData,
  onNavigateTab,
  onOpenWalkthrough,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [nightReminder, setNightReminder] = useState<boolean>(true);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  const handleShareApp = async () => {
    HapticService.lightTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MockTrack — Exam Score Tracker & Performance Center",
          text: "Track mock tests, analyze section accuracy, and identify weak chapters offline with MockTrack!",
          url: window.location.origin,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-5 pb-28 max-w-2xl mx-auto">
      {/* 1. Header with Back Button to Profile */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            onNavigateTab("profile");
          }}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
          title="Back to Profile"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-slate-100 tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Preferences, data management &amp; application options
          </p>
        </div>
      </div>

      {/* 2. Appearance & Theme - Perfect Light, Dark, and System Mode */}
      <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400">
            Appearance &amp; Theme
          </span>
          <span className="text-xs font-black font-display text-slate-500 capitalize">
            {candidate.theme} Mode
          </span>
        </div>

        {/* 3-Mode Theme Selector: Light, Dark, System */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {[
            { mode: "light" as const, label: "Light", icon: Sun },
            { mode: "dark" as const, label: "Dark", icon: Moon },
            { mode: "system" as const, label: "System", icon: Monitor },
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = candidate.theme === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => {
                  HapticService.selection();
                  onSetTheme(item.mode);
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-black font-display transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {candidate.theme === "system"
            ? "Auto syncs with your device operating system dark or light preference."
            : candidate.theme === "dark"
            ? "Dark theme active with high-contrast slate & indigo tones."
            : "Light theme active with crisp daytime contrast."}
        </p>
      </div>

      {/* 3. Language Selector */}
      <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400">
              Language (भाषा)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {[
            { code: "en" as LanguageCode, label: "English" },
            { code: "hi" as LanguageCode, label: "हिंदी" },
            { code: "system" as LanguageCode, label: "System" },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                HapticService.lightTap();
                setLanguage(l.code);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black font-display transition-all cursor-pointer text-center ${
                language === l.code
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Controls & Feedback */}
      <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-4">
        <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-3">
          Controls &amp; Feedback
        </span>

        {/* Haptic Vibration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vibrate className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                Haptic Vibration
              </span>
              <span className="text-xs text-slate-400">
                Tactile feedback when tapping buttons and logging mocks
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !hapticsEnabled;
              setHapticsEnabled(next);
              if (next) HapticService.selection();
            }}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
              hapticsEnabled
                ? "bg-indigo-600 justify-end"
                : "bg-slate-200 dark:bg-slate-700 justify-start"
            }`}
          >
            <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Daily Study Reminder */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                Mock Logging Reminder
              </span>
              <span className="text-xs text-slate-400">
                Daily streak retention reminder at 8:00 PM
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setNightReminder(!nightReminder);
            }}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
              nightReminder
                ? "bg-indigo-600 justify-end"
                : "bg-slate-200 dark:bg-slate-700 justify-start"
            }`}
          >
            <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>
      </div>

      {/* 5. Data & Backup Management */}
      <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-4">
        <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-3">
          Data &amp; Backup
        </span>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          All your mock scores and exam notes are stored 100% locally on your device. Export a backup anytime to prevent accidental data loss.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onExportData();
            }}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Export JSON</span>
          </button>

          <label className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json,.csv"
              onChange={onImportData}
              className="hidden"
            />
          </label>
        </div>

        {/* Clear Data Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                setShowClearConfirm(true);
              }}
              className="w-full py-2.5 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Mock Data</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs font-bold">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Delete all mock attempts permanently?</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    HapticService.selection();
                    onClearAllData();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. Supported Mock Platforms */}
      <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-3">
        <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-3">
          Supported Platforms
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Object.values(PLATFORMS).slice(0, 8).map((p) => (
            <div
              key={p.id}
              className="p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 rounded-xl flex items-center gap-2"
            >
              <PlatformLogo platformId={p.id} size="sm" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {p.shortLabel || p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. About & Legal Links */}
      <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-2">
        <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-2">
          About &amp; Resources
        </span>

        {onOpenWalkthrough && (
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              onOpenWalkthrough();
            }}
            className="w-full py-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>App Walkthrough &amp; Start Tutorial</span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
              Replay Tour →
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            onNavigateTab("guide");
          }}
          className="w-full py-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>User Guide &amp; Scoring Tips</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            onNavigateTab("privacy");
          }}
          className="w-full py-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Privacy Policy &amp; Local Storage Terms</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={handleShareApp}
          className="w-full py-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>{shareSuccess ? "Link Copied to Clipboard!" : "Share MockTrack App"}</span>
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
            {shareSuccess ? "✓ Copied" : "Share"}
          </span>
        </button>
      </div>

      {/* App Version Stamp with Official Logo */}
      <div className="text-center pt-3 flex flex-col items-center justify-center gap-1.5 pb-2">
        <AppLogo size="sm" withText />
        <p className="text-[11px] font-bold text-slate-400">
          MockTrack v1.5.0 • 100% Offline &amp; Private
        </p>
      </div>
    </div>
  );
};
