import React from "react";

interface SvgProps {
  className?: string;
  size?: number;
}

/**
 * HQ Vector Graphic: Precision Concentric Target & Radar Bullseye
 * Used in Target Score Banner and High-Performance Indicators
 */
export const HqSvgTarget: React.FC<SvgProps & { progressPercent?: number; isMet?: boolean }> = ({
  className = "",
  size = 64,
  progressPercent = 75,
  isMet = false,
}) => {
  // Calculate arc stroke for circular mini-meter if desired
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, progressPercent)) / 100) * circumference;

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
        {/* Soft Ambient Radial Shadow */}
        <radialGradient id="hq-target-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>

        {/* Outer Titanium Bezel */}
        <linearGradient id="hq-target-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="50%" stopColor="#C7D2FE" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>

        {/* Concentric Primary Ring (Sapphire / Indigo) */}
        <radialGradient id="hq-target-ring1" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="45%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </radialGradient>

        {/* Middle Clean Ring */}
        <radialGradient id="hq-target-ring2" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </radialGradient>

        {/* Ruby Focus Ring */}
        <radialGradient id="hq-target-ring3" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </radialGradient>

        {/* Gold Radiant Bullseye Core */}
        <radialGradient id="hq-target-core" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Progress Arc Gradient */}
        <linearGradient id="hq-target-arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Precision Crosshair Glow */}
        <linearGradient id="hq-crosshair-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Ground Glow Shadow */}
      <ellipse cx="60" cy="110" rx="44" ry="7" fill="url(#hq-target-shadow)" />

      {/* Progress Track (Background & Fill) */}
      <circle
        cx="60"
        cy="58"
        r={radius}
        stroke="#E0E7FF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="4 6"
        opacity="0.6"
      />
      <circle
        cx="60"
        cy="58"
        r={radius}
        stroke="url(#hq-target-arc-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 60 58)"
      />

      {/* Beveled Outer Shield Disc */}
      <circle cx="60" cy="60" r="39" fill="#1E1B4B" />
      <circle cx="60" cy="58" r="39" fill="url(#hq-target-ring1)" />

      {/* Middle White Ring with 3D Bevel */}
      <circle cx="60" cy="59" r="29" fill="#94A3B8" opacity="0.5" />
      <circle cx="60" cy="58" r="29" fill="url(#hq-target-ring2)" />

      {/* Inner Red Precision Ring */}
      <circle cx="60" cy="59" r="19" fill="#881337" opacity="0.6" />
      <circle cx="60" cy="58" r="19" fill="url(#hq-target-ring3)" />

      {/* Center Golden Core */}
      <circle cx="60" cy="59" r="10" fill="#78350F" />
      <circle cx="60" cy="58" r="10" fill="url(#hq-target-core)" />

      {/* Precision Crosshair Lines */}
      <line x1="60" y1="23" x2="60" y2="35" stroke="url(#hq-crosshair-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="81" x2="60" y2="93" stroke="url(#hq-crosshair-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="25" y1="58" x2="37" y2="58" stroke="url(#hq-crosshair-grad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="83" y1="58" x2="95" y2="58" stroke="url(#hq-crosshair-grad)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Specular Curved Sheen */}
      <path
        d="M 38 42 A 26 26 0 0 1 82 42"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Precision Ticks on Outer Ring */}
      <circle cx="60" cy="27" r="1.5" fill="#FFFFFF" />
      <circle cx="91" cy="58" r="1.5" fill="#FFFFFF" />
      <circle cx="60" cy="89" r="1.5" fill="#FFFFFF" />
      <circle cx="29" cy="58" r="1.5" fill="#FFFFFF" />

      {/* Success Sparkle or Crosshair Needle */}
      {isMet ? (
        <g transform="translate(74, 20)">
          <circle cx="12" cy="12" r="12" fill="#10B981" />
          <path
            d="M 8 12 L 11 15 L 17 9"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        <g transform="rotate(-30 60 58)">
          <circle cx="60" cy="58" r="2" fill="#FFFFFF" />
          <circle cx="60" cy="58" r="4.5" stroke="#FFFFFF" strokeWidth="1" opacity="0.7" />
        </g>
      )}
    </svg>
  );
};

/**
 * HQ Vector Graphic: Total Mocks Dossier (Volume & Stamina)
 */
export const HqSvgMocksDossier: React.FC<SvgProps> = ({ className = "", size = 48 }) => {
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
        <radialGradient id="hq-dossier-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4338CA" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hq-sheet-back" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id="hq-sheet-front" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
        <linearGradient id="hq-ribbon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <radialGradient id="hq-seal-gold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="92" rx="34" ry="6" fill="url(#hq-dossier-shadow)" />

      {/* Back Layer Sheet */}
      <rect x="26" y="14" width="54" height="68" rx="6" fill="#94A3B8" opacity="0.3" transform="rotate(-6 50 50)" />
      <rect x="24" y="16" width="54" height="68" rx="6" fill="url(#hq-sheet-back)" transform="rotate(-6 50 50)" />

      {/* Front Primary Exam Dossier */}
      <rect x="22" y="20" width="56" height="68" rx="6" fill="#CBD5E1" transform="translate(0, 2)" />
      <rect x="22" y="20" width="56" height="68" rx="6" fill="url(#hq-sheet-front)" />

      {/* Header Accent Bar */}
      <path d="M 22 26 C 22 22.7 24.7 20 28 20 L 72 20 C 75.3 20 78 22.7 78 26 L 78 30 L 22 30 Z" fill="url(#hq-ribbon-grad)" />

      {/* Test Title Placeholder & Checkmarks */}
      <line x1="30" y1="40" x2="62" y2="40" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="48" x2="70" y2="48" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="56" x2="65" y2="56" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="64" x2="52" y2="64" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* Bookmark Ribbon on Top Right */}
      <path d="M 64 16 L 72 16 L 72 32 L 68 28 L 64 32 Z" fill="#EF4444" />

      {/* Gold Approved Audit Seal */}
      <circle cx="64" cy="68" r="9" fill="url(#hq-seal-gold)" />
      <path
        d="M 61 68 L 63.5 70.5 L 67.5 65.5"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * HQ Vector Graphic: Radiant Streak Flame (Consistency & Momentum)
 */
export const HqSvgStreakFlame: React.FC<SvgProps> = ({ className = "", size = 48 }) => {
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
        <radialGradient id="hq-flame-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hq-flame-outer" cx="42%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="35%" stopColor="#FB923C" />
          <stop offset="70%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </radialGradient>
        <radialGradient id="hq-flame-mid" cx="42%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F97316" />
        </radialGradient>
        <radialGradient id="hq-flame-core" cx="45%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#FBBF24" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="91" rx="32" ry="7" fill="url(#hq-flame-shadow)" />

      {/* Outer 3D Body */}
      <path
        d="M 50 10 C 58 22 78 38 78 62 C 78 80 65 88 50 88 C 35 88 22 80 22 62 C 22 41 42 22 50 10 Z"
        fill="#7C2D12"
        transform="translate(0, 2)"
      />
      <path
        d="M 50 10 C 58 22 78 38 78 62 C 78 80 65 88 50 88 C 35 88 22 80 22 62 C 22 41 42 22 50 10 Z"
        fill="url(#hq-flame-outer)"
      />

      {/* Middle Golden Tongue */}
      <path
        d="M 50 28 C 56 38 68 50 68 68 C 68 80 60 84 50 84 C 40 84 32 80 32 68 C 32 54 44 38 50 28 Z"
        fill="url(#hq-flame-mid)"
      />

      {/* Inner White-Hot Core */}
      <path
        d="M 50 46 C 54 54 60 62 60 74 C 60 80 55 82 50 82 C 45 82 40 80 40 74 C 40 64 46 54 50 46 Z"
        fill="url(#hq-flame-core)"
      />

      {/* Specular Curved Highlight */}
      <path
        d="M 32 50 C 30 60 34 72 40 78"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Rising Embers & Sparkles */}
      <circle cx="70" cy="24" r="2.5" fill="#FDE047" />
      <circle cx="30" cy="30" r="2" fill="#FB923C" />
      <circle cx="50" cy="6" r="1.5" fill="#FEF08A" />
    </svg>
  );
};

/**
 * HQ Vector Graphic: Golden Chalice Trophy (Peak Score / Personal Best)
 */
export const HqSvgPeakTrophy: React.FC<SvgProps> = ({ className = "", size = 48 }) => {
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
        <radialGradient id="hq-trophy-gold" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#FACC15" />
          <stop offset="70%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient>
        <linearGradient id="hq-trophy-pedestal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Base Shadow */}
      <ellipse cx="50" cy="92" rx="30" ry="6" fill="#000000" opacity="0.2" />

      {/* Left & Right Dual Handles */}
      <path
        d="M 28 28 C 12 28 12 50 26 56 M 72 28 C 88 28 88 50 74 56"
        stroke="#A16207"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 28 26 C 14 26 14 48 28 54 M 72 26 C 86 26 86 48 72 54"
        stroke="#FDE047"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pedestal Base */}
      <rect x="34" y="76" width="32" height="12" rx="4" fill="url(#hq-trophy-pedestal)" />
      <rect x="42" y="65" width="16" height="12" rx="2" fill="#CA8A04" />
      <rect x="44" y="63" width="12" height="12" rx="2" fill="#FACC15" />

      {/* Main Chalice Bowl */}
      <path
        d="M 26 18 L 74 18 C 74 44 65 62 50 62 C 35 62 26 44 26 18 Z"
        fill="#854D0E"
        transform="translate(0, 2)"
      />
      <path
        d="M 26 18 L 74 18 C 74 44 65 62 50 62 C 35 62 26 44 26 18 Z"
        fill="url(#hq-trophy-gold)"
      />

      {/* Chalice Rim Oval */}
      <ellipse cx="50" cy="18" rx="24" ry="5.5" fill="#FEF08A" />

      {/* Faceted Diamond Star in Center */}
      <path
        d="M 50 30 L 52.5 37 L 59.5 37.5 L 54.5 42 L 56 49 L 50 45 L 44 49 L 45.5 42 L 40.5 37.5 L 47.5 37 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />

      {/* Specular Sheen Curved Arc */}
      <path
        d="M 33 24 C 31 34 35 48 41 54"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
};

/**
 * HQ Vector Graphic: Precision Dial & Operational Compass (Average Benchmark)
 */
export const HqSvgCompassAverage: React.FC<SvgProps> = ({ className = "", size = 48 }) => {
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
        <radialGradient id="hq-avg-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4338CA" />
        </radialGradient>
        <linearGradient id="hq-dial-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="hq-needle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="50" cy="91" rx="30" ry="6" fill="#000000" opacity="0.16" />

      {/* Outer Titanium Bezel */}
      <circle cx="50" cy="53" r="38" fill="#312E81" />
      <circle cx="50" cy="51" r="38" fill="url(#hq-avg-body)" />

      {/* Inner Instrument Dial Face */}
      <circle cx="50" cy="51" r="30" fill="url(#hq-dial-face)" stroke="#E2E8F0" strokeWidth="1" />

      {/* Calibrated Tick Marks Around Circumference */}
      <line x1="50" y1="25" x2="50" y2="30" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <line x1="76" y1="51" x2="71" y2="51" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="77" x2="50" y2="72" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="51" x2="29" y2="51" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

      {/* Diagonal Sub-Ticks */}
      <line x1="68" y1="33" x2="65" y2="36" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="69" x2="65" y2="66" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="69" x2="35" y2="66" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="33" x2="35" y2="36" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Steady Operational Benchmark Needle (Angled forward) */}
      <polygon points="50,26 53,51 47,51" fill="url(#hq-needle-grad)" />
      <polygon points="50,68 52,51 48,51" fill="#475569" />

      {/* Center Pivot Jewel */}
      <circle cx="50" cy="51" r="5" fill="#1E293B" />
      <circle cx="50" cy="51" r="2.5" fill="#F8FAFC" />

      {/* Glass Glare */}
      <path
        d="M 30 40 A 24 24 0 0 1 70 32"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

/**
 * HQ Vector Graphic: Guardian Safety Shield (Cutoff Probability Gauge)
 */
export const HqSvgShieldCutoff: React.FC<SvgProps> = ({ className = "", size = 48 }) => {
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
        <radialGradient id="hq-shield-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hq-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="hq-shield-inner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="91" rx="34" ry="7" fill="url(#hq-shield-shadow)" />

      {/* Outer 3D Shield Rim */}
      <path
        d="M 50 12 C 75 12 85 20 85 45 C 85 70 50 86 50 86 C 50 86 15 70 15 45 C 15 20 25 12 50 12 Z"
        fill="#064E3B"
        transform="translate(0, 3)"
      />
      <path
        d="M 50 12 C 75 12 85 20 85 45 C 85 70 50 86 50 86 C 50 86 15 70 15 45 C 15 20 25 12 50 12 Z"
        fill="url(#hq-shield-grad)"
      />

      {/* Inner Beveled Highlight Core */}
      <path
        d="M 50 18 C 70 18 78 24 78 45 C 78 65 50 78 50 78 C 50 78 22 65 22 45 C 22 24 30 18 50 18 Z"
        fill="url(#hq-shield-inner)"
      />

      {/* Bold Embossed Checkmark */}
      <path
        d="M 34 47 L 46 59 L 66 37"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * HQ Vector Graphic: Prismatic Precision Diamond Star (Accuracy & Penalty Shield)
 */
export const HqSvgAccuracyDiamond: React.FC<SvgProps> = ({ className = "", size = 48 }) => {
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
        <radialGradient id="hq-acc-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hq-gem-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#CCFBF1" />
          <stop offset="40%" stopColor="#2DD4BF" />
          <stop offset="80%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#115E59" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="91" rx="30" ry="6" fill="url(#hq-acc-shadow)" />

      {/* Orbital Trajectory Ring */}
      <ellipse
        cx="50"
        cy="51"
        rx="36"
        ry="14"
        stroke="#2DD4BF"
        strokeWidth="2.5"
        strokeDasharray="4 4"
        opacity="0.6"
        transform="rotate(-25 50 51)"
      />

      {/* Faceted Prismatic Diamond Body */}
      <g transform="translate(0, 2)">
        <polygon points="50,14 74,40 50,78 26,40" fill="#134E4A" />
      </g>
      <polygon points="50,14 74,40 50,78 26,40" fill="url(#hq-gem-grad)" />

      {/* Facet Lines */}
      <polygon points="50,14 62,34 38,34" fill="#FFFFFF" opacity="0.6" />
      <polygon points="38,34 50,78 50,34" fill="#0D9488" opacity="0.5" />
      <polygon points="62,34 50,78 50,34" fill="#5EEAD4" opacity="0.7" />

      {/* Center Specular Glint */}
      <circle cx="50" cy="38" r="3" fill="#FFFFFF" />
      <line x1="50" y1="28" x2="50" y2="48" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="38" x2="60" y2="38" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};
