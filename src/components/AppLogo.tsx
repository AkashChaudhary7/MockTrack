import React from "react";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  animated?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
    "2xl": "w-20 h-20",
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${dim} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient
            id="mocktrackGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient
            id="accentGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#312E81" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Rounded Launcher Box */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#mocktrackGrad)"
          filter="url(#shadow)"
        />

        {/* Target Bullseye Rings */}
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke="white"
          strokeWidth="3.5"
          strokeOpacity="0.25"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="24"
          stroke="white"
          strokeWidth="4"
          strokeOpacity="0.45"
          fill="none"
        />

        {/* Upward Trend Performance Track Arrow */}
        <path
          d="M 26 66 L 42 50 L 56 58 L 74 34"
          stroke="url(#accentGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 62 34 H 74 V 46"
          stroke="url(#accentGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Target Dot / Checkmark Badge */}
        <circle cx="74" cy="34" r="8" fill="#10B981" stroke="white" strokeWidth="2.5" />
        <path
          d="M 70 34 L 73 37 L 78 31"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
