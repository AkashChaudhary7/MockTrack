import React from "react";

interface AppLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  animated?: boolean;
  withText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "",
  size = "md",
  animated = false,
  withText = false,
}) => {
  const sizeMap = {
    xs: { box: "w-5 h-5", text: "text-xs gap-1" },
    sm: { box: "w-7 h-7", text: "text-base gap-1.5" },
    md: { box: "w-9 h-9", text: "text-lg gap-2" },
    lg: { box: "w-12 h-12", text: "text-xl gap-2.5" },
    xl: { box: "w-16 h-16", text: "text-2xl gap-3" },
    "2xl": { box: "w-24 h-24", text: "text-3xl gap-3.5" },
    "3xl": { box: "w-32 h-32", text: "text-4xl gap-4" },
  };

  const dim = sizeMap[size] || sizeMap.md;

  const iconGraphic = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dim.box} ${className} ${
        animated ? "transition-transform duration-300 hover:scale-105 active:scale-95" : ""
      }`}
    >
      <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md select-none"
      >
        <defs>
          {/* Subtle Depth Shadow */}
          <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.16" />
          </filter>

          {/* Gradients matching the 3D rendered logo */}
          {/* Clipboard Board Gradient (Deep Navy) */}
          <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="60%" stopColor="#172554" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Golden Clip Gradient */}
          <linearGradient id="goldClipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Growth Bars Gradients */}
          <linearGradient id="blueBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          <linearGradient id="tealBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          <linearGradient id="goldBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Upward Green Growth Arrow Gradient */}
          <linearGradient id="greenArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="60%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Stopwatch Body Gradient */}
          <linearGradient id="stopwatchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Green Option B button Gradient */}
          <linearGradient id="btnBGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* 1. UPWARD PERFORMANCE GROWTH ARROW (Curves up behind the clipboard and bars) */}
        <path
          d="M 72 74 C 76 56 86 38 108 26 L 103 21 L 124 20 L 121 41 L 115 35 C 96 46 88 62 84 76 Z"
          fill="url(#greenArrowGrad)"
          filter="url(#logoShadow)"
        />

        {/* 2. PERFORMANCE BAR CHART (3 Ascending Bars) */}
        {/* Blue Bar (Short) */}
        <rect x="78" y="58" width="12" height="34" rx="3.5" fill="url(#blueBarGrad)" filter="url(#logoShadow)" />
        {/* Teal Bar (Medium) */}
        <rect x="94" y="44" width="12" height="48" rx="3.5" fill="url(#tealBarGrad)" filter="url(#logoShadow)" />
        {/* Golden Orange Bar (Tall) */}
        <rect x="110" y="32" width="13" height="60" rx="3.5" fill="url(#goldBarGrad)" filter="url(#logoShadow)" />

        {/* 3. EXAM CLIPBOARD (Backing Board) */}
        <rect
          x="16"
          y="18"
          width="68"
          height="88"
          rx="12"
          fill="url(#boardGrad)"
          filter="url(#logoShadow)"
        />

        {/* Clipboard White Paper Sheet */}
        <rect
          x="22"
          y="24"
          width="56"
          height="76"
          rx="7"
          fill="#FFFFFF"
        />

        {/* Top Gold Clip */}
        <path
          d="M 36 12 L 64 12 C 67 12 69 14 69 17 L 69 22 C 69 24 67 26 64 26 L 36 26 C 33 26 31 24 31 22 L 31 17 C 31 14 33 12 36 12 Z"
          fill="url(#goldClipGrad)"
          filter="url(#logoShadow)"
        />
        {/* Top Clip Hole */}
        <circle cx="50" cy="18" r="3.2" fill="#FFFFFF" />

        {/* Question Item 1: Option A */}
        <circle cx="33" cy="38" r="5" stroke="#CBD5E1" strokeWidth="1.6" fill="#F8FAFC" />
        <text x="33" y="41.2" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#64748B" fontFamily="sans-serif">
          A
        </text>
        <rect x="42" y="36.5" width="28" height="3" rx="1.5" fill="#E2E8F0" />

        {/* Question Item 2: Option B (THE HIGHLIGHTED CORRECT ANSWER WITH TICK) */}
        <circle cx="33" cy="53" r="6.2" fill="url(#btnBGrad)" />
        <text x="33" y="56.2" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
          B
        </text>
        {/* Green Checkmark ✓ */}
        <path
          d="M 43 53.5 L 46.5 57 L 53 49"
          stroke="#10B981"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="58" y="51.5" width="14" height="3" rx="1.5" fill="#CBD5E1" />

        {/* Question Item 3: Option C */}
        <circle cx="33" cy="68" r="5" stroke="#CBD5E1" strokeWidth="1.6" fill="#F8FAFC" />
        <text x="33" y="71.2" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#64748B" fontFamily="sans-serif">
          C
        </text>
        <rect x="42" y="66.5" width="26" height="3" rx="1.5" fill="#E2E8F0" />

        {/* Question Item 4: Option D */}
        <circle cx="33" cy="83" r="5" stroke="#CBD5E1" strokeWidth="1.6" fill="#F8FAFC" />
        <text x="33" y="86.2" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#64748B" fontFamily="sans-serif">
          D
        </text>
        <rect x="42" y="81.5" width="24" height="3" rx="1.5" fill="#E2E8F0" />

        {/* 4. ANALOG STOPWATCH / TIMER (Positioned in foreground bottom-right) */}
        {/* Stopwatch Top Crown & Button */}
        <rect x="91" y="60" width="8" height="6" rx="2" fill="url(#stopwatchGrad)" />
        <rect x="88" y="58" width="14" height="3.5" rx="1.5" fill="#D97706" />

        {/* Stopwatch Outer Circular Casing */}
        <circle cx="95" cy="85" r="23" fill="url(#stopwatchGrad)" filter="url(#logoShadow)" />
        {/* Stopwatch Bezel Ring */}
        <circle cx="95" cy="85" r="19" fill="#FFFFFF" />

        {/* Clock Hour Ticks */}
        <line x1="95" y1="69" x2="95" y2="72" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="95" y1="98" x2="95" y2="101" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="79" y1="85" x2="82" y2="85" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="108" y1="85" x2="111" y2="85" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />

        {/* Stopwatch Hands pointing to 1:52 */}
        {/* Minute Hand */}
        <line x1="95" y1="85" x2="107" y2="74" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Hour Hand */}
        <line x1="95" y1="85" x2="101" y2="92" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        {/* Golden Pivot */}
        <circle cx="95" cy="85" r="2.8" fill="#F59E0B" />
      </svg>
    </div>
  );

  if (!withText) {
    return iconGraphic;
  }

  return (
    <div className={`inline-flex items-center ${dim.text} ${className}`}>
      {iconGraphic}
      <div className="flex items-center font-black tracking-tight leading-none select-none">
        <span className="text-[#0B2545] dark:text-white">Mock</span>
        <span className="text-[#00A86B] dark:text-[#10B981]">Track</span>
      </div>
    </div>
  );
};
