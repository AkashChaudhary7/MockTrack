import React, { useState } from "react";
import {
  X,
  Star,
  Sparkles,
  Send,
  CheckCircle2,
  Lightbulb,
  Target,
  Palette,
  Bug,
  MessageSquare,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react";
import { HapticService } from "../services/HapticService";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
}

const CATEGORIES = [
  { id: "feature", label: "Feature Idea", icon: Lightbulb },
  { id: "exam", label: "Exam Pattern", icon: Target },
  { id: "ui", label: "UI & Design", icon: Palette },
  { id: "bug", label: "Bug Report", icon: Bug },
  { id: "general", label: "General Feedback", icon: MessageSquare },
] as const;

const QUICK_SUGGESTIONS = [
  "Add Hindi language mock templates",
  "More granular time-per-question metrics",
  "Custom sectional target cutoffs",
  "Export PDF report with question breakdown",
  "Dark mode high-contrast option",
  "Study reminder notification",
];

const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement",
  2: "Fair Experience",
  3: "Good & Useful",
  4: "Very Good!",
  5: "Outstanding Experience! 🚀",
};

const DEVELOPER_EMAIL = "mobographie@gmail.com";

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  candidateName,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("feature");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [contactName, setContactName] = useState<string>(candidateName || "Aspirant");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const getEmailContent = () => {
    const subject = `MockTrack Suggestion: [${category.toUpperCase()}] from ${contactName}`;
    const body = `Hi Team,\n\nI have a suggestion for MockTrack:\n\n` +
      `• Category: ${category}\n` +
      `• Rating: ${rating}/5 (${RATING_LABELS[rating]})\n` +
      `• Candidate: ${contactName}\n\n` +
      `Suggestion / Feedback Details:\n${feedbackText.trim() || "Loving the mock tracking experience! Keep up the great work."}\n\n` +
      `Sent from MockTrack App`;
    return { subject, body };
  };

  const handleSendViaEmail = () => {
    HapticService.selection();
    const { subject, body } = getEmailContent();
    const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Save to local storage as backup
    saveLocalFeedback();

    window.location.href = mailtoUrl;
    setIsSubmitted(true);
    HapticService.success();
  };

  const handleSendViaGmailWeb = () => {
    HapticService.selection();
    const { subject, body } = getEmailContent();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${DEVELOPER_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    saveLocalFeedback();
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    setIsSubmitted(true);
    HapticService.success();
  };

  const handleCopyFeedback = async () => {
    HapticService.lightTap();
    const { subject, body } = getEmailContent();
    const textToCopy = `To: ${DEVELOPER_EMAIL}\nSubject: ${subject}\n\n${body}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      HapticService.success();
    } catch (err) {
      console.error("Failed to copy feedback", err);
    }
  };

  const saveLocalFeedback = () => {
    const submission = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      rating,
      category,
      text: feedbackText.trim() || "Positive experience feedback.",
      name: contactName,
      recipient: DEVELOPER_EMAIL,
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("mocktrack_user_feedback") || "[]"
      );
      existing.push(submission);
      localStorage.setItem("mocktrack_user_feedback", JSON.stringify(existing));
    } catch (err) {
      console.error("Failed to save feedback", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendViaEmail();
  };

  const handleQuickChip = (chip: string) => {
    HapticService.lightTap();
    setFeedbackText((prev) => (prev ? `${prev}. ${chip}` : chip));
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFeedbackText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  Feedback &amp; Suggestions
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-black border border-indigo-200 dark:border-indigo-800">
                  Direct Line
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Sent directly to <span className="font-bold text-slate-700 dark:text-slate-300">{DEVELOPER_EMAIL}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-slate-800 dark:text-slate-200 text-sm">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Ready to Dispatch!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-indigo-600 dark:text-indigo-400">{contactName}</span>. Your feedback has been opened in your email client addressed to <strong className="text-slate-800 dark:text-slate-200">{DEVELOPER_EMAIL}</strong>.
                </p>
              </div>

              {/* Developer Response Promise Card */}
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900 text-left text-xs max-w-sm mx-auto flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-snug">
                  Every message is reviewed by our team to implement requested exam patterns and features for upcoming updates.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyFeedback}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Text"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Direct Developer Email Pill */}
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                    @
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-indigo-600 dark:text-indigo-400 tracking-wider block">
                      Target Recipient
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-[11px]">
                      {DEVELOPER_EMAIL}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyFeedback}
                  className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Email"}
                </button>
              </div>

              {/* Star Rating */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    How is your experience so far?
                  </label>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => {
                        HapticService.selection();
                        setRating(star);
                      }}
                      className="p-1 rounded-lg text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-all ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400 scale-110"
                            : "fill-transparent text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Feedback Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          HapticService.lightTap();
                          setCategory(cat.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick suggestion chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Quick Ideas (Tap to include)
                </label>
                <div className="flex flex-wrap gap-1">
                  {QUICK_SUGGESTIONS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickChip(chip)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Suggestion or Message
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what feature, exam format, or UI detail would make your mock analysis easier..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none"
                />
              </div>

              {/* Candidate Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Your Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Candidate Name"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>

              {/* Action Buttons: Direct to mobographie@gmail.com */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSendViaGmailWeb}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
                    title="Open in Gmail Web"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Gmail Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyFeedback}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700"
                    title="Copy message & email"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Developer</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

