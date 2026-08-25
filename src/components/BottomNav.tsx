import React from "react";
import { NavTab } from "../types";
import { LayoutDashboard, History, LineChart, User, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "../i18n/LanguageContext";
import { HapticService } from "../services/HapticService";

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLogModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, onOpenLogModal }) => {
  const { t } = useTranslation();

  const handleTabClick = (tab: NavTab) => {
    HapticService.lightTap();
    onSelectTab(tab);
  };

  const handleLogClick = () => {
    HapticService.selection();
    onOpenLogModal();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 transition-colors shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Tab 1: Home */}
        <button
          onClick={() => handleTabClick("dashboard")}
          className="relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer group"
        >
          {activeTab === "dashboard" && (
            <motion.div
              layoutId="activePill"
              className="absolute inset-0 bg-indigo-100 dark:bg-indigo-950/80 rounded-2xl -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <LayoutDashboard
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === "dashboard"
                ? "text-indigo-600 dark:text-indigo-400 scale-110 stroke-[2.5]"
                : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 stroke-[1.75]"
            }`}
          />
          <span
            className={`text-[10px] font-extrabold mt-0.5 transition-colors ${
              activeTab === "dashboard"
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {t.dashboardTab}
          </span>
        </button>

        {/* Tab 2: History */}
        <button
          onClick={() => handleTabClick("history")}
          className="relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer group"
        >
          {activeTab === "history" && (
            <motion.div
              layoutId="activePill"
              className="absolute inset-0 bg-indigo-100 dark:bg-indigo-950/80 rounded-2xl -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <History
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === "history"
                ? "text-indigo-600 dark:text-indigo-400 scale-110 stroke-[2.5]"
                : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 stroke-[1.75]"
            }`}
          />
          <span
            className={`text-[10px] font-extrabold mt-0.5 transition-colors ${
              activeTab === "history"
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            History
          </span>
        </button>

        {/* Central Prominent + LOG Action Button */}
        <div className="relative -top-3">
          <button
            onClick={handleLogClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>LOG</span>
          </button>
        </div>

        {/* Tab 3: Analytics */}
        <button
          onClick={() => handleTabClick("insights")}
          className="relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer group"
        >
          {activeTab === "insights" && (
            <motion.div
              layoutId="activePill"
              className="absolute inset-0 bg-indigo-100 dark:bg-indigo-950/80 rounded-2xl -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <LineChart
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === "insights"
                ? "text-indigo-600 dark:text-indigo-400 scale-110 stroke-[2.5]"
                : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 stroke-[1.75]"
            }`}
          />
          <span
            className={`text-[10px] font-extrabold mt-0.5 transition-colors ${
              activeTab === "insights"
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {t.insightsTab}
          </span>
        </button>

        {/* Tab 4: Profile */}
        <button
          onClick={() => handleTabClick("profile")}
          className="relative flex flex-col items-center py-1 px-3 rounded-2xl transition-all cursor-pointer group"
        >
          {activeTab === "profile" && (
            <motion.div
              layoutId="activePill"
              className="absolute inset-0 bg-indigo-100 dark:bg-indigo-950/80 rounded-2xl -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <User
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === "profile"
                ? "text-indigo-600 dark:text-indigo-400 scale-110 stroke-[2.5]"
                : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 stroke-[1.75]"
            }`}
          />
          <span
            className={`text-[10px] font-extrabold mt-0.5 transition-colors ${
              activeTab === "profile"
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};

