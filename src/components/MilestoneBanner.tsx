import React from "react";
import { MilestoneEvent } from "../utils/milestones";
import { X, Share2, Sparkles, ChevronRight } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface MilestoneBannerProps {
  milestone: MilestoneEvent | null;
  onDismiss: () => void;
  onShare: (milestone: MilestoneEvent) => void;
}

export const MilestoneBanner: React.FC<MilestoneBannerProps> = ({
  milestone,
  onDismiss,
  onShare,
}) => {
  if (!milestone) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-3 sm:p-3.5 shadow-lg shadow-indigo-950/40 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
            {milestone.badgeEmoji || "🎯"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-white truncate">
                {milestone.title}
              </h3>
              {milestone.type === "personal_best" && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                  Personal Best
                </span>
              )}
            </div>
            <p className="text-[11px] text-indigo-200/90 font-medium truncate">
              {milestone.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onShare(milestone);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 active:scale-95 text-xs font-black transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onDismiss();
            }}
            className="p-1.5 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
