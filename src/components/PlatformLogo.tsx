import React from "react";
import { PlatformId } from "../types";

interface PlatformLogoProps {
  platformId: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "full";
  showLabel?: boolean;
}

export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  platformId,
  className = "",
  size = "md",
  variant = "icon",
  showLabel = false,
}) => {
  const sizeMap = {
    xs: { box: "w-4 h-4", text: "text-[9px]" },
    sm: { box: "w-5.5 h-5.5", text: "text-[10px]" },
    md: { box: "w-7.5 h-7.5", text: "text-xs" },
    lg: { box: "w-10 h-10", text: "text-sm" },
    xl: { box: "w-13 h-13", text: "text-base" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const key = platformId.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. TESTBOOK OFFICIAL LOGO (Cyan & Navy chevron arrow inside white rounded squircle)
  if (key.includes("testbook")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-white border border-slate-200 dark:border-slate-700 shadow-2xs p-0.5 flex items-center justify-center shrink-0 transition-transform`}
          title="Testbook Official"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Left Cyan Wing */}
            <path
              d="M 50 15 L 20 32 L 20 78 L 50 62 Z"
              fill="#00BCD4"
            />
            {/* Right Dark Navy Wing */}
            <path
              d="M 50 15 L 80 32 L 80 78 L 50 62 Z"
              fill="#182230"
            />
            {/* Center Ridge Highlight */}
            <path
              d="M 50 15 L 52 16 L 52 62 L 50 62 Z"
              fill="#38BDF8"
              opacity="0.6"
            />
          </svg>
        </div>

        {(variant === "full" || showLabel) && (
          <div className="flex items-center font-black tracking-tight">
            <span className="text-[#00BCD4] text-xs sm:text-sm font-extrabold">testbook</span>
          </div>
        )}
      </div>
    );
  }

  // 2. ADDA247 OFFICIAL LOGO (Vivid Red Squircle with White Delta 'A')
  if (key.includes("adda") || key.includes("adda247")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-[#EA1C24] shadow-2xs p-1 flex items-center justify-center shrink-0 text-white`}
          title="Adda247 Official"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Adda247 Official Delta A */}
            <path
              d="M 50 14 C 53 14 56 16 58 20 L 84 72 C 86 76 84 82 78 82 C 75 82 72 80 70 76 L 62 58 L 38 58 L 30 76 C 28 80 25 82 22 82 C 16 82 14 76 16 72 L 42 20 C 44 16 47 14 50 14 Z M 50 36 L 43 51 L 57 51 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {(variant === "full" || showLabel) && (
          <div className="flex items-center font-black tracking-tight">
            <span className="text-slate-900 dark:text-white text-xs sm:text-sm">Adda</span>
            <span className="text-[#EA1C24] text-xs sm:text-sm">247</span>
          </div>
        )}
      </div>
    );
  }

  // 3. OLIVEBOARD OFFICIAL LOGO (Cyan Ribbon Möbius Loop & 'oliveboard' with red dot)
  if (key.includes("olive") || key.includes("oliveboard")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-white border border-slate-200 dark:border-slate-700 shadow-2xs p-1 flex items-center justify-center shrink-0`}
          title="Oliveboard Official"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="obGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A3E0" />
                <stop offset="60%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            {/* Oliveboard Circular Ribbon Loop */}
            <circle cx="50" cy="50" r="38" stroke="url(#obGrad)" strokeWidth="12" fill="none" />
            <path
              d="M 50 12 C 30 12 18 28 18 50 C 18 72 32 88 50 88 C 65 88 78 78 81 64 C 77 67 70 70 64 70 C 48 70 34 58 34 50 C 34 42 44 32 58 32 C 68 32 76 38 80 46 C 81 32 68 12 50 12 Z"
              fill="url(#obGrad)"
            />
            {/* Accent Highlight Dot */}
            <circle cx="68" cy="40" r="4" fill="#00A3E0" />
          </svg>
        </div>

        {(variant === "full" || showLabel) && (
          <div className="flex items-center font-black tracking-tight text-xs sm:text-sm">
            <span className="text-slate-800 dark:text-slate-200">olive</span>
            <span className="text-[#00A3E0]">board</span>
          </div>
        )}
      </div>
    );
  }

  // 4. PHYSICS WALLAH (PW) OFFICIAL LOGO (Black Circle with White Concentric Ring & PW)
  if (key.includes("pw") || key.includes("physics") || key.includes("physicswallah")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-full bg-black shadow-2xs p-0.5 flex items-center justify-center shrink-0 border border-slate-800`}
          title="Physics Wallah Official"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Outer White Ring Arc */}
            <circle cx="50" cy="50" r="42" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="180 30" fill="none" />
            
            {/* Bold Interlocking 'P' and 'W' */}
            <g fill="#FFFFFF">
              {/* 'P' stem and bowl */}
              <path d="M 30 25 L 56 25 C 64 25 70 30 70 38 C 70 46 64 51 56 51 L 43 51 L 43 75 L 30 75 Z M 43 36 L 43 41 L 54 41 C 57 41 59 39 59 38 C 59 37 57 36 54 36 Z" />
              {/* 'W' overlapping diagonal geometry */}
              <path d="M 38 52 L 46 75 L 55 56 L 64 75 L 72 52 L 64 52 L 59 66 L 55 57 L 51 66 L 46 52 Z" />
            </g>
          </svg>
        </div>

        {(variant === "full" || showLabel) && (
          <div className="flex items-center font-black tracking-tight text-xs sm:text-sm">
            <span className="text-slate-900 dark:text-white">Physics</span>
            <span className="text-slate-500 dark:text-slate-400 ml-1">Wallah</span>
          </div>
        )}
      </div>
    );
  }

  // 5. NTA (NATIONAL TESTING AGENCY) OFFICIAL LOGO
  if (key.includes("nta") || key.includes("abhyas")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-[#0A2540] shadow-2xs p-1 flex items-center justify-center shrink-0 text-white`}
          title="National Testing Agency Official"
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Gold / Saffron Top Wing */}
            <path d="M 50 12 L 78 40 L 66 40 L 50 24 L 34 40 L 22 40 Z" fill="#F59E0B" />
            {/* White Middle Wing */}
            <path d="M 50 28 L 74 52 L 62 52 L 50 40 L 38 52 L 26 52 Z" fill="#FFFFFF" />
            {/* Green / Cyan Bottom Wing */}
            <path d="M 50 44 L 70 64 L 58 64 L 50 56 L 42 64 L 30 64 Z" fill="#10B981" />
            {/* NTA Bold Text */}
            <text x="50" y="85" textAnchor="middle" fill="#FFFFFF" fontSize="19" fontWeight="900" fontFamily="sans-serif">
              NTA
            </text>
          </svg>
        </div>

        {(variant === "full" || showLabel) && (
          <div className="flex items-center font-black tracking-tight text-xs sm:text-sm">
            <span className="text-indigo-600 dark:text-indigo-400">NTA</span>
            <span className="text-slate-400 text-[11px] ml-1">Official</span>
          </div>
        )}
      </div>
    );
  }

  // 6. UNACADEMY
  if (key.includes("unacademy")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-[#08BD80] shadow-2xs p-1 flex items-center justify-center shrink-0 text-white`}
          title="Unacademy Official"
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M 50 16 C 30 16 16 30 16 50 C 16 70 30 84 50 84 C 70 84 84 70 84 50 L 72 50 C 72 64 62 72 50 72 C 38 72 28 64 28 50 C 28 36 38 28 50 28 Z" />
            <path d="M 50 36 C 42 36 36 42 36 50 C 36 58 42 62 50 62 C 58 62 62 58 62 50 L 54 50 C 54 54 52 56 50 56 C 48 56 46 54 46 50 C 46 46 48 44 50 44 Z" />
          </svg>
        </div>
        {(variant === "full" || showLabel) && (
          <span className="text-xs font-black text-[#08BD80]">Unacademy</span>
        )}
      </div>
    );
  }

  // 7. ALLEN CAREER INSTITUTE
  if (key.includes("allen")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-[#1E40AF] text-white shadow-2xs p-0.5 flex items-center justify-center font-black tracking-tighter shrink-0`}
          title="Allen Career Institute"
        >
          <span className="font-black text-[10px] tracking-tight">ALLEN</span>
        </div>
        {(variant === "full" || showLabel) && (
          <span className="text-xs font-black text-[#1E40AF] dark:text-blue-400">Allen</span>
        )}
      </div>
    );
  }

  // 8. AAKASH BYJU'S
  if (key.includes("aakash")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-[#EA580C] text-white shadow-2xs p-0.5 flex items-center justify-center font-black tracking-tight shrink-0`}
          title="Aakash BYJU'S"
        >
          <span className="font-black text-[9px] tracking-tighter">Aakash</span>
        </div>
        {(variant === "full" || showLabel) && (
          <span className="text-xs font-black text-[#EA580C]">Aakash</span>
        )}
      </div>
    );
  }

  // 9. CAREER LAUNCHER
  if (key.includes("careerlauncher") || key.includes("launcher")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-[#D97706] text-white shadow-2xs p-0.5 flex items-center justify-center font-black shrink-0`}
          title="Career Launcher"
        >
          <span className="font-black text-[10px]">CL</span>
        </div>
        {(variant === "full" || showLabel) && (
          <span className="text-xs font-black text-[#D97706]">Career Launcher</span>
        )}
      </div>
    );
  }

  // 10. OFFLINE / OMR
  if (key.includes("offline") || key.includes("omr") || key.includes("coaching")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-indigo-600 text-white shadow-2xs p-1 flex items-center justify-center shrink-0`}
          title="Offline Classroom / OMR"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-full h-full">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <circle cx="10" cy="13" r="1" fill="currentColor" />
            <circle cx="14" cy="13" r="1" fill="currentColor" />
            <circle cx="10" cy="17" r="1" fill="currentColor" />
            <circle cx="14" cy="17" r="1" fill="currentColor" />
          </svg>
        </div>
        {(variant === "full" || showLabel) && (
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">Offline / OMR</span>
        )}
      </div>
    );
  }

  // 11. PDF PAPER
  if (key.includes("pdf")) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className={`${currentSize.box} rounded-lg bg-[#DC2626] text-white shadow-2xs p-1 flex items-center justify-center shrink-0 font-black text-[9px]`}
          title="PDF Paper"
        >
          PDF
        </div>
        {(variant === "full" || showLabel) && (
          <span className="text-xs font-black text-rose-600">PDF Paper</span>
        )}
      </div>
    );
  }

  // DEFAULT / OTHER
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${currentSize.box} rounded-lg bg-slate-700 dark:bg-slate-600 text-white shadow-2xs flex items-center justify-center font-black uppercase text-[10px] shrink-0`}
      >
        {platformId.slice(0, 2)}
      </div>
      {(variant === "full" || showLabel) && (
        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{platformId}</span>
      )}
    </div>
  );
};
