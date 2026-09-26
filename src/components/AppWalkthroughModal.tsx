import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  Camera,
  Layers,
  TrendingUp,
  Award,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { MascotCharacter, MascotPose } from "./MascotCharacter";
import { HapticService } from "../services/HapticService";
import { firePersonalBestConfetti } from "../utils/confetti";

interface AppWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartLogging?: () => void;
}

interface WalkthroughStep {
  id: number;
  title: string;
  subtitle: string;
  mascotPose: MascotPose;
  badge: string;
  visual: React.ReactNode;
  bulletPoints: { icon: React.ReactNode; title: string; desc: string }[];
}

export const AppWalkthroughModal: React.FC<AppWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onStartLogging,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps: WalkthroughStep[] = [
    {
      id: 0,
      title: "Welcome to MockTrack!",
      subtitle: "Your offline-first mock test command center. Turn practice tests into real rank gains.",
      mascotPose: "explaining",
      badge: "Step 1 of 5 · Overview",
      visual: (
        <div className="w-full py-4 px-3 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-amber-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-800 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center relative overflow-hidden">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-black tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Built for High-Stakes Aspirants</span>
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-sm">
              Stop guessing your readiness. Track every mock, pinpoint weak concepts, and hit your dream cut-off score.
            </p>
          </div>
        </div>
      ),
      bulletPoints: [
        {
          icon: <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          title: "Set Your Target Cut-off",
          desc: "Compare your daily scores directly against previous year exam cutoffs.",
        },
        {
          icon: <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          title: "100% Offline-First & Private",
          desc: "Your test marks stay on your device with instant IndexedDB sync.",
        },
      ],
    },
    {
      id: 1,
      title: "Log Any Mock in Seconds",
      subtitle: "Three flexible ways to record: fast manual input, solution link paste, or AI scorecard scanner.",
      mascotPose: "friendly",
      badge: "Step 2 of 5 · Logging",
      visual: (
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800 text-center space-y-1">
            <span className="text-xl block">⚡</span>
            <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 block">Manual Entry</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">Score, accuracy, time</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800 text-center space-y-1">
            <span className="text-xl block">📸</span>
            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 block">AI Scorecard OCR</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">Screenshot / camera scan</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800 text-center space-y-1">
            <span className="text-xl block">🔗</span>
            <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 block">Link Bookmarklet</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">Import from Testbook / Adda</span>
          </div>
        </div>
      ),
      bulletPoints: [
        {
          icon: <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          title: "AI Scorecard Reader",
          desc: "Snap a photo of your test summary; marks & percentile autofill instantly.",
        },
        {
          icon: <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          title: "Multi-Platform Ready",
          desc: "Track Testbook, Oliveboard, PW, Adda247, Allen & offline papers all in one place.",
        },
      ],
    },
    {
      id: 2,
      title: "Granular Subject Breakdowns",
      subtitle: "Never wonder which section pulled you down. Track marks & accuracy per subject.",
      mascotPose: "analyzing",
      badge: "Step 3 of 5 · Subject Depth",
      visual: (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-700 dark:text-slate-300">Quantitative Aptitude</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-display">44 / 50 (88%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full w-[88%]" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
            <span>22 Correct · 2 Incorrect · 1 Skipped</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">-1.0 Negative</span>
          </div>
        </div>
      ),
      bulletPoints: [
        {
          icon: <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          title: "Isolate Weak Topics",
          desc: "Tag specific recurring mistakes like 'Geometry' or 'Calculation Error'.",
        },
        {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          title: "Negative Penalty Shield",
          desc: "Keep accuracy above 85% to protect your hard-earned points from penalty drops.",
        },
      ],
    },
    {
      id: 3,
      title: "Filter History by Subject",
      subtitle: "Use the new subject filter in Mock History to review performance with laser focus.",
      mascotPose: "target",
      badge: "Step 4 of 5 · History Filters",
      visual: (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">Subject Filter:</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black">
              📐 Reasoning Ability ▾
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
            Instantly view only attempts containing Reasoning, compare your sectional trends, and identify improvement patterns over time.
          </p>
        </div>
      ),
      bulletPoints: [
        {
          icon: <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          title: "Subject-Level Granularity",
          desc: "Filter across all your past attempts by Quant, Reasoning, English, or GS.",
        },
        {
          icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          title: "Subject Average & Personal Best",
          desc: "See exact subject averages and highest scores achieved in each section.",
        },
      ],
    },
    {
      id: 4,
      title: "You're Ready to Excel!",
      subtitle: "Consistent tracking beats random hard work every time. Ace is with you all the way!",
      mascotPose: "cheering",
      badge: "Step 5 of 5 · Start Cracking",
      visual: (
        <div className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50 to-emerald-50 dark:from-amber-950/30 dark:via-indigo-950/30 dark:to-emerald-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center space-y-1.5">
          <span className="text-2xl block animate-bounce">🏆</span>
          <h4 className="text-sm font-black font-display text-slate-900 dark:text-white">
            Daily Mocks · Steady Analysis · Rank 1 Mindset
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Tap the button below to log your first mock test or explore your dashboard!
          </p>
        </div>
      ),
      bulletPoints: [
        {
          icon: <Sparkles className="w-4 h-4 text-amber-500" />,
          title: "Replay Anytime",
          desc: "You can reopen this walkthrough anytime from the top bar or settings.",
        },
      ],
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    HapticService.lightTap();
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      firePersonalBestConfetti();
      localStorage.setItem("mocktrack_has_seen_walkthrough", "true");
      onClose();
    }
  };

  const handlePrev = () => {
    HapticService.lightTap();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    HapticService.achievement();
    firePersonalBestConfetti();
    localStorage.setItem("mocktrack_has_seen_walkthrough", "true");
    onClose();
    if (onStartLogging) {
      onStartLogging();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Row */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black font-display uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-800">
              {step.badge}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              localStorage.setItem("mocktrack_has_seen_walkthrough", "true");
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Walkthrough"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Mascot + Title Lockup */}
          <div className="flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-1 border border-indigo-100 dark:border-indigo-900/50">
              <MascotCharacter pose={step.mascotPose} size={84} />
            </div>

            <div className="min-w-0 space-y-1">
              <h2 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-snug">
                {step.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Dynamic Step Visual */}
          <div>{step.visual}</div>

          {/* Bullet points explaining features concisely */}
          <div className="space-y-2 pt-1">
            {step.bulletPoints.map((bp, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="p-1 rounded-lg bg-white dark:bg-slate-700 shrink-0 shadow-2xs">
                  {bp.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                    {bp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    {bp.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, index) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setCurrentStep(index);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === currentStep
                    ? "w-6 bg-indigo-600 dark:bg-indigo-400"
                    : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1 font-display"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1 font-display"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Practicing</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
