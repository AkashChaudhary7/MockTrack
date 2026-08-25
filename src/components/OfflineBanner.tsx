import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (showBackOnline) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-extrabold px-4 py-1.5 flex items-center justify-center gap-2 transition-all shadow-xs">
        <Wifi className="w-3.5 h-3.5" />
        <span>Online — Syncing PWA cache.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div className="bg-slate-900 text-indigo-300 text-xs font-extrabold px-4 py-1.5 flex items-center justify-center gap-2 transition-all shadow-xs border-b border-indigo-900/50">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Offline — your data is safe on this device.</span>
    </div>
  );
};
