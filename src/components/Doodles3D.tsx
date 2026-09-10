import React from "react";

interface DoodleProps {
  className?: string;
  size?: number;
}

/**
 * 3D Clay & Isometric Handcrafted Target Bullseye Doodle
 */
export const Doodle3DTarget: React.FC<DoodleProps> = ({ className = "", size = 64 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none filter drop-shadow-md ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Ambient Ground Shadow */}
        <radialGradient id="target-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4338CA" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
        </radialGradient>

        {/* Outer Ring 3D Gradient */}
        <radialGradient id="ring-outer-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </radialGradient>

        {/* Middle Ring 3D Gradient */}
        <radialGradient id="ring-mid-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>

        {/* Inner Ring 3D Gradient */}
        <radialGradient id="ring-inner-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </radialGradient>

        {/* Bullseye Gold 3D Core */}
        <radialGradient id="ring-core-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Dart Shaft Gradient */}
        <linearGradient id="dart-shaft-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Dart Flight / Wings */}
        <linearGradient id="dart-wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Specular Highlight */}
        <linearGradient id="specular-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ground cast shadow */}
      <ellipse cx="60" cy="108" rx="46" ry="9" fill="url(#target-ground-shadow)" />

      {/* Target Base - Beveled 3D rim */}
      <circle cx="60" cy="58" r="48" fill="#312E81" />
      <circle cx="60" cy="56" r="48" fill="url(#ring-outer-grad)" />

      {/* White Middle Ring */}
      <circle cx="60" cy="58" r="37" fill="#94A3B8" />
      <circle cx="60" cy="56" r="37" fill="url(#ring-mid-grad)" />

      {/* Red Ring */}
      <circle cx="60" cy="58" r="26" fill="#991B1B" />
      <circle cx="60" cy="56" r="26" fill="url(#ring-inner-grad)" />

      {/* Golden Center Bullseye */}
      <circle cx="60" cy="58" r="14" fill="#92400E" />
      <circle cx="60" cy="56" r="14" fill="url(#ring-core-grad)" />

      {/* Specular Gloss Arc on Rings */}
      <path
        d="M 32 36 A 40 40 0 0 1 88 36"
        stroke="url(#specular-shine)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="48" cy="44" r="2.5" fill="#FFFFFF" opacity="0.8" />

      {/* 3D Dart hitting the Bullseye */}
      <g transform="rotate(-32 60 56)">
        {/* Dart needle tip */}
        <line x1="60" y1="56" x2="60" y2="40" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        {/* Dart metal barrel */}
        <rect x="58" y="24" width="4" height="16" rx="2" fill="url(#dart-shaft-grad)" />
        {/* Dart grip grooves */}
        <line x1="58" y1="28" x2="62" y2="28" stroke="#1E293B" strokeWidth="1" />
        <line x1="58" y1="32" x2="62" y2="32" stroke="#1E293B" strokeWidth="1" />
        {/* Dart Flights / Fins */}
        <path d="M 60 22 L 50 8 L 60 12 L 70 8 Z" fill="url(#dart-wing-grad)" />
        <path d="M 60 22 L 53 10 L 60 13 Z" fill="#0369A1" />
      </g>

      {/* Impact Sparks */}
      <circle cx="53" cy="52" r="1.5" fill="#FEF08A" />
      <circle cx="67" cy="50" r="1.8" fill="#FDE047" />
      <circle cx="62" cy="65" r="1.2" fill="#FBBF24" />
    </svg>
  );
};

/**
 * 3D Handcrafted Clay Flame Doodle (For Streaks)
 */
export const Doodle3DFlame: React.FC<DoodleProps> = ({ className = "", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none filter drop-shadow-md ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="flame-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flame-outer" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="60%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
        <radialGradient id="flame-inner" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>

      <ellipse cx="50" cy="90" rx="32" ry="7" fill="url(#flame-ground)" />

      {/* 3D Depth Shadow under flame */}
      <path
        d="M 50 14 C 58 26 76 42 76 64 C 76 80 64 88 50 88 C 36 88 24 80 24 64 C 24 45 42 26 50 14 Z"
        fill="#9A3412"
        transform="translate(0, 3)"
      />

      {/* Main Orange Flame Body */}
      <path
        d="M 50 12 C 58 24 76 40 76 62 C 76 78 64 86 50 86 C 36 86 24 78 24 62 C 24 43 42 24 50 12 Z"
        fill="url(#flame-outer)"
      />

      {/* Inner Yellow Core */}
      <path
        d="M 50 36 C 55 45 64 56 64 68 C 64 78 58 82 50 82 C 42 82 36 78 36 68 C 36 57 45 45 50 36 Z"
        fill="url(#flame-inner)"
      />

      {/* Specular curved gloss */}
      <path
        d="M 32 54 C 30 62 33 72 40 78"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.65"
      />
      <circle cx="50" cy="46" r="3" fill="#FFFFFF" opacity="0.75" />

      {/* Floating ember spark */}
      <circle cx="68" cy="28" r="2.5" fill="#FDE047" />
      <circle cx="34" cy="34" r="2" fill="#FB923C" />
    </svg>
  );
};

/**
 * 3D Golden Cup Trophy Doodle (For Highest Score / Personal Best)
 */
export const Doodle3DTrophy: React.FC<DoodleProps> = ({ className = "", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none filter drop-shadow-md ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="trophy-gold-cup" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>
        <linearGradient id="trophy-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="92" rx="30" ry="6" fill="#000000" opacity="0.15" />

      {/* Trophy Handles */}
      <path
        d="M 30 30 C 14 30 14 50 28 56 M 70 30 C 86 30 86 50 72 56"
        stroke="#CA8A04"
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 30 28 C 16 28 16 48 30 54 M 70 28 C 84 28 84 48 70 54"
        stroke="#FACC15"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Base Pedestal */}
      <rect x="36" y="76" width="28" height="12" rx="4" fill="url(#trophy-base)" />
      <rect x="42" y="66" width="16" height="12" rx="2" fill="#CA8A04" />
      <rect x="44" y="64" width="12" height="12" rx="2" fill="#FACC15" />

      {/* Cup Bowl */}
      <path
        d="M 28 22 L 72 22 C 72 44 64 62 50 62 C 36 62 28 44 28 22 Z"
        fill="#A16207"
        transform="translate(0, 2)"
      />
      <path
        d="M 28 20 L 72 20 C 72 42 64 60 50 60 C 36 60 28 42 28 20 Z"
        fill="url(#trophy-gold-cup)"
      />

      {/* Cup Rim */}
      <ellipse cx="50" cy="20" rx="22" ry="5.5" fill="#FEF08A" />

      {/* Star in Center */}
      <path
        d="M 50 32 L 52.5 38 L 59 38.5 L 54 43 L 55.5 49 L 50 45.5 L 44.5 49 L 46 43 L 41 38.5 L 47.5 38 Z"
        fill="#FFFFFF"
        opacity="0.9"
      />

      {/* Specular sheen */}
      <path
        d="M 34 26 C 33 36 37 48 42 54"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
};

/**
 * 3D Clay Stopwatch Doodle (For Practice Time / Speed)
 */
export const Doodle3DStopwatch: React.FC<DoodleProps> = ({ className = "", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none filter drop-shadow-md ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="stopwatch-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
      </defs>

      <ellipse cx="50" cy="92" rx="28" ry="6" fill="#000000" opacity="0.12" />

      {/* Top Plunger */}
      <rect x="46" y="10" width="8" height="8" rx="2" fill="#94A3B8" />
      <rect x="42" y="6" width="16" height="5" rx="2.5" fill="#CBD5E1" />

      {/* Outer Watch Case */}
      <circle cx="50" cy="56" r="34" fill="#075985" />
      <circle cx="50" cy="53" r="34" fill="url(#stopwatch-body)" />

      {/* Clock Face White Dial */}
      <circle cx="50" cy="53" r="26" fill="#FFFFFF" />

      {/* Tick Marks */}
      <circle cx="50" cy="32" r="1.5" fill="#64748B" />
      <circle cx="71" cy="53" r="1.5" fill="#64748B" />
      <circle cx="50" cy="74" r="1.5" fill="#64748B" />
      <circle cx="29" cy="53" r="1.5" fill="#64748B" />

      {/* Clock Hands */}
      <line x1="50" y1="53" x2="62" y2="42" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="50" y1="53" x2="44" y2="45" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="53" r="3" fill="#1E293B" />

      {/* Glass Glare */}
      <path
        d="M 32 42 A 22 22 0 0 1 66 34"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

/**
 * 3D Handcrafted Feedback / Suggestion Mail Letter Doodle
 */
export const Doodle3DFeedbackMail: React.FC<DoodleProps> = ({ className = "", size = 64 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none filter drop-shadow-lg ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mail-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="envelope-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="60%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="letter-sheet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <radialGradient id="heart-stamp" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </radialGradient>
      </defs>

      {/* Ambient shadow */}
      <ellipse cx="60" cy="108" rx="44" ry="8" fill="url(#mail-ground)" />

      {/* Floating emerging letter card */}
      <g transform="translate(4, -8) rotate(-4 60 50)">
        <rect
          x="28"
          y="20"
          width="64"
          height="54"
          rx="6"
          fill="#E2E8F0"
          transform="translate(0, 3)"
        />
        <rect
          x="28"
          y="20"
          width="64"
          height="54"
          rx="6"
          fill="url(#letter-sheet)"
        />

        {/* Ruled notepad lines */}
        <line x1="36" y1="32" x2="68" y2="32" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
        <line x1="36" y1="42" x2="80" y2="42" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="50" x2="74" y2="50" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="58" x2="62" y2="58" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

        {/* 3D Heart sticker badge on the letter */}
        <circle cx="78" cy="30" r="7" fill="url(#heart-stamp)" />
        <path
          d="M 78 33 C 78 33 74 30.5 74 28.5 C 74 27.2 75 26.5 76 26.5 C 77 26.5 77.8 27.2 78 27.8 C 78.2 27.2 79 26.5 80 26.5 C 81 26.5 82 27.2 82 28.5 C 82 30.5 78 33 78 33 Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Envelope Back & Interior */}
      <rect x="18" y="52" width="84" height="48" rx="8" fill="#3730A3" />

      {/* Envelope Pocket Front */}
      <path
        d="M 18 60 L 60 84 L 102 60 L 102 92 C 102 96.4 98.4 100 94 100 L 26 100 C 21.6 100 18 96.4 18 92 Z"
        fill="url(#envelope-front)"
      />

      {/* Left and Right Fold Flaps */}
      <path d="M 18 60 L 52 82 L 18 100 Z" fill="#4338CA" opacity="0.6" />
      <path d="M 102 60 L 68 82 L 102 100 Z" fill="#3730A3" opacity="0.6" />

      {/* Specular gloss on pocket edge */}
      <path
        d="M 22 96 L 98 96"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Cute Floating Pencil / Sparkle */}
      <g transform="translate(86, 24) rotate(24)">
        <rect x="0" y="0" width="8" height="24" rx="2" fill="#F59E0B" />
        <rect x="0" y="0" width="8" height="5" rx="1" fill="#F43F5E" />
        <polygon points="0,24 8,24 4,32" fill="#FDE68A" />
        <polygon points="2,28 6,28 4,32" fill="#1E293B" />
      </g>

      {/* Floating micro stars */}
      <circle cx="22" cy="38" r="2.5" fill="#FACC15" />
      <circle cx="16" cy="46" r="1.5" fill="#FDE047" />
    </svg>
  );
};

/**
 * 3D Handcrafted Sparkle Star
 */
export const Doodle3DSparkle: React.FC<DoodleProps> = ({ className = "", size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="star-sparkle" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      <path
        d="M 20 2 C 20 12 28 20 38 20 C 28 20 20 28 20 38 C 20 28 12 20 2 20 C 12 20 20 12 20 2 Z"
        fill="url(#star-sparkle)"
      />
      <circle cx="20" cy="20" r="3.5" fill="#FFFFFF" />
    </svg>
  );
};

/**
 * 3D Handcrafted Shield (for Cutoff Probability & Safety)
 */
export const Doodle3DShield: React.FC<DoodleProps> = ({ className = "", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none filter drop-shadow-md ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="shield-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="shield-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="92" rx="36" ry="7" fill="url(#shield-shadow)" />

      {/* Outer 3D Shield */}
      <path
        d="M 50 14 C 74 14 84 22 84 46 C 84 70 50 86 50 86 C 50 86 16 70 16 46 C 16 22 26 14 50 14 Z"
        fill="#075985"
        transform="translate(0, 3)"
      />
      <path
        d="M 50 14 C 74 14 84 22 84 46 C 84 70 50 86 50 86 C 50 86 16 70 16 46 C 16 22 26 14 50 14 Z"
        fill="url(#shield-grad)"
      />

      {/* Inner Highlight Layer */}
      <path
        d="M 50 20 C 68 20 76 26 76 46 C 76 65 50 78 50 78 C 50 78 24 65 24 46 C 24 26 32 20 50 20 Z"
        fill="url(#shield-inner)"
      />

      {/* 3D Checkmark */}
      <path
        d="M 36 48 L 46 58 L 66 38"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 3D Handcrafted Scorecard / Exam Paper Doodle
 */
export const Doodle3DScorecard: React.FC<DoodleProps> = ({ className = "", size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none filter drop-shadow-md ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="paper-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4338CA" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sheet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>

      <ellipse cx="50" cy="90" rx="34" ry="7" fill="url(#paper-shadow)" />

      {/* Back Shadow Page */}
      <rect x="22" y="18" width="56" height="68" rx="6" fill="#CBD5E1" transform="rotate(-6 50 50)" />

      {/* Front Isometric Sheet */}
      <rect x="24" y="16" width="54" height="68" rx="6" fill="url(#sheet-grad)" />

      {/* Score Badge Pill */}
      <rect x="30" y="24" width="24" height="7" rx="3.5" fill="#6366F1" />
      <circle cx="68" cy="28" r="4" fill="#10B981" />

      {/* Simulated question score bars */}
      <line x1="30" y1="40" x2="68" y2="40" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="50" x2="60" y2="50" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="60" x2="70" y2="60" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="70" x2="52" y2="70" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

      {/* Pen Doodle */}
      <g transform="translate(64, 48) rotate(35)">
        <rect x="0" y="0" width="6" height="28" rx="2" fill="#F59E0B" />
        <polygon points="0,28 6,28 3,34" fill="#1E293B" />
      </g>
    </svg>
  );
};

