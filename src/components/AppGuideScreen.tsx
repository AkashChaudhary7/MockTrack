import React, { useState } from "react";
import { CandidateProfile, ExamProfile, MockAttempt } from "../types";
import { PLATFORMS } from "../data/platforms";
import { generateBilingualReportHTML } from "../utils/pdfExport";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Zap,
  Camera,
  ShieldCheck,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
} from "lucide-react";

interface AppGuideScreenProps {
  candidate: CandidateProfile;
  activeExam: ExamProfile;
  attempts: MockAttempt[];
}

export const AppGuideScreen: React.FC<AppGuideScreenProps> = ({
  candidate,
  activeExam,
  attempts,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const steps = [
    {
      stepNum: 1,
      title: "Step 1: Set Up Exam & Target Countdown",
      description: "Select your target exam profile (SSC CGL, IBPS PO, RRB NTPC, UPSC) and configure the countdown target date to display remaining preparation days in the app header.",
      mockup: (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-400">Android UI Header Mockup</span>
            <span className="text-[10px] bg-indigo-950 px-2 py-0.5 rounded-md text-indigo-300 border border-indigo-800">
              Live Android 15 Shell
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center gap-1.5">
              <span>SSC CGL 2026</span>
              <span className="text-slate-400">🔻</span>
            </div>
            <div className="px-3 py-1.5 bg-indigo-950/80 border border-indigo-700 rounded-full text-xs font-bold text-indigo-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>⏳ 24 Days Left</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      stepNum: 2,
      title: "Step 2: Log Scores in 10 Seconds",
      description: "Quickly select your platform (Testbook, Oliveboard, PW, Adda247, BYJU'S, Unacademy), enter marks obtained, correct Qs, and incorrect Qs. The app automatically computes negative penalty and net score.",
      mockup: (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 font-sans">
          <div className="text-xs font-bold text-indigo-400">Platform Selector Chips &amp; Live Score</div>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 bg-sky-600 text-white rounded-xl text-[11px] font-bold">[TB Testbook]</span>
            <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-[11px] font-bold">[OB Oliveboard]</span>
            <span className="px-2.5 py-1 bg-purple-600 text-white rounded-xl text-[11px] font-bold">[PW PW]</span>
            <span className="px-2.5 py-1 bg-red-600 text-white rounded-xl text-[11px] font-bold">[247 Adda247]</span>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div>Score: <strong className="text-emerald-400 text-sm">142.5 / 200</strong></div>
            <div className="text-red-400 font-bold">Penalty: -9.5 Lost</div>
          </div>
        </div>
      ),
    },
    {
      stepNum: 3,
      title: "Step 3: Scan Screenshot or Share Link",
      description: "Use Gemini AI OCR engine to automatically extract platform, score, correct/incorrect counts, and percentile directly from your mobile scorecard screenshot or share link.",
      mockup: (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 font-sans">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Scorecard Parser Output</span>
          </div>
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs space-y-1">
            <div>Detected Platform: <strong>Testbook Live Mock</strong></div>
            <div>Score: <strong>144.5 / 200</strong> • Percentile: <strong>95.2 %ile</strong></div>
            <div className="text-emerald-400 font-bold text-[11px]">✓ Ready for 1-Tap Autofill</div>
          </div>
        </div>
      ),
    },
    {
      stepNum: 4,
      title: "Step 4: Analyze Baseline & Avoidable Marks",
      description: "Review your personal baseline score, 7-attempt performance trend chart, and warning alerts for avoidable negative marking losses.",
      mockup: (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400">Personal Baseline Engine</span>
            <span className="text-emerald-400 font-bold">📈 Peak Trend</span>
          </div>
          <div className="text-2xl font-black text-white">138.5 <span className="text-xs text-slate-400">Baseline Score</span></div>
          <div className="p-2.5 bg-amber-950/60 border border-amber-800 rounded-xl text-[11px] text-amber-200">
            ⚠️ You lost 14.5 marks in negative penalty. Trimming guesses can boost +12 marks!
          </div>
        </div>
      ),
    },
    {
      stepNum: 5,
      title: "Step 5: Download Bilingual PDF Performance Report",
      description: "Generate a clean, printable bilingual (English & Hindi) PDF summary report of all your mock attempts, accuracy breakdown, and negative penalty analysis.",
      mockup: (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-indigo-400">Bilingual PDF Exporter</div>
            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full font-bold">EN / HI</span>
          </div>
          <p className="text-xs text-slate-300">
            Click below to generate and view your formatted performance document in a new tab:
          </p>
          <button
            onClick={() => {
              const html = generateBilingualReportHTML(candidate, activeExam, attempts);
              const win = window.open("", "_blank");
              if (win) {
                win.document.write(html);
                win.document.close();
              }
            }}
            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Generate &amp; View Bilingual Performance PDF</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <span>App Details &amp; Step-by-Step Guide</span>
          <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          Material Design 3 Indian Government Exam Mock Tracker Architecture
        </p>
      </div>

      {/* A. App Portfolio Overview */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
            MT
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">MockTrack v1.4.0</h2>
            <p className="text-xs text-indigo-200 font-medium">
              100% Offline • Zero Ads • Secure Exam Analytics
            </p>
          </div>
        </div>

        {/* Feature Grid Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-bold text-indigo-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>⚡ 10-Second Quick Logging</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-bold text-indigo-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>📸 OCR Scorecard Extraction</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-bold text-indigo-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>🔒 100% Offline Room Database</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-bold text-indigo-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
            <span>📈 Baseline &amp; Negative Marking</span>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs font-bold text-indigo-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-300 shrink-0" />
            <span>📄 Bilingual PDF Report Export</span>
          </div>
        </div>
      </div>

      {/* B. Interactive Step-by-Step Guide with Live UI Mockups */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 px-1">
          Interactive Step-by-Step Guide
        </h3>

        <div className="grid gap-3">
          {steps.map((step) => {
            const isExpanded = expandedStep === step.stepNum;

            return (
              <div
                key={step.stepNum}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.stepNum)}
                  className="w-full p-5 text-left flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center shrink-0">
                      {step.stepNum}
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {step.title}
                    </h4>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 dark:border-slate-800"
                    >
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.description}
                      </p>

                      {step.mockup}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* C. Official Supported Platforms Showcase */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
            Official Supported Mock Platforms
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Custom brand color tokens for major test series providers in India
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.values(PLATFORMS).map((p) => (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border ${p.bgClass} ${p.borderClass} space-y-1`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: p.brandColor }}
                />
                <h4 className={`font-black text-xs ${p.textClass}`}>{p.name}</h4>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* D. Developer Info & Feedback */}
      <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 text-center space-y-2 text-xs">
        <p className="font-bold text-slate-800 dark:text-slate-200">
          MockTrack Master UI • Built for Indian Exam Aspirants
        </p>
        <p className="text-slate-500 dark:text-slate-400">
          Version 1.4.0 • Contact Developer:{" "}
          <a
            href="mailto:mobographie@gmail.com"
            className="text-indigo-600 dark:text-indigo-400 font-bold underline"
          >
            mobographie@gmail.com
          </a>
        </p>
        <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Privacy Guaranteed: All scores stay 100% on your local device.</span>
        </div>
      </div>
    </div>
  );
};
