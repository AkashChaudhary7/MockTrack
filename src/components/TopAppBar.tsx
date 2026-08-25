import React, { useState } from "react";
import { ExamProfile, CandidateProfile, NavTab } from "../types";
import { calculateDaysLeft } from "../utils/analytics";
import {
  Calendar,
  Moon,
  Sun,
  Menu,
  X,
  Languages,
  Sparkles,
  History,
  LineChart,
  Settings,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { HapticService } from "../services/HapticService";
import { AppLogo } from "./AppLogo";

interface TopAppBarProps {
  activeExam: ExamProfile;
  candidate: CandidateProfile;
  theme: "light" | "dark";
  activeTab: NavTab;
  onToggleTheme: () => void;
  onOpenProfileSwitcher: () => void;
  onOpenSetDateModal: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  activeExam,
  candidate,
  theme,
  activeTab,
  onToggleTheme,
  onOpenProfileSwitcher,
  onOpenSetDateModal,
  onNavigateTab,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [showDrawer, setShowDrawer] = useState(false);
  const daysLeft = calculateDaysLeft(activeExam.examDate);

  const isMainPage = activeTab === "dashboard";

  const handleOpenDrawer = () => {
    HapticService.lightTap();
    setShowDrawer(true);
  };

  const handleNav = (tab: NavTab) => {
    HapticService.lightTap();
    onNavigateTab(tab);
    setShowDrawer(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* LEFT: Three-Dot Menu Button / Back button */}
          <div className="flex items-center gap-2">
            {isMainPage ? (
              <button
                onClick={handleOpenDrawer}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Open Menu"
              >
                <Menu className="w-5 h-5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={() => handleNav("dashboard")}
                className="flex items-center gap-1 p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-extrabold"
              >
                <span className="text-base font-black">←</span>
                <span>{t.appName}</span>
              </button>
            )}
          </div>

          {/* CENTER: MockTrack Branding with AppLogo */}
          <button
            onClick={() => handleNav("dashboard")}
            className="flex items-center gap-2 font-black text-lg text-indigo-600 dark:text-indigo-400 tracking-tight cursor-pointer"
          >
            <AppLogo size="sm" />
            <span>MockTrack</span>
          </button>

          {/* RIGHT: Theme Toggle & Exam Day Countdown Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                HapticService.lightTap();
                onOpenSetDateModal();
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {daysLeft !== null ? (
                <span>🎯 {daysLeft} Days</span>
              ) : (
                <span>Date</span>
              )}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => {
                HapticService.lightTap();
                onToggleTheme();
              }}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Menu */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/60 backdrop-blur-xs">
          <div className="w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    MockTrack
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500">
                    {t.tagline}
                  </p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Candidate Info Quick Card */}
              <div
                onClick={() => {
                  onOpenProfileSwitcher();
                  setShowDrawer(false);
                }}
                className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all"
              >
                <div>
                  <div className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                    {candidate.name}
                  </div>
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Exam: {activeExam.shortCode}
                  </div>
                </div>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  Switch ▼
                </span>
              </div>

              {/* Navigation Menu List */}
              <div className="space-y-1 text-xs font-bold">
                <button
                  onClick={() => handleNav("dashboard")}
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNav("history")}
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <History className="w-4 h-4 text-sky-500" />
                  <span>Mock History</span>
                </button>

                <button
                  onClick={() => handleNav("insights")}
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <LineChart className="w-4 h-4 text-emerald-500" />
                  <span>Analytics &amp; Insights</span>
                </button>

                <button
                  onClick={() => handleNav("profile")}
                  className="w-full py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left flex items-center gap-2.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-500" />
                  <span>Settings &amp; Profile</span>
                </button>
              </div>

              {/* Language Switcher */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Language / भाषा</span>
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                      language === "en"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("hi")}
                    className={`py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                      language === "hi"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => setLanguage("system")}
                    className={`py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                      language === "system"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-slate-600 dark:text-slate-300">MockTrack PWA v1.5</p>
              <p>100% Offline &amp; Private IndexedDB</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

