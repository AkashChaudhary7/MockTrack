import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Target,
  CheckCircle2,
  Calendar,
  Zap,
  Camera,
  LineChart,
  ArrowLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { AppLogo } from "./AppLogo";
import { PlatformLogo } from "./PlatformLogo";
import { ExamProfile, CandidateProfile } from "../types";
import { HapticService } from "../services/HapticService";
import { firePersonalBestConfetti } from "../utils/confetti";

interface SplashOnboardingProps {
  candidate: CandidateProfile;
  examProfiles: ExamProfile[];
  onComplete: (
    candidateData: { name: string; avatarSeed: string },
    selectedExamId: string,
    examConfig?: { targetScore: number; examDate?: string }
  ) => void;
  onDismiss: () => void;
}

type OnboardingStep = "splash" | "name" | "exam" | "tour";

const AVATAR_OPTIONS = [
  { id: "target", emoji: "🎯", label: "Target Master" },
  { id: "rocket", emoji: "🚀", label: "High Flyer" },
  { id: "trophy", emoji: "🏆", label: "Rank 1 Aspirant" },
  { id: "scholar", emoji: "📚", label: "Scholar" },
  { id: "flash", emoji: "⚡", label: "Speedster" },
  { id: "flame", emoji: "🔥", label: "Streak Warrior" },
];

export const SplashOnboarding: React.FC<SplashOnboardingProps> = ({
  candidate,
  examProfiles,
  onComplete,
  onDismiss,
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("splash");

  // Form states initialized with existing candidate data
  const [aspirantName, setAspirantName] = useState(candidate.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    candidate.avatarSeed || "🎯"
  );
  const [selectedExamId, setSelectedExamId] = useState(
    candidate.activeExamProfileId || examProfiles[0]?.id || "ssc-cgl-2026"
  );

  const activeSelectedExam =
    examProfiles.find((p) => p.id === selectedExamId) || examProfiles[0];

  const [targetScore, setTargetScore] = useState<number>(
    activeSelectedExam?.targetScore || Math.round((activeSelectedExam?.totalMarks || 200) * 0.8)
  );
  const [examDate, setExamDate] = useState<string>(
    activeSelectedExam?.examDate || "2026-09-17"
  );

  const handleSelectExam = (exam: ExamProfile) => {
    HapticService.selection();
    setSelectedExamId(exam.id);
    setTargetScore(exam.targetScore || Math.round(exam.totalMarks * 0.8));
    if (exam.examDate) {
      setExamDate(exam.examDate);
    }
  };

  const handleNextFromSplash = () => {
    HapticService.lightTap();
    setCurrentStep("name");
  };

  const handleNextFromName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aspirantName.trim()) {
      setAspirantName("Aspirant");
    }
    HapticService.lightTap();
    setCurrentStep("exam");
  };

  const handleNextFromExam = () => {
    HapticService.lightTap();
    setCurrentStep("tour");
  };

  const handleFinishOnboarding = () => {
    HapticService.achievement();
    firePersonalBestConfetti();
    onComplete(
      {
        name: aspirantName.trim() || "Aspirant",
        avatarSeed: selectedAvatar,
      },
      selectedExamId,
      {
        targetScore: Number(targetScore) || 160,
        examDate: examDate || undefined,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-6 overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-2/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between pt-2 pb-4 z-10">
        <div className="flex items-center gap-2">
          {currentStep !== "splash" && (
            <button
              onClick={() => {
                HapticService.lightTap();
                if (currentStep === "tour") setCurrentStep("exam");
                else if (currentStep === "exam") setCurrentStep("name");
                else if (currentStep === "name") setCurrentStep("splash");
              }}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <AppLogo size="sm" />
            <span className="text-xs font-black tracking-wider text-indigo-300 uppercase">
              MockTrack Setup
            </span>
          </div>
        </div>

        {/* Step Indicator & Skip Button */}
        <div className="flex items-center gap-3">
          {currentStep !== "splash" && (
            <div className="flex items-center gap-1.5">
              {(["name", "exam", "tour"] as OnboardingStep[]).map((stepKey, idx) => {
                const stepIdx = ["name", "exam", "tour"].indexOf(currentStep);
                const isCompleted = stepIdx >= idx;
                return (
                  <span
                    key={stepKey}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCompleted ? "w-5 bg-indigo-500" : "w-1.5 bg-slate-700"
                    }`}
                  />
                );
              })}
            </div>
          )}

          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Main Multi-Step Content Area */}
      <div className="w-full max-w-xl mx-auto my-auto z-10 py-4">
        <AnimatePresence mode="wait">
          {/* STEP 0: HERO SPLASH */}
          {currentStep === "splash" && (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center space-y-6"
            >
              {/* 3D Logo with Pulse Halo */}
              <div className="relative my-2">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -inset-6 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-400 opacity-40 blur-xl pointer-events-none"
                />
                <AppLogo size="3xl" animated />
              </div>

              {/* Headings */}
              <div className="space-y-2 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 border border-indigo-700/80 rounded-full text-indigo-300 text-xs font-black shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exam Performance Command Center</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight select-none">
                  <span className="text-white">Mock</span>
                  <span className="text-[#10B981]">Track</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                  Track Every Mock. Analyze Your Baseline. Crack Your Target Exam.
                </p>
              </div>

              {/* Supported Platform Logos Strip */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Syncs with Top Test Series
                </p>
                <div className="flex items-center justify-center gap-2">
                  {["testbook", "adda247", "oliveboard", "physicswallah", "nta"].map((pid) => (
                    <div
                      key={pid}
                      className="p-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-xs hover:border-indigo-500/50 transition-colors"
                    >
                      <PlatformLogo platformId={pid} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Supported Exam Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
                {["SSC CGL", "IBPS PO", "RRB NTPC", "UPSC CSE", "State PSC"].map(
                  (exam) => (
                    <span
                      key={exam}
                      className="px-3 py-1 rounded-full text-xs font-black bg-slate-800/90 border border-slate-700 text-indigo-200 shadow-xs"
                    >
                      {exam}
                    </span>
                  )
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 w-full max-w-xs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNextFromSplash}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-black text-base shadow-[0_10px_25px_rgba(79,70,229,0.4)] hover:shadow-indigo-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer border border-indigo-400/30"
                >
                  <span>Get Started — Setup Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: ASK FOR NAME & AVATAR */}
          {currentStep === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                  Step 1 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  What is your name, Aspirant?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  We&apos;ll personalize your mock tracker &amp; bilingual PDF reports.
                </p>
              </div>

              {/* Name Input Form */}
              <form onSubmit={handleNextFromName} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={aspirantName}
                    onChange={(e) => setAspirantName(e.target.value)}
                    placeholder="e.g. Rohit Sharma"
                    autoFocus
                    required
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-white font-bold text-base focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Avatar / Badge Selection */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                    Choose Your Aspirant Emblem
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          HapticService.lightTap();
                          setSelectedAvatar(av.emoji);
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          selectedAvatar === av.emoji
                            ? "bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500/50 scale-105"
                            : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-2xl">{av.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                          {av.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Next: Select Target Exam</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: SELECT EXAM & GOAL */}
          {currentStep === "exam" && (
            <motion.div
              key="exam"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                  Step 2 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Select Your Primary Exam
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Configures negative marking rules, total marks, and subject radar.
                </p>
              </div>

              {/* Exam Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {examProfiles.map((profile) => {
                  const isSelected = selectedExamId === profile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleSelectExam(profile)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-950/80 border-indigo-500 text-white ring-2 ring-indigo-500/40"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Target
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-indigo-400" : "text-slate-500"
                            }`}
                          />
                          <span className="font-black text-sm text-white truncate">
                            {profile.name}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {profile.totalMarks} Marks • -{profile.negativeMarkingRatio} Neg. Penalty
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Target Score & Date inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    Target Score ({activeSelectedExam?.totalMarks || 200} Max)
                  </label>
                  <input
                    type="number"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    max={activeSelectedExam?.totalMarks || 200}
                    min={0}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Exam Date (Countdown)</span>
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextFromExam}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Next: Features Guide</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GUIDE / TOUR */}
          {currentStep === "tour" && (
            <motion.div
              key="tour"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Setup Complete!</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Welcome aboard, {aspirantName || "Aspirant"}! {selectedAvatar}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Your command center for {activeSelectedExam?.name} is ready.
                </p>
              </div>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
                    <Zap className="w-4 h-4 fill-amber-400" />
                    <span>⚡ 10-Second Quick Log</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Log marks, accuracy, correct &amp; negatives from Testbook, Oliveboard, PW, etc.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-xs">
                    <Camera className="w-4 h-4" />
                    <span>📸 AI Scorecard OCR</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Extract scores directly from scorecard screenshots or share links.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 font-black text-xs">
                    <LineChart className="w-4 h-4" />
                    <span>📊 Subject Weakness Radar</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Pinpoint low-scoring subjects and avoidable negative marking penalties.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>🔒 100% Offline &amp; Private</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Your test data stays strictly on your local device with zero cloud tracking.
                  </p>
                </div>
              </div>

              {/* Ready Action Button */}
              <div className="pt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-black text-base shadow-[0_10px_30px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Launch Performance Command Center 🚀</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Security Badge */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 text-xs text-slate-400 z-10 pt-2 pb-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% Local Storage • Zero External Tracking • Free &amp; Offline</span>
      </div>
    </div>
  );
};
