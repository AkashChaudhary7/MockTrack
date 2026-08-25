import React from "react";
import { PlatformId } from "../types";

interface PlatformLogoProps {
  platformId: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  platformId,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    xs: "w-4 h-4 text-[9px]",
    sm: "w-5 h-5 text-[10px]",
    md: "w-6 h-6 text-xs",
    lg: "w-8 h-8 text-sm",
  };

  const dim = sizeClasses[size] || sizeClasses.md;

  switch (platformId.toLowerCase()) {
    case "testbook":
      return (
        <div
          className={`${dim} rounded-md bg-[#0284C7] text-white flex items-center justify-center font-black tracking-tighter shrink-0 shadow-2xs ${className}`}
          title="Testbook Official"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            {/* Testbook official book + t mark */}
            <path d="M4 3.5C4 2.67 4.67 2 5.5 2H18.5C19.33 2 20 2.67 20 3.5V17.5C20 18.33 19.33 19 18.5 19H6C4.9 19 4 19.9 4 21V3.5ZM6 17H18V4H6V17Z" />
            <path d="M8 7H16V9H8V7ZM8 11H14V13H8V11Z" />
          </svg>
        </div>
      );

    case "oliveboard":
      return (
        <div
          className={`${dim} rounded-md bg-[#059669] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="Oliveboard Official"
        >
          {/* Oliveboard leaf / tree emblem */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6C8.7 6 6 8.7 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 8.7 15.3 6 12 6ZM12 16C9.8 16 8 14.2 8 12C8 9.8 9.8 8 12 8C14.2 8 16 9.8 16 12C16 14.2 14.2 16 12 16Z" />
            <path d="M12 9V15M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "adda247":
      return (
        <div
          className={`${dim} rounded-md bg-[#DC2626] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="Adda247 Official"
        >
          {/* Adda247 Flame / 247 Shield */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M12 2L3 7V12C3 17.5 7 21.5 12 22C17 21.5 21 17.5 21 12V7L12 2Z" fill="#DC2626" />
            <path d="M12 6L14.5 11H9.5L12 6Z" fill="white" />
            <path d="M9 12H15V17H9V12Z" fill="white" />
          </svg>
        </div>
      );

    case "unacademy":
      return (
        <div
          className={`${dim} rounded-md bg-[#0891B2] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="Unacademy Official"
        >
          {/* Unacademy double arch */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M12 4A8 8 0 0 0 4 12H7A5 5 0 0 1 12 7A5 5 0 0 1 17 12H20A8 8 0 0 0 12 4Z" />
            <path d="M12 9A3 3 0 0 0 9 12H11A1 1 0 0 1 12 11A1 1 0 0 1 13 12H15A3 3 0 0 0 12 9Z" />
            <circle cx="12" cy="16" r="1.5" />
          </svg>
        </div>
      );

    case "physicswallah":
      return (
        <div
          className={`${dim} rounded-md bg-[#7C3AED] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="Physics Wallah Official"
        >
          {/* PW Signature monogram */}
          <span className="font-black text-[10px] tracking-tighter leading-none">PW</span>
        </div>
      );

    case "nta":
      return (
        <div
          className={`${dim} rounded-md bg-[#2563EB] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="NTA Abhyas Official"
        >
          {/* NTA seal */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M12 2L15 8H21L16.5 12L18.5 18L12 14.5L5.5 18L7.5 12L3 8H9L12 2Z" />
          </svg>
        </div>
      );

    case "allen":
      return (
        <div
          className={`${dim} rounded-md bg-[#1E40AF] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="Allen Official"
        >
          <span className="font-black text-[11px] tracking-tight">A</span>
        </div>
      );

    case "aakash":
      return (
        <div
          className={`${dim} rounded-md bg-[#EA580C] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="Aakash BYJU'S Official"
        >
          <span className="font-black text-[10px] tracking-tight">AK</span>
        </div>
      );

    case "careerlauncher":
      return (
        <div
          className={`${dim} rounded-md bg-[#D97706] text-white flex items-center justify-center font-black shrink-0 shadow-2xs ${className}`}
          title="Career Launcher Official"
        >
          <span className="font-black text-[10px] tracking-tight">CL</span>
        </div>
      );

    default:
      return (
        <div
          className={`${dim} rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs ${className}`}
        >
          <span className="font-black uppercase text-[10px]">
            {platformId.slice(0, 2)}
          </span>
        </div>
      );
  }
};
