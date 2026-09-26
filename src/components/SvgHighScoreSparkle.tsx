import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, ArrowRight, Target, Award, X } from "lucide-react";
import { HapticService } from "../services/HapticService";
import { MascotCharacter } from "./MascotCharacter";

interface SvgHighScoreSparkleProps {
  isOpen: boolean;
  onClose: () => void;
  examName: string;
  newScore: number;
  prevScore?: number;
  maxMarks: number;
}

/**
 * Handcrafted SVG Doodles for Confetti & Success Sparkles
 */
const SvgConfettiDoodles: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Bursting Star 1 */}
      <motion.svg
        initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8], x: -90, y: -90, rotate: 45 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 w-8 h-8"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path d="M 20 0 L 25 15 L 40 20 L 25 25 L 20 40 L 15 25 L 0 20 L 15 15 Z" fill="#FBBF24" />
      </motion.svg>

      {/* Bursting Star 2 */}
      <motion.svg
        initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9], x: 90, y: -80, rotate: -30 }}
        transition={{ duration: 0.65, delay: 0.05, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 w-7 h-7"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path d="M 20 0 L 25 15 L 40 20 L 25 25 L 20 40 L 15 25 L 0 20 L 15 15 Z" fill="#38BDF8" />
      </motion.svg>

      {/* Confetti Ribbon Spiral 1 */}
      <motion.svg
        initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: [0, 1, 0.85], x: -110, y: 40, rotate: 120 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 w-10 h-10"
        viewBox="0 0 50 50"
        fill="none"
      >
        <path
          d="M 10 10 Q 30 15 25 30 T 40 45"
          stroke="#EC4899"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>

      {/* Confetti Ribbon Spiral 2 */}
      <motion.svg
        initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: [0, 1, 0.85], x: 105, y: 50, rotate: -80 }}
        transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 w-10 h-10"
        viewBox="0 0 50 50"
        fill="none"
      >
        <path
          d="M 40 10 Q 20 20 30 35 T 15 45"
          stroke="#10B981"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>

      {/* Floating Diamond Flakes */}
      <motion.div
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{ scale: 1, x: -60, y: -120, rotate: 45 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="absolute top-1/2 left-1/2 w-3.5 h-3.5 bg-amber-400 rounded-xs shadow-xs"
      />
      <motion.div
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{ scale: 1, x: 65, y: -115, rotate: -45 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="absolute top-1/2 left-1/2 w-3.5 h-3.5 bg-indigo-400 rounded-xs shadow-xs"
      />
      <motion.div
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{ scale: 1, x: -120, y: -30, rotate: 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-xs"
      />
      <motion.div
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{ scale: 1, x: 120, y: -20, rotate: -20 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="absolute top-1/2 left-1/2 w-3 h-3 bg-rose-400 rounded-full shadow-xs"
      />
    </div>
  );
};

export const SvgHighScoreSparkle: React.FC<SvgHighScoreSparkleProps> = ({
  isOpen,
  onClose,
  examName,
  newScore,
  prevScore,
  maxMarks,
}) => {
  if (!isOpen) return null;

  const scoreDelta = prevScore !== undefined && prevScore > 0 ? Math.round((newScore - prevScore) * 10) / 10 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-300 dark:border-amber-600 shadow-2xl p-6 text-center space-y-4 overflow-hidden">
        {/* Animated SVG Confetti & Sparkles */}
        <SvgConfettiDoodles />

        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-amber-400/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cheering Mascot + Trophy SVG Graphic */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-2">
          <motion.div
            initial={{ scale: 0.5, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="relative"
          >
            <MascotCharacter pose="cheering" size={96} />
          </motion.div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider mt-2 border border-amber-300 dark:border-amber-700 shadow-2xs font-display">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
            <span>New Personal Best!</span>
          </div>
        </div>

        {/* Scoreboard Highlight */}
        <div className="relative z-10 space-y-1">
          <h3 className="text-xl font-black font-display text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            High Score Unlocked!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {examName} • You crushed your previous record!
          </p>
        </div>

        {/* Score Comparison Display */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-indigo-50/50 to-emerald-50/70 dark:from-amber-950/30 dark:via-indigo-950/30 dark:to-emerald-950/30 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-around text-center">
          {prevScore !== undefined && prevScore > 0 && (
            <>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                  Previous Best
                </span>
                <span className="text-sm font-black font-display text-slate-600 dark:text-slate-300 tabular-nums">
                  {prevScore}
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
            </>
          )}

          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block tracking-wider">
              New High Score
            </span>
            <span className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 tabular-nums">
              {newScore} <span className="text-xs font-bold text-slate-400 font-sans">/ {maxMarks}</span>
            </span>
          </div>

          {scoreDelta !== null && scoreDelta > 0 && (
            <div className="pl-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block tracking-wider">
                Gain
              </span>
              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md tabular-nums inline-block">
                +{scoreDelta} pts
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="relative z-10 pt-1">
          <button
            type="button"
            onClick={() => {
              HapticService.achievement();
              onClose();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-105 active:scale-95 text-white font-black text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 font-display"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Awesome! Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
