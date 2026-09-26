import React from "react";

interface AnimatedSvgClockProps {
  size?: number | string;
  className?: string;
  isUrgent?: boolean;
}

/**
 * AnimatedSvgClock
 * Handcrafted SVG vector clock with animated hour, minute, and second hands,
 * beveled dial casing, radial hour ticks, and pulsing ambient glow.
 */
export const AnimatedSvgClock: React.FC<AnimatedSvgClockProps> = ({
  size = 46,
  className = "",
  isUrgent = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-sm"
      >
        <defs>
          {/* Subtle Ambient Pulse Keyframes & Rotating Hands */}
          <style>{`
            @keyframes clock-ambient-pulse {
              0%, 100% { transform: scale(0.96); opacity: 0.35; }
              50% { transform: scale(1.08); opacity: 0.75; }
            }
            @keyframes clock-hour-sweep {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes clock-minute-sweep {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes clock-second-tick {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .clock-pulse-aura {
              transform-origin: 50px 50px;
              animation: clock-ambient-pulse 3s ease-in-out infinite;
            }
            .clock-hand-hour {
              transform-origin: 50px 50px;
              animation: clock-hour-sweep 24s linear infinite;
            }
            .clock-hand-min {
              transform-origin: 50px 50px;
              animation: clock-minute-sweep 8s linear infinite;
            }
            .clock-hand-sec {
              transform-origin: 50px 50px;
              animation: clock-second-tick 3s linear infinite;
            }
          `}</style>

          {/* Gradients */}
          <linearGradient id="clock-bezel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isUrgent ? "#F43F5E" : "#6366F1"} />
            <stop offset="50%" stopColor={isUrgent ? "#E11D48" : "#4F46E5"} />
            <stop offset="100%" stopColor={isUrgent ? "#9F1239" : "#3730A3"} />
          </linearGradient>

          <linearGradient id="clock-dial-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>

          <linearGradient id="clock-dial-dark-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <radialGradient id="clock-aura-grad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor={isUrgent ? "#FB7185" : "#818CF8"} stopOpacity="0.45" />
            <stop offset="100%" stopColor={isUrgent ? "#E11D48" : "#4F46E5"} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Halo Glow */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#clock-aura-grad)"
          className="clock-pulse-aura"
        />

        {/* Outer Casing / Bezel */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="url(#clock-bezel-grad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          className="dark:stroke-slate-800"
        />

        {/* Inner Dial Face (Light & Dark friendly) */}
        <circle
          cx="50"
          cy="50"
          r="39"
          className="fill-white dark:fill-slate-900"
        />

        {/* Inner Subtle Track Ring */}
        <circle
          cx="50"
          cy="50"
          r="34"
          stroke={isUrgent ? "#FDA4AF" : "#C7D2FE"}
          strokeWidth="0.8"
          strokeDasharray="2 3"
          className="dark:stroke-slate-700/60"
        />

        {/* 12 Hour Ticks */}
        {/* 12 o'clock */}
        <rect x="48.5" y="14" width="3" height="7" rx="1.5" fill={isUrgent ? "#E11D48" : "#4F46E5"} />
        {/* 3 o'clock */}
        <rect x="79" y="48.5" width="7" height="3" rx="1.5" fill={isUrgent ? "#E11D48" : "#4F46E5"} />
        {/* 6 o'clock */}
        <rect x="48.5" y="79" width="3" height="7" rx="1.5" fill={isUrgent ? "#E11D48" : "#4F46E5"} />
        {/* 9 o'clock */}
        <rect x="14" y="48.5" width="7" height="3" rx="1.5" fill={isUrgent ? "#E11D48" : "#4F46E5"} />

        {/* Intermediate Hour Dots: 1, 2, 4, 5, 7, 8, 10, 11 */}
        {/* 1 o'clock (~30 deg) */}
        <circle cx="67" cy="21" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
        {/* 2 o'clock (~60 deg) */}
        <circle cx="79" cy="33" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
        {/* 4 o'clock (~120 deg) */}
        <circle cx="79" cy="67" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
        {/* 5 o'clock (~150 deg) */}
        <circle cx="67" cy="79" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
        {/* 7 o'clock (~210 deg) */}
        <circle cx="33" cy="79" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
        {/* 8 o'clock (~240 deg) */}
        <circle cx="21" cy="67" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
        {/* 10 o'clock (~300 deg) */}
        <circle cx="21" cy="33" r="1.5" className="fill-slate-400 dark:fill-slate-500" />
        {/* 11 o'clock (~330 deg) */}
        <circle cx="33" cy="21" r="1.5" className="fill-slate-400 dark:fill-slate-500" />

        {/* Hour Hand (Sweeps slowly) */}
        <g className="clock-hand-hour">
          <path
            d="M 48 50 L 48 29 C 48 27.5 52 27.5 52 29 L 52 50 Z"
            className="fill-slate-800 dark:fill-slate-100"
          />
        </g>

        {/* Minute Hand (Sweeps at medium pace) */}
        <g className="clock-hand-min">
          <path
            d="M 48.5 50 L 48.5 22 C 48.5 21 51.5 21 51.5 22 L 51.5 50 Z"
            fill={isUrgent ? "#E11D48" : "#4338CA"}
            className="dark:fill-indigo-300"
          />
        </g>

        {/* Second Hand (Thin Vibrant Needle with counterweight) */}
        <g className="clock-hand-sec">
          {/* Main needle */}
          <line
            x1="50"
            y1="56"
            x2="50"
            y2="18"
            stroke={isUrgent ? "#F43F5E" : "#F59E0B"}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Counterweight dot */}
          <circle
            cx="50"
            cy="54"
            r="2"
            fill={isUrgent ? "#F43F5E" : "#F59E0B"}
          />
        </g>

        {/* Center Pivot Jewel */}
        <circle cx="50" cy="50" r="3.5" fill="#1E293B" className="dark:fill-slate-200" />
        <circle cx="50" cy="50" r="1.5" fill={isUrgent ? "#FDA4AF" : "#FDE047"} />

        {/* Top Ring Loop (Pocketwatch / Timer aesthetic) */}
        <path
          d="M 44 8 C 44 4 56 4 56 8"
          stroke={isUrgent ? "#E11D48" : "#4F46E5"}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
