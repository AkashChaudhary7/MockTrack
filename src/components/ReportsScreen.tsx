import React, { useState, useMemo } from "react";
import { MockAttempt, ExamProfile, CandidateProfile } from "../types";
import { calculateAnalytics } from "../utils/analytics";
import {
  FileText,
  Download,
  Share2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight,
  Eye,
  Lock,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { generateBilingualReportHTML, downloadBilingualReportPDF } from "../utils/pdfExport";
import { HapticService } from "../services/HapticService";
import { ShareService } from "../services/ShareService";

interface ReportsScreenProps {
  attempts: MockAttempt[];
  activeExam: ExamProfile;
  candidate: CandidateProfile;
}

type PeriodFilter = "7days" | "30days" | "90days" | "all";

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  attempts,
  activeExam,
  candidate,
}) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Filter attempts based on selected timeframe
  const filteredAttempts = useMemo(() => {
    const examMocks = attempts.filter((a) => a.profileId === activeExam.id);
    if (period === "all") return examMocks;

    const now = new Date();
    const cutoffDays = period === "7days" ? 7 : period === "30days" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

    return examMocks.filter((m) => new Date(m.date) >= cutoffDate);
  }, [attempts, activeExam.id, period]);

  const analytics = useMemo(() => {
    return calculateAnalytics(filteredAttempts, activeExam);
  }, [filteredAttempts, activeExam]);

  // Handle PDF Download
  const handleDownloadPDF = async () => {
    HapticService.selection();
    setIsGenerating(true);
    try {
      downloadBilingualReportPDF(candidate, activeExam, filteredAttempts);
      HapticService.achievement();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareReport = async () => {
    HapticService.lightTap();
    const title = `MockTrack Performance Report — ${candidate.name}`;
    const text = `Candidate: ${candidate.name}\nExam: ${activeExam.name}\nMocks Logged: ${analytics.totalMocks}\nAverage Score: ${analytics.averageScore} / ${activeExam.totalMarks}\nPeak Score: ${analytics.peakScore}\nAccuracy: ${analytics.overallAccuracy}%`;
    await ShareService.shareReport(title, text);
  };

  const reportHTML = useMemo(() => {
    return generateBilingualReportHTML(candidate, activeExam, filteredAttempts);
  }, [candidate, activeExam, filteredAttempts]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Performance Reports</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold">
              PDF &amp; Analysis
            </span>
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Generate and export candidate performance dossiers.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl text-xs font-extrabold self-start sm:self-auto">
          {(["7days", "30days", "90days", "all"] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                HapticService.lightTap();
                setPeriod(p);
              }}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all capitalize ${
                period === p
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {p === "7days" ? "7 Days" : p === "30days" ? "30 Days" : p === "90days" ? "90 Days" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Report Preview Document Card */}
      <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-indigo-500/20 relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-extrabold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Candidate Dossier</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {activeExam.name} ({activeExam.shortCode}) Report
            </h2>
            <p className="text-xs text-indigo-200/80 font-medium max-w-md">
              Complete diagnostic report featuring score trends, platform accuracy comparison, weak area topic matrices, and personalized study targets.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-2xl border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Preview HTML</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating || filteredAttempts.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? "Generating PDF..." : "Download PDF"}</span>
            </button>
          </div>
        </div>

        {/* 3D Mini Document Snapshot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[10px] font-bold text-indigo-300 uppercase">Candidate</div>
            <div className="text-sm font-black text-white truncate">{candidate.name}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[10px] font-bold text-indigo-300 uppercase">Mocks Analyzed</div>
            <div className="text-sm font-black text-white">{analytics.totalMocks} Mocks</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[10px] font-bold text-indigo-300 uppercase">Avg / Total</div>
            <div className="text-sm font-black text-white">{analytics.averageScore} / {activeExam.totalMarks}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[10px] font-bold text-indigo-300 uppercase">Peak Score</div>
            <div className="text-sm font-black text-emerald-400">🏆 {analytics.peakScore}</div>
          </div>
        </div>
      </div>

      {/* Personalized Weekly Action Plan Section */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Personalized Weekly Study Target</span>
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Based on your recorded weak areas &amp; performance patterns.
            </p>
          </div>
          <button
            onClick={handleShareReport}
            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors cursor-pointer"
            title="Share Action Plan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly Plan Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { day: "Mon", task: "Weak Topic Revision", detail: "Focus on Geometry & Formula Flashcards" },
            { day: "Tue", task: "Sectional Practice", detail: "Timed Quantitative Aptitude (25 Qs)" },
            { day: "Wed", task: "Mistake Audit", detail: "Review silly calculation errors from last mock" },
            { day: "Thu", task: "Full Mock Test", detail: "Attempt Tier-1 Mock under real time constraint" },
            { day: "Fri", task: "Current Affairs", detail: "Last 6 months revision & notes sync" },
            { day: "Sat", task: "Speed & Accuracy", detail: "High-frequency reasoning tricks practice" },
            { day: "Sun", task: "Mock + Analysis", detail: "Full mock test followed by 1-hour weak topic log" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {item.day}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                {item.task}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report HTML Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                HTML Performance Report Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-1.5 bg-indigo-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-white">
              <iframe
                title="Report Preview"
                srcDoc={reportHTML}
                className="w-full h-[600px] border-none rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
