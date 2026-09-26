import React, { useState } from "react";
import { CandidateProfile, ExamProfile, MockAttempt, NavTab } from "../types";
import { calculateDaysLeft, calculateAnalytics } from "../utils/analytics";
import { calculateAchievements } from "../utils/achievements";
import {
  Edit2,
  Settings as SettingsIcon,
  ChevronRight,
  Target,
  Award,
  Plus,
  ChevronDown,
} from "lucide-react";
import { HapticService } from "../services/HapticService";
import { SubjectGoalsSection } from "./SubjectGoalsSection";
import { AchievementsModal } from "./AchievementsModal";

interface ProfileScreenProps {
  candidate: CandidateProfile;
  examProfiles: ExamProfile[];
  attempts: MockAttempt[];
  onSelectExamProfile: (id: string) => void;
  onOpenAddProfileModal: () => void;
  onOpenEditNameModal: () => void;
  onOpenSetDateModal: () => void;
  onExportData?: () => void;
  onImportData?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData?: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onUpdateExamProfile?: (updatedProfile: ExamProfile) => void;
  onOpenScoreCard?: (milestoneTitle?: string) => void;
  onUpdateCandidate?: (updates: Partial<CandidateProfile>) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  candidate,
  examProfiles,
  attempts,
  onSelectExamProfile,
  onOpenAddProfileModal,
  onOpenEditNameModal,
  onOpenSetDateModal,
  onNavigateTab,
  onUpdateExamProfile,
  onOpenScoreCard,
  onUpdateCandidate,
}) => {
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);

  const activeExam =
    examProfiles.find((p) => p.id === candidate.activeExamProfileId) ||
    examProfiles[0];

  const daysLeft = calculateDaysLeft(activeExam.examDate);
  const targetScore =
    activeExam.targetScore || Math.round(activeExam.totalMarks * 0.8);

  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);

  // IMPORTANT: Filter ONLY "Full Mock" tests for Highest & Avg scores
  const fullMocks = examAttempts.filter(
    (a) => a.testType === "Full Mock" || (!a.testType && a.maxMarks === activeExam.totalMarks)
  );

  const highestScore = fullMocks.length > 0 ? Math.max(...fullMocks.map((m) => m.score)) : 0;
  const highestPct = activeExam.totalMarks > 0 && highestScore > 0
    ? `${Math.round((highestScore / activeExam.totalMarks) * 100)}%`
    : (highestScore > 0 ? `${highestScore}` : "--");

  const avgScore = fullMocks.length > 0
    ? Math.round((fullMocks.reduce((acc, m) => acc + m.score, 0) / fullMocks.length) * 10) / 10
    : 0;
  const avgPct = activeExam.totalMarks > 0 && avgScore > 0
    ? `${Math.round((avgScore / activeExam.totalMarks) * 1000) / 10}%`
    : (avgScore > 0 ? `${avgScore}` : "--");

  // Compute achievements
  const achievements = calculateAchievements(attempts, activeExam);
  const unlockedBadges = achievements.filter((a) => a.unlocked);
  const totalBadges = achievements.length;
  const latestUnlocked = unlockedBadges[unlockedBadges.length - 1];
  const nextMilestone = achievements.find((a) => !a.unlocked);

  const gender = candidate.gender || "male";

  const handleToggleGender = () => {
    HapticService.selection();
    const nextGender = gender === "male" ? "female" : "male";
    onUpdateCandidate?.({ gender: nextGender });
  };

  const handleProfileDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__add_new__") {
      HapticService.lightTap();
      onOpenAddProfileModal();
    } else {
      HapticService.selection();
      onSelectExamProfile(val);
    }
  };

  return (
    <div className="space-y-4 pb-28 max-w-2xl mx-auto">
      {/* 1. USER IDENTITY CARD: Male/Female Iconography + Name + Badges Only Below Name */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Male / Female Aspirant Avatar with quick toggle */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={handleToggleGender}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition-transform active:scale-95 cursor-pointer border ${
                  gender === "female"
                    ? "bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-indigo-500/15 border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400"
                    : "bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-blue-500/15 border-indigo-300 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400"
                }`}
                title={`Gender: ${gender === "female" ? "Female Aspirant" : "Male Aspirant"} (Tap to toggle)`}
                aria-label="Toggle Male or Female Aspirant iconography"
              >
                <span>{gender === "female" ? "👩‍🎓" : "👨‍🎓"}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleGender}
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border shadow-2xs cursor-pointer transition-colors ${
                  gender === "female"
                    ? "bg-rose-500 text-white border-white dark:border-slate-900"
                    : "bg-indigo-600 text-white border-white dark:border-slate-900"
                }`}
                title={`Current: ${gender === "female" ? "Female" : "Male"} (Tap to toggle)`}
              >
                {gender === "female" ? "♀" : "♂"}
              </button>
            </div>

            <div className="min-w-0">
              {/* Identity Row: User Name + Edit icon */}
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate italic font-display">
                  {candidate.name}
                </h1>

                <button
                  type="button"
                  onClick={() => {
                    HapticService.lightTap();
                    onOpenEditNameModal();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Edit Name"
                  aria-label="Edit Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badges appear ONLY below name, icon only with NO text */}
              {unlockedBadges.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {unlockedBadges.slice(0, 6).map((badge) => (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => {
                        HapticService.lightTap();
                        setIsAchievementsModalOpen(true);
                      }}
                      className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center text-sm hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-2xs shrink-0"
                      title={`${badge.title} (Unlocked - Click to view)`}
                      aria-label={badge.title}
                    >
                      <span>{badge.icon}</span>
                    </button>
                  ))}

                  {unlockedBadges.length > 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        HapticService.lightTap();
                        setIsAchievementsModalOpen(true);
                      }}
                      className="h-7 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[10px] font-black text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      title="View all badges"
                    >
                      +{unlockedBadges.length - 6}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Settings Icon in Header */}
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onNavigateTab("settings");
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Open Settings"
            aria-label="Open Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. MY PROGRESS (Section 19: 127 Mocks · 86% Best · 72.4% Avg -> Share Score Card) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            My Progress
          </span>
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onOpenScoreCard?.();
            }}
            className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>Share Score Card</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 flex-wrap">
            <span className="font-black text-slate-900 dark:text-slate-100">{examAttempts.length} Mocks</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-black text-amber-600 dark:text-amber-400">{highestPct} Best</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">{avgPct} Avg</span>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onOpenScoreCard?.();
            }}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-[11px] font-black shadow-2xs transition-all cursor-pointer"
          >
            Generate Card
          </button>
        </div>

        {/* Milestone Summary: Latest Unlocked & Progress toward next */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
          {latestUnlocked && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Latest Unlocked:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {latestUnlocked.icon} {latestUnlocked.title}
              </span>
            </div>
          )}
          {nextMilestone && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Next Milestone:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {nextMilestone.title} ({nextMilestone.currentValue}/{nextMilestone.targetValue} {nextMilestone.unit})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. PERSONAL GOAL CARD: Active Exam | Target Score | Days Left */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Personal Goal
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onOpenSetDateModal();
            }}
            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Edit Goal &amp; Date
          </button>
        </div>

        {/* Single Horizontal Row on Mobile: Active Exam | Target Score | Days Left */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 text-center py-1">
          {/* 1. Active Exam */}
          <div className="px-1 sm:px-2 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Active Exam
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate block mt-0.5">
              {activeExam.shortCode || activeExam.name}
            </span>
          </div>

          {/* 2. Target Score */}
          <div className="px-1 sm:px-2 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Target Score
            </span>
            <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums truncate block mt-0.5">
              {targetScore} <span className="text-[10px] text-slate-400 font-bold">/ {activeExam.totalMarks}</span>
            </span>
          </div>

          {/* 3. Days Left */}
          <div className="px-1 sm:px-2 flex flex-col justify-center">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Days Left
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums truncate block mt-0.5">
              {daysLeft !== null ? `${daysLeft} Days` : "--"}
            </span>
          </div>
        </div>

        {/* Switch / Add Exam Profile Dropdown */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
              Exam:
            </span>
            <div className="relative flex-1">
              <select
                value={activeExam.id}
                onChange={handleProfileDropdownChange}
                className="w-full appearance-none pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                {examProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.targetScore || Math.round(p.totalMarks * 0.8)}/{p.totalMarks} M)
                  </option>
                ))}
                <option value="__add_new__">+ Add New Profile...</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUBJECT MILESTONES & GOALS (Simplified, only subjects with goals) */}
      <SubjectGoalsSection
        activeExam={activeExam}
        attempts={attempts}
        onUpdateExamProfile={onUpdateExamProfile || (() => {})}
        onOpenLogModal={() => onNavigateTab("log")}
      />

      {/* 4. ACHIEVEMENTS & BADGES COMPACT ACTION (Opens Popup Modal) */}
      <button
        type="button"
        onClick={() => {
          HapticService.lightTap();
          setIsAchievementsModalOpen(true);
        }}
        className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/70 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
              Achievements &amp; Badges
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {unlockedBadges.length} of {totalBadges} milestones unlocked
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">View Badges</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* 5. NAVIGATION TO SETTINGS */}
      <button
        type="button"
        onClick={() => {
          HapticService.lightTap();
          onNavigateTab("settings");
        }}
        className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
              Application Settings
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Theme, language, backup &amp; data management
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Achievements Popup Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        attempts={attempts}
        activeExam={activeExam}
        onOpenLogModal={() => onNavigateTab("log")}
      />
    </div>
  );
};
