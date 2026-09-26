import React, { useState } from "react";
import { X, Star, Send, CheckCircle2, Sparkles } from "lucide-react";
import { HapticService } from "../services/HapticService";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
}

/**
 * Handcrafted SVG Vector Graphic: Paper Plane with Heart Trail
 */
const FeedbackVectorIllustration: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="filter drop-shadow-sm select-none"
  >
    <defs>
      <linearGradient id="plane-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="50%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FB7185" />
        <stop offset="100%" stopColor="#E11D48" />
      </linearGradient>
    </defs>
    {/* Wind trail lines */}
    <path d="M 12 56 Q 24 58 32 46 T 48 38" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" fill="none" />
    <path d="M 8 68 Q 28 66 38 52" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" fill="none" />
    {/* Floating Heart */}
    <path
      d="M 24 38 C 24 32 30 30 33 34 C 36 30 42 32 42 38 C 42 46 33 52 33 52 C 33 52 24 46 24 38 Z"
      fill="url(#heart-grad)"
    />
    {/* Paper Airplane */}
    <g transform="translate(28, 12) rotate(15)">
      <polygon points="36,0 0,28 16,30 36,0" fill="url(#plane-grad)" />
      <polygon points="36,0 16,30 18,38 24,32 36,0" fill="#3730A3" />
      <polygon points="36,0 16,30 32,32 36,0" fill="#4F46E5" />
    </g>
    {/* Gold Sparkles */}
    <polygon points="66,16 68,10 70,16 76,18 70,20 68,26 66,20 60,18" fill="#FBBF24" />
    <circle cx="16" cy="22" r="2.5" fill="#38BDF8" />
  </svg>
);

const QUICK_TAGS = ["Feature Idea", "Exam Pattern", "Speed & Accuracy", "UI Love ❤️"];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  candidateName,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [selectedTag, setSelectedTag] = useState<string>("Feature Idea");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    HapticService.achievement();

    // Save to local storage for offline reliability
    try {
      const stored = JSON.parse(localStorage.getItem("mocktrack_feedback") || "[]");
      stored.unshift({
        id: `fb-${Date.now()}`,
        date: new Date().toISOString(),
        candidate: candidateName || "Aspirant",
        rating,
        tag: selectedTag,
        text: feedbackText.trim(),
      });
      localStorage.setItem("mocktrack_feedback", JSON.stringify(stored));
    } catch {}

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-center space-y-4 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          /* Sweet Confirmation View */
          <div className="py-6 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black font-display text-slate-900 dark:text-slate-100">
                Thank You, {candidateName || "Aspirant"}!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your feedback helps us make MockTrack better every week. 🚀
              </p>
            </div>
          </div>
        ) : (
          /* Short, Sweet, Simple Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* SVG Vector Graphic */}
            <div className="flex justify-center pt-1">
              <FeedbackVectorIllustration size={64} />
            </div>

            {/* Header */}
            <div className="space-y-0.5">
              <h3 className="text-base font-black font-display text-slate-900 dark:text-slate-100">
                Share Your Feedback
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Help shape upcoming MockTrack features
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    HapticService.lightTap();
                    setRating(star);
                  }}
                  className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95"
                  title={`${star} star rating`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick Tag Chips */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    HapticService.lightTap();
                    setSelectedTag(tag);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedTag === tag
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Simple Text Input */}
            <div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What can we improve? (optional note)"
                rows={2}
                maxLength={250}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl cursor-pointer transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-1.5 font-display"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Feedback</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
