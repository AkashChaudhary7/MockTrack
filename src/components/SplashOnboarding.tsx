import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { AppLogo } from "./AppLogo";

interface SplashOnboardingProps {
  onDismiss: () => void;
}

export const SplashOnboarding: React.FC<SplashOnboardingProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white p-6 overflow-hidden">
      {/* Background Glow Rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header info */}
      <div className="flex justify-between items-center pt-4 z-10">
        <span className="text-xs font-semibold px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-indigo-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          M3 Indian Exam Tracker
        </span>
        <button
          onClick={onDismiss}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
        >
          Skip Intro
        </button>
      </div>

      {/* Center Hero */}
      <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-6">
        {/* Emblem with Pulsing Ring */}
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 opacity-40 blur-md"
          />
          <AppLogo size="2xl" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2 max-w-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            MockTrack
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            Track Mocks • Analyze Baseline • Crack Your Exam
          </p>
        </div>

        {/* Supported Exam Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {["SSC CGL", "IBPS PO", "RRB NTPC", "UPSC"].map((exam) => (
            <span
              key={exam}
              className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 border border-slate-700 text-indigo-200 shadow-sm"
            >
              [{exam}]
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4 w-full max-w-xs">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-base shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Start Tracking Mocks
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400 z-10 pb-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Local &amp; Secure Data Persistence</span>
        </div>
        <span className="hidden sm:inline text-slate-600">•</span>
        <a
          href="https://mocktrack.ictlabgsssaidana.workers.dev/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-300 hover:text-white underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
};
