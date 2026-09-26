import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

export type MascotPose = "explaining" | "cheering" | "analyzing" | "target" | "friendly";

interface MascotCharacterProps {
  pose?: MascotPose;
  size?: number | string;
  className?: string;
  animated?: boolean;
}

/**
 * High-quality handcrafted SVG vector cartoon mascot: "Ace" the Exam Mentor
 * Scalable, expressive, zero-dependency, and retina-crisp.
 */
export const MascotCharacter: React.FC<MascotCharacterProps> = ({
  pose = "explaining",
  size = 120,
  className = "",
  animated = true,
}) => {
  const isAnimatedClass = animated ? "animate-mascot-float" : "";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${isAnimatedClass} ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Cartoon Mentor Ace - ${pose} pose`}
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-md"
      >
        <defs>
          {/* Gradients for Mascot Body */}
          <linearGradient id="body-grad" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>

          <linearGradient id="belly-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          <linearGradient id="cap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="beak-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          <linearGradient id="glasses-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Shadow Filter */}
          <radialGradient id="ground-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="80" cy="148" rx="46" ry="7" fill="url(#ground-shadow)" />

        {/* Mascot Feet / Talons */}
        <path d="M 62 136 C 62 142 54 145 48 143 C 44 141 46 136 52 135 Z" fill="#EA580C" />
        <path d="M 98 136 C 98 142 106 145 112 143 C 116 141 114 136 108 135 Z" fill="#EA580C" />

        {/* Main Body (Friendly Rounded Chubby Owl/Mentor) */}
        <rect x="36" y="38" width="88" height="100" rx="44" fill="url(#body-grad)" />

        {/* Cute Ear Tufts */}
        <path d="M 44 42 L 32 20 L 58 35 Z" fill="#4338CA" />
        <path d="M 116 42 L 128 20 L 102 35 Z" fill="#4338CA" />

        {/* Creamy White Belly Chest Area */}
        <path
          d="M 52 74 C 52 64 108 64 108 74 C 112 98 108 130 80 130 C 52 130 48 98 52 74 Z"
          fill="url(#belly-grad)"
        />

        {/* Feather pattern on belly */}
        <path d="M 72 90 Q 80 96 88 90" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 68 102 Q 80 108 92 102" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 74 114 Q 80 120 86 114" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

        {/* Big Expressive Owl Eyes */}
        {/* Left Eye White */}
        <circle cx="62" cy="68" r="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        {/* Right Eye White */}
        <circle cx="98" cy="68" r="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

        {/* Left Pupil (Dynamic look based on pose) */}
        {pose === "cheering" ? (
          // Joyful arched eyes (^^)
          <path d="M 54 68 Q 62 60 70 68" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        ) : (
          <>
            <circle cx={pose === "analyzing" ? "64" : "63"} cy="68" r="9" fill="#0F172A" />
            <circle cx="61" cy="65" r="3" fill="#FFFFFF" />
            <circle cx="65" cy="71" r="1.5" fill="#818CF8" />
          </>
        )}

        {/* Right Pupil */}
        {pose === "cheering" ? (
          // Joyful arched eyes (^^)
          <path d="M 90 68 Q 98 60 106 68" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
        ) : (
          <>
            <circle cx={pose === "analyzing" ? "100" : "97"} cy="68" r="9" fill="#0F172A" />
            <circle cx="95" cy="65" r="3" fill="#FFFFFF" />
            <circle cx="99" cy="71" r="1.5" fill="#818CF8" />
          </>
        )}

        {/* Cute Smart Glasses (Golden Wireframe) */}
        <circle cx="62" cy="68" r="18" fill="none" stroke="url(#glasses-rim)" strokeWidth="3" />
        <circle cx="98" cy="68" r="18" fill="none" stroke="url(#glasses-rim)" strokeWidth="3" />
        <path d="M 80 68 L 80 68" stroke="url(#glasses-rim)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 75 66 Q 80 64 85 66" stroke="url(#glasses-rim)" strokeWidth="3" strokeLinecap="round" />

        {/* Glass reflection gloss on lenses */}
        <path d="M 52 58 L 58 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        <path d="M 88 58 L 94 54" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

        {/* Orange Beak */}
        <polygon points="80,72 73,84 87,84" fill="url(#beak-grad)" />

        {/* Pink Blush Cheeks */}
        <ellipse cx="46" cy="76" rx="5" ry="3" fill="#F43F5E" opacity="0.35" />
        <ellipse cx="114" cy="76" rx="5" ry="3" fill="#F43F5E" opacity="0.35" />

        {/* Graduation Mortarboard Cap */}
        <g id="graduation-cap">
          {/* Cap Skull Base */}
          <path d="M 64 30 C 64 24 96 24 96 30 L 94 36 C 94 38 66 38 66 36 Z" fill="#0F172A" />
          {/* Diamond Top */}
          <polygon points="80,12 126,27 80,38 34,27" fill="url(#cap-grad)" stroke="#334155" strokeWidth="1" />
          {/* Cap Button */}
          <circle cx="80" cy="25" r="3.5" fill="url(#gold-grad)" />
          {/* Golden Tassel hanging to right */}
          <path d="M 80 25 Q 110 28 116 42" stroke="url(#gold-grad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <polygon points="113,42 119,42 116,50" fill="url(#gold-grad)" />
        </g>

        {/* POSE-SPECIFIC WINGS & PROPS */}

        {/* 1. EXPLAINING POSE: Holding Golden Pointer + Clipboard */}
        {pose === "explaining" && (
          <g id="pose-explaining">
            {/* Left Wing resting on hip holding mini notebook */}
            <path
              d="M 38 85 C 28 92 26 108 34 116 C 38 112 42 98 44 88 Z"
              fill="#4338CA"
            />
            {/* Mini clipboard under left arm */}
            <rect x="22" y="90" width="16" height="22" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
            <path d="M 25 96 L 35 96 M 25 101 L 33 101 M 25 106 L 31 106" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />

            {/* Right Wing extended holding golden pointer */}
            <path
              d="M 122 85 C 134 82 144 74 150 68 C 146 64 136 72 120 78 Z"
              fill="#4338CA"
            />
            {/* Pointer Stick */}
            <line x1="140" y1="74" x2="158" y2="44" stroke="url(#gold-grad)" strokeWidth="3" strokeLinecap="round" />
            {/* Pointer Sparkle Star */}
            <path
              d="M 158 44 L 160 40 L 158 36 L 154 40 Z"
              fill="#FDE047"
            />

            {/* Lightbulb of insight over head */}
            <g transform="translate(132, 10) scale(0.65)">
              <circle cx="15" cy="15" r="10" fill="#FDE047" />
              <path d="M 11 23 L 19 23 L 17 28 L 13 28 Z" fill="#94A3B8" />
              <path d="M 15 2 L 15 0 M 26 6 L 28 4 M 4 6 L 2 4 M 27 15 L 30 15 M 0 15 L 3 15" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* 2. CHEERING POSE: Both Wings Up with Trophy */}
        {pose === "cheering" && (
          <g id="pose-cheering">
            {/* Left Wing Raised */}
            <path d="M 38 80 C 26 70 20 54 26 44 C 32 46 36 60 44 72 Z" fill="#4338CA" />
            {/* Right Wing Raised */}
            <path d="M 122 80 C 134 70 140 54 134 44 C 128 46 124 60 116 72 Z" fill="#4338CA" />

            {/* Gold Trophy in center */}
            <g transform="translate(64, 94) scale(0.8)">
              <path d="M 10 14 C 10 26 18 32 26 32 C 34 32 42 26 42 14 Z" fill="url(#gold-grad)" />
              <path d="M 8 18 C 0 18 0 28 8 28" stroke="url(#gold-grad)" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 44 18 C 52 18 52 28 44 28" stroke="url(#gold-grad)" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="22" y="32" width="8" height="8" fill="#D97706" />
              <rect x="16" y="40" width="20" height="6" rx="2" fill="#92400E" />
              <circle cx="26" cy="22" r="3" fill="#FFFFFF" opacity="0.8" />
            </g>

            {/* Confetti Sparks around */}
            <circle cx="22" cy="30" r="2.5" fill="#38BDF8" />
            <circle cx="138" cy="28" r="3" fill="#F43F5E" />
            <polygon points="18,52 22,50 20,56" fill="#FBBF24" />
            <polygon points="142,54 146,52 144,58" fill="#10B981" />
          </g>
        )}

        {/* 3. ANALYZING POSE: Magnifying Glass over Scorecard */}
        {pose === "analyzing" && (
          <g id="pose-analyzing">
            {/* Scorecard in Left Wing */}
            <rect x="18" y="78" width="28" height="36" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
            <path d="M 24 88 L 40 88" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 24 94 L 38 94" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            <path d="M 24 100 L 34 100" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
            {/* Left Wing holding sheet */}
            <circle cx="44" cy="98" r="6" fill="#4338CA" />

            {/* Right Wing with Magnifying Glass */}
            <path d="M 120 86 C 128 92 128 104 120 112 Z" fill="#4338CA" />
            {/* Magnifier Glass Circle */}
            <circle cx="106" cy="96" r="14" fill="#E0F2FE" fillOpacity="0.45" stroke="#0284C7" strokeWidth="3" />
            <line x1="116" y1="106" x2="128" y2="118" stroke="#0369A1" strokeWidth="4" strokeLinecap="round" />
            {/* Inspect checkmark inside lens */}
            <path d="M 101 96 L 105 100 L 112 92" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 4. TARGET POSE: Holding Dart Arrow aimed at bullseye */}
        {pose === "target" && (
          <g id="pose-target">
            {/* Left wing pointing to target */}
            <path d="M 38 85 C 28 88 18 94 14 102 C 18 104 28 98 42 90 Z" fill="#4338CA" />

            {/* Right wing with dart */}
            <path d="M 120 80 C 130 84 138 90 144 96 C 140 100 130 94 118 88 Z" fill="#4338CA" />
            {/* Dart */}
            <line x1="126" y1="92" x2="150" y2="76" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <polygon points="152,74 146,74 149,80" fill="#EF4444" />
            <polygon points="126,92 122,90 125,96" fill="#38BDF8" />
          </g>
        )}

        {/* 5. FRIENDLY POSE: Waving Hello */}
        {pose === "friendly" && (
          <g id="pose-friendly">
            {/* Left wing relaxed */}
            <path d="M 40 85 C 32 94 32 108 40 114 Z" fill="#4338CA" />
            {/* Right wing waving up */}
            <path d="M 122 80 C 134 72 144 60 142 50 C 136 50 128 64 118 74 Z" fill="#4338CA" />
            {/* Sparkle */}
            <circle cx="146" cy="44" r="3" fill="#FDE047" />
          </g>
        )}
      </svg>
    </div>
  );
};

interface MascotSpeechCardProps {
  pose?: MascotPose;
  title: string;
  message: string;
  badge?: string;
  actionText?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Animated Mascot Speech Card with high-quality SVG cartoon character
 * Explains features cleanly without text dump.
 */
export const MascotSpeechCard: React.FC<MascotSpeechCardProps> = ({
  pose = "explaining",
  title,
  message,
  badge = "Ace says",
  actionText,
  onAction,
  onDismiss,
  className = "",
  compact = false,
}) => {
  return (
    <div
      className={`card-luminous rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-white to-amber-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-amber-950/10 flex items-center gap-3.5 sm:gap-4 relative overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700 ${className}`}
    >
      {/* Optional Dismiss (X) button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer z-10"
          title="Dismiss"
          aria-label="Dismiss Tip"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Decorative background glow orb */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-xl pointer-events-none" />

      {/* Animated Mascot Vector Character */}
      <div className="shrink-0 flex items-center justify-center">
        <MascotCharacter pose={pose} size={compact ? 72 : 88} />
      </div>

      {/* Speech Content Bubble */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
            {badge}
          </span>
          <h3 className="text-xs sm:text-sm font-black font-display text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {title}
          </h3>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
          {message}
        </p>

        {actionText && onAction && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onAction}
              className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer inline-flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>{actionText}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * High quality handcrafted SVG Vector Doodles for clean animated visual flair
 */
export const VectorDoodleTarget: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <defs>
      <linearGradient id="t-ring1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
      <linearGradient id="t-ring2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
      <linearGradient id="t-ring3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#EA580C" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="36" fill="url(#t-ring1)" />
    <circle cx="40" cy="40" r="28" fill="#FFFFFF" />
    <circle cx="40" cy="40" r="20" fill="url(#t-ring2)" />
    <circle cx="40" cy="40" r="12" fill="#FFFFFF" />
    <circle cx="40" cy="40" r="6" fill="url(#t-ring3)" />
    {/* Arrow striking center */}
    <line x1="68" y1="12" x2="42" y2="38" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
    <polygon points="68,12 60,14 66,20" fill="#38BDF8" />
  </svg>
);

export const VectorDoodleTrophy: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <defs>
      <linearGradient id="trop-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <ellipse cx="40" cy="74" rx="20" ry="4" fill="#1E293B" opacity="0.2" />
    <rect x="26" y="58" width="28" height="12" rx="3" fill="#B45309" />
    <rect x="34" y="46" width="12" height="14" fill="#D97706" />
    <path d="M 18 16 C 18 36 28 46 40 46 C 52 46 62 36 62 16 Z" fill="url(#trop-gold)" />
    <path d="M 18 20 C 6 20 6 34 18 34" stroke="url(#trop-gold)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M 62 20 C 74 20 74 34 62 34" stroke="url(#trop-gold)" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="40" cy="28" r="6" fill="#FEF08A" opacity="0.9" />
    {/* Star shimmer */}
    <path d="M 52 10 L 54 6 L 56 10 L 60 12 L 56 14 L 54 18 L 52 14 L 48 12 Z" fill="#FDE047" />
  </svg>
);

export const VectorDoodleScorecard: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <rect x="14" y="8" width="52" height="64" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
    {/* Header bar */}
    <rect x="22" y="16" width="24" height="4" rx="2" fill="#4F46E5" />
    {/* Lines */}
    <rect x="22" y="26" width="36" height="3" rx="1.5" fill="#E2E8F0" />
    <rect x="22" y="34" width="32" height="3" rx="1.5" fill="#E2E8F0" />
    <rect x="22" y="42" width="28" height="3" rx="1.5" fill="#E2E8F0" />
    {/* Green checkmark */}
    <path d="M 22 54 L 26 58 L 34 50" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* A+ Stamp */}
    <g transform="translate(42, 44)">
      <circle cx="12" cy="12" r="12" fill="#EF4444" opacity="0.15" />
      <text x="6" y="17" fill="#DC2626" fontSize="14" fontWeight="900" fontFamily="sans-serif">
        A+
      </text>
    </g>
  </svg>
);
