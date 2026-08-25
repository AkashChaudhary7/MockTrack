import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Lock,
  Database,
  Camera,
  Trash2,
  Mail,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  AlertCircle,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { NavTab } from "../types";
import { HapticService } from "../services/HapticService";

interface PrivacyScreenProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onNavigateTab }) => {
  const [copied, setCopied] = useState(false);
  const privacyUrl = "https://mocktrack.ictlabgsssaidana.workers.dev/privacy";

  const handleCopyLink = () => {
    HapticService.lightTap();
    navigator.clipboard.writeText(privacyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              HapticService.lightTap();
              onNavigateTab("dashboard");
            }}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Google Play Console Verifiable</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Privacy Policy &amp; Data Safety
            </h1>
          </div>
        </div>

        {/* Action button to open external link */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-indigo-500" />
                <span>Copy Policy URL</span>
              </>
            )}
          </button>

          <a
            href={privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20"
          >
            <span>Live Worker URL</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Official URL Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Google Play Console Canonical Verification Link
          </span>
          <a
            href={privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200 hover:underline break-all"
          >
            {privacyUrl}
          </a>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-extrabold">
            Status: Active &amp; Verified
          </span>
        </div>
      </div>

      {/* Highlights / Summary Card */}
      <div className="card-bevel-3d rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Candidate Privacy First Guarantee
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Offline-first architecture — zero cloud selling or tracking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs mb-1">
              <Database className="w-4 h-4" />
              <span>100% Local Storage</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your mock test scores, mistake takeaways, and study notes remain in your device's IndexedDB / LocalStorage.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs mb-1">
              <Camera className="w-4 h-4" />
              <span>Ephemeral OCR Processing</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Scorecard screenshots uploaded for marks extraction are processed in transit over TLS and discarded immediately.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs mb-1">
              <Trash2 className="w-4 h-4" />
              <span>Total Data Control</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Export offline JSON/PDF backups or wipe all local data with a single click anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Google Play Data Safety Table */}
      <div className="card-bevel-3d rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Google Play Data Safety Disclosures</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official declarations as submitted on Google Play Console
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3 px-3.5 font-black text-slate-700 dark:text-slate-200">Data Type</th>
                <th className="py-3 px-3.5 font-black text-slate-700 dark:text-slate-200">Collected</th>
                <th className="py-3 px-3.5 font-black text-slate-700 dark:text-slate-200">Shared</th>
                <th className="py-3 px-3.5 font-black text-slate-700 dark:text-slate-200">Storage &amp; Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-200">Candidate Name / Initial</td>
                <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">Local Only</td>
                <td className="py-3 px-3.5 font-semibold text-emerald-600 dark:text-emerald-400">No (0%)</td>
                <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">Personalized dashboard greetings on device.</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-200">Mock Scores, Ranks, Accuracies</td>
                <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">Local Only</td>
                <td className="py-3 px-3.5 font-semibold text-emerald-600 dark:text-emerald-400">No (0%)</td>
                <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">Radar weakness analysis &amp; baseline charting.</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-200">Scorecard Images (Optional OCR)</td>
                <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">Ephemeral (In Transit)</td>
                <td className="py-3 px-3.5 font-semibold text-emerald-600 dark:text-emerald-400">No (0%)</td>
                <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">Processed via secure TLS API to extract marks; never stored on disk.</td>
              </tr>
              <tr>
                <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-slate-200">Location / Hardware Serials</td>
                <td className="py-3 px-3.5 font-semibold text-slate-500">Not Collected</td>
                <td className="py-3 px-3.5 font-semibold text-emerald-600 dark:text-emerald-400">No (0%)</td>
                <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">Never accessed or required.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions & Security Details */}
      <div className="card-bevel-3d rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Device Permissions Explained</span>
          </h3>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
            <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">📁 Storage &amp; Files:</strong>
            Used exclusively when you export your mock test progress as a JSON backup or generate a PDF performance scorecard to your local storage.
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
            <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">📷 Camera / Photo Library:</strong>
            Used only when you choose to photograph an offline test scorecard or upload a test screenshot for automatic mark recognition.
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
            <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">🔔 Notifications (Optional):</strong>
            Used exclusively for exam countdowns, study streak reminders, and mistake revision prompts on supported devices.
          </div>
        </div>
      </div>

      {/* Children's Privacy & COPPA */}
      <div className="card-bevel-3d rounded-3xl p-6 space-y-3">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
          Children's Privacy &amp; Family Policy
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          MockTrack is intended for general audience students and competitive exam aspirants (aged 13 and older). We do not knowingly collect personal identifiable information from children under 13.
        </p>
      </div>

      {/* Developer Contact Card */}
      <div className="card-bevel-3d rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Developer Contact &amp; Support
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For privacy inquiries, questions, or verification
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 space-y-2 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-bold block">Developer:</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">MockTrack Development Team</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-bold block">Support &amp; Privacy Email:</span>
            <a
              href="mailto:mobographie@gmail.com"
              className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              mobographie@gmail.com
            </a>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-bold block">Official Policy URL:</span>
            <a
              href="https://mocktrack.ictlabgsssaidana.workers.dev/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline break-all"
            >
              https://mocktrack.ictlabgsssaidana.workers.dev/privacy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
