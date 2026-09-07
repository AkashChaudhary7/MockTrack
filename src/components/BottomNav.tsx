import React from "react";
import { NavTab } from "../types";
import {
  LayoutDashboard,
  History,
  LineChart,
  Plus,
  User,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { HapticService } from "../services/HapticService";

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLogModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenLogModal,
}) => {
  const { t } = useTranslation();

  const handleTabClick = (tab: NavTab) => {
    HapticService.lightTap();
    onSelectTab(tab);
  };

  const handleLogClick = () => {
    HapticService.selection();
    if (onOpenLogModal) {
      onOpenLogModal();
    } else {
      onSelectTab("log");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 sm:pb-4 pt-1 pointer-events-none flex justify-center">
      <div className="w-full max-w-[360px] relative pointer-events-auto select-none">
        
        {/* Compact, Ultra-Sharp Scooped Floating Dock */}
        <div className="relative w-full h-[58px] drop-shadow-[0_10px_25px_rgba(15,23,42,0.10)] dark:drop-shadow-[0_14px_30px_rgba(0,0,0,0.65)]">
          <svg
            viewBox="0 0 360 58"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Organic Scoop Curve optimized for compact height */}
            <path
              d="M 22 0 
                 L 138 0 
                 C 149 0 154 4 159 12 
                 C 164 20 169 24 180 24 
                 C 191 24 196 20 201 12 
                 C 206 4 211 0 222 0 
                 L 338 0 
                 A 22 22 0 0 1 360 22 
                 L 360 36 
                 A 22 22 0 0 1 338 58 
                 L 22 58 
                 A 22 22 0 0 1 0 36 
                 L 0 22 
                 A 22 22 0 0 1 22 0 
                 Z"
              className="fill-white/95 dark:fill-slate-900/95 stroke-slate-200/90 dark:stroke-slate-800"
              strokeWidth="1.2"
            />
          </svg>

          {/* 4 Sharp Navigation Items - pointer-events-none on parent to avoid blocking FAB */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pt-0.5 pointer-events-none">
            
            {/* Tab 1: Dashboard */}
            <button
              type="button"
              onClick={() => handleTabClick("dashboard")}
              className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer pointer-events-auto group active:scale-90 transition-transform duration-150"
            >
              <div className="flex flex-col items-center justify-center">
                <LayoutDashboard
                  className={`w-4.5 h-4.5 transition-colors duration-150 ${
                    activeTab === "dashboard"
                      ? "text-indigo-600 dark:text-indigo-400 stroke-[2.6]"
                      : "text-slate-400 dark:text-slate-500 stroke-[1.8] group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }`}
                />
                <span
                  className={`text-[9.5px] mt-0.5 tracking-tight whitespace-nowrap transition-colors ${
                    activeTab === "dashboard"
                      ? "text-indigo-600 dark:text-indigo-400 font-black"
                      : "text-slate-400 dark:text-slate-500 font-bold group-hover:text-slate-600"
                  }`}
                >
                  {t.dashboardTab || "Dashboard"}
                </span>
              </div>
            </button>

            {/* Tab 2: History */}
            <button
              type="button"
              onClick={() => handleTabClick("history")}
              className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer pointer-events-auto group active:scale-90 transition-transform duration-150"
            >
              <div className="flex flex-col items-center justify-center">
                <History
                  className={`w-4.5 h-4.5 transition-colors duration-150 ${
                    activeTab === "history"
                      ? "text-indigo-600 dark:text-indigo-400 stroke-[2.6]"
                      : "text-slate-400 dark:text-slate-500 stroke-[1.8] group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }`}
                />
                <span
                  className={`text-[9.5px] mt-0.5 tracking-tight whitespace-nowrap transition-colors ${
                    activeTab === "history"
                      ? "text-indigo-600 dark:text-indigo-400 font-black"
                      : "text-slate-400 dark:text-slate-500 font-bold group-hover:text-slate-600"
                  }`}
                >
                  History
                </span>
              </div>
            </button>

            {/* Center Notch Spacer - strictly non-interactive */}
            <div className="w-16 shrink-0 pointer-events-none" />

            {/* Tab 3: Analytics / Insights */}
            <button
              type="button"
              onClick={() => handleTabClick("insights")}
              className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer pointer-events-auto group active:scale-90 transition-transform duration-150"
            >
              <div className="flex flex-col items-center justify-center">
                <LineChart
                  className={`w-4.5 h-4.5 transition-colors duration-150 ${
                    activeTab === "insights"
                      ? "text-indigo-600 dark:text-indigo-400 stroke-[2.6]"
                      : "text-slate-400 dark:text-slate-500 stroke-[1.8] group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }`}
                />
                <span
                  className={`text-[9.5px] mt-0.5 tracking-tight whitespace-nowrap transition-colors ${
                    activeTab === "insights"
                      ? "text-indigo-600 dark:text-indigo-400 font-black"
                      : "text-slate-400 dark:text-slate-500 font-bold group-hover:text-slate-600"
                  }`}
                >
                  {t.insightsTab || "Analytics"}
                </span>
              </div>
            </button>

            {/* Tab 4: Profile */}
            <button
              type="button"
              onClick={() => handleTabClick("profile")}
              className="flex-1 flex flex-col items-center justify-center py-1 cursor-pointer pointer-events-auto group active:scale-90 transition-transform duration-150"
            >
              <div className="flex flex-col items-center justify-center">
                <User
                  className={`w-4.5 h-4.5 transition-colors duration-150 ${
                    activeTab === "profile"
                      ? "text-indigo-600 dark:text-indigo-400 stroke-[2.6]"
                      : "text-slate-400 dark:text-slate-500 stroke-[1.8] group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  }`}
                />
                <span
                  className={`text-[9.5px] mt-0.5 tracking-tight whitespace-nowrap transition-colors ${
                    activeTab === "profile"
                      ? "text-indigo-600 dark:text-indigo-400 font-black"
                      : "text-slate-400 dark:text-slate-500 font-bold group-hover:text-slate-600"
                  }`}
                >
                  Profile
                </span>
              </div>
            </button>

          </div>

          {/* Elevated Sharp Compact FAB inside Scooped Notch - Rendered on top with z-20 & unified clickable area */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-4.5 z-20 flex flex-col items-center pointer-events-auto">
            <button
              type="button"
              onClick={handleLogClick}
              className="group flex flex-col items-center justify-center cursor-pointer p-0.5 focus:outline-hidden select-none active:scale-95 transition-transform duration-150"
              title="Log Mock Test"
              aria-label="Log Mock Test"
            >
              {/* Ambient Diffused Glow + Button Circle */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-indigo-500/25 dark:bg-indigo-500/40 blur-md pointer-events-none group-hover:bg-indigo-500/40 transition-colors" />

                <div
                  className={`relative w-11 h-11 rounded-full bg-gradient-to-b from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 text-white flex items-center justify-center shadow-[0_6px_16px_rgba(79,70,229,0.38)] active:shadow-[0_2px_8px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-all duration-200 border-2 border-white dark:border-slate-800 ring-2 ring-slate-200/50 dark:ring-slate-800/80 ${
                    activeTab === "log" ? "ring-indigo-400 dark:ring-indigo-400 scale-105" : ""
                  }`}
                >
                  <Plus className="w-5 h-5 stroke-[3] text-white drop-shadow-xs transition-transform duration-200 group-hover:rotate-90" />
                </div>
              </div>

              {/* Micro Label directly inside clickable button */}
              <span
                className={`text-[9.5px] font-black mt-1 tracking-tight whitespace-nowrap leading-none transition-colors ${
                  activeTab === "log"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
                }`}
              >
                Log Mock
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
