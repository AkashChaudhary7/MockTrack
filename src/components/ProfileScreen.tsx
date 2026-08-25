import React, { useState } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, NavTab } from "../types";
import { calculateDaysLeft } from "../utils/analytics";
import { motion } from "motion/react";
import {
  User,
  Edit2,
  CheckCircle2,
  Calendar,
  Plus,
  Download,
  Upload,
  Trash2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Languages,
  Lock,
  ExternalLink,
} from "lucide-react";
import { useTranslation, LanguageCode } from "../i18n/LanguageContext";

interface ProfileScreenProps {
  candidate: CandidateProfile;
  examProfiles: ExamProfile[];
  attempts: MockAttempt[];
  onSelectExamProfile: (id: string) => void;
  onOpenAddProfileModal: () => void;
  onOpenEditNameModal: () => void;
  onOpenSetDateModal: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  candidate,
  examProfiles,
  attempts,
  onSelectExamProfile,
  onOpenAddProfileModal,
  onOpenEditNameModal,
  onOpenSetDateModal,
  onExportData,
  onImportData,
  onClearAllData,
  onNavigateTab,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  return (
    <div className="space-y-6 pb-24">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {t.profileTab} &amp; {t.languageSetting}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          {t.candidateConfigSub}
        </p>
      </div>

      {/* A. Candidate Profile Header */}
      <div className="card-bevel-3d rounded-3xl p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 dark:from-violet-600 dark:to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20 shrink-0">
            {candidate.avatarSeed || candidate.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{candidate.name}</span>
              <button
                onClick={onOpenEditNameModal}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                title="Edit Name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-violet-300 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                Active Target: {examProfiles.find((p) => p.id === candidate.activeExamProfileId)?.name || "SSC CGL"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* B. Language Settings Section */}
      <div className="card-bevel-3d rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              {t.languageSetting}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose language for MockTrack UI controls and system messages
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setLanguage("en")}
            className={`p-4 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
              language === "en"
                ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div>
              <span className="text-sm font-black block">English</span>
              <span className="text-[11px] font-normal text-slate-400">Default English UI</span>
            </div>
            {language === "en" && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
          </button>

          <button
            onClick={() => setLanguage("hi")}
            className={`p-4 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
              language === "hi"
                ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div>
              <span className="text-sm font-black block">हिंदी</span>
              <span className="text-[11px] font-normal text-slate-400">Hindi Translation</span>
            </div>
            {language === "hi" && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
          </button>

          <button
            onClick={() => setLanguage("system")}
            className={`p-4 rounded-2xl border text-left font-bold transition-all cursor-pointer flex items-center justify-between ${
              language === "system"
                ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div>
              <span className="text-sm font-black block">{t.systemDefault}</span>
              <span className="text-[11px] font-normal text-slate-400">Follow device language</span>
            </div>
            {language === "system" && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
          </button>
        </div>
      </div>

      {/* C. Highlighted App Details & Guide Link Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onNavigateTab("guide")}
        className="w-full p-5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white rounded-3xl shadow-lg flex items-center justify-between cursor-pointer text-left"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold text-indigo-100">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Product Tour</span>
          </div>
          <h3 className="text-lg font-black text-white">
            📱 App Details, Features &amp; Step-by-Step Guide ➔
          </h3>
          <p className="text-xs text-indigo-100">
            Interactive guide with live Android mockups, OCR score extraction, and bilingual PDF exporter.
          </p>
        </div>
      </motion.button>

      {/* D. Exam Profiles Manager Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Exam Profiles Manager
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select active target exam or configure countdown dates
            </p>
          </div>

          <button
            onClick={onOpenAddProfileModal}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Profile</span>
          </button>
        </div>

        <div className="grid gap-3">
          {examProfiles.map((profile) => {
            const isActive = profile.id === candidate.activeExamProfileId;
            const daysLeft = calculateDaysLeft(profile.examDate);

            return (
              <div
                key={profile.id}
                onClick={() => onSelectExamProfile(profile.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? "bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isActive ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-400"
                  }`}>
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {profile.name}
                      </h4>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-extrabold text-[10px]">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Total Marks: {profile.totalMarks} • Duration: {profile.defaultDurationMinutes}m • Neg Penalty: -{profile.negativeMarkingRatio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExamProfile(profile.id);
                      onOpenSetDateModal();
                    }}
                    className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {daysLeft !== null ? (
                      <span>⏳ {daysLeft} Days Left</span>
                    ) : (
                      <span>⏳ Set Date</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* E. Data Management & Backup */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Data Management &amp; Backup</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            100% Offline Local Storage • Export or import JSON files anytime
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onExportData}
            className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export JSON Backup File</span>
          </button>

          <label className="p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Import JSON Backup File</span>
            <input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Local Mock Data</span>
            </button>
          ) : (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-red-800 dark:text-red-200">
                Are you sure you want to delete all logged mock attempts? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClearAllData}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 cursor-pointer"
                >
                  Yes, Clear Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* F. Google Play Verifiable Privacy Policy & Data Safety */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Privacy Policy &amp; Data Safety</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                  Google Play Verifiable
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% offline student data, zero selling, and transparent permissions
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onNavigateTab("privacy")}
            className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs text-left"
          >
            <div>
              <span className="font-black block text-sm">Read Full In-App Policy ➔</span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                Data safety table, OCR rules &amp; rights
              </span>
            </div>
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          </button>

          <a
            href="https://mocktrack.ictlabgsssaidana.workers.dev/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-bold flex items-center justify-between transition-all shadow-xs"
          >
            <div>
              <span className="font-black block text-sm">Official Worker Policy Link</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate block max-w-[200px]">
                https://mocktrack.ictlabgsssaidana.workers.dev/privacy
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
};
