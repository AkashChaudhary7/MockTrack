import React, { useState, useMemo } from "react";
import { MockAttempt, ExamProfile, NavTab } from "../types";
import { getSubjectsForProfile } from "../data/allExamsCatalog";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Flame,
  BrainCircuit,
  Filter,
} from "lucide-react";
import { HapticService } from "../services/HapticService";

interface SmartInsightSectionProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onNavigateTab?: (tab: NavTab) => void;
  onOpenLogModal?: () => void;
}

interface SmartPracticeInsight {
  id: string;
  category: "weak_topic" | "error_pattern" | "negative_guard" | "speed_pacing";
  title: string;
  subtitle: string;
  frequencyText: string;
  impactScoreText: string;
  impactBadgeClass: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  icon: React.ReactNode;
  observation: string;
  actionableDrills: string[];
  tacticalTip: string;
  estimatedTime: string;
}

export const SmartInsightSection: React.FC<SmartInsightSectionProps> = ({
  activeExam,
  attempts,
  onNavigateTab,
  onOpenLogModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const examAttempts = useMemo(
    () => attempts.filter((a) => a.profileId === activeExam.id),
    [attempts, activeExam.id]
  );

  // Generate Smart Practice Insights based on frequent mistakes and weak areas
  const smartInsights: SmartPracticeInsight[] = useMemo(() => {
    if (examAttempts.length === 0) return [];

    const insights: SmartPracticeInsight[] = [];

    // 1. Analyze reasonsLost frequency across attempts
    const reasonsCount: Record<string, number> = {};
    const weakAreasCount: Record<string, number> = {};
    let totalIncorrect = 0;
    let totalNegativePenalty = 0;
    let totalUnattempted = 0;

    // Subject performance tracking
    const subjectMetrics: Record<
      string,
      { totalScore: number; totalMax: number; totalIncorrect: number; attemptsCount: number }
    > = {};

    examAttempts.forEach((att) => {
      totalIncorrect += att.incorrectCount || 0;
      totalNegativePenalty += att.negativePenalty || 0;
      totalUnattempted += att.unattemptedCount || 0;

      // Collect reasonsLost
      if (att.reasonsLost && Array.isArray(att.reasonsLost)) {
        att.reasonsLost.forEach((reason) => {
          const cleanReason = reason.trim();
          if (cleanReason) {
            reasonsCount[cleanReason] = (reasonsCount[cleanReason] || 0) + 1;
          }
        });
      }

      // Collect weakAreas
      if (att.weakAreas && Array.isArray(att.weakAreas)) {
        att.weakAreas.forEach((area) => {
          const cleanArea = area.trim();
          if (cleanArea) {
            weakAreasCount[cleanArea] = (weakAreasCount[cleanArea] || 0) + 1;
          }
        });
      }

      // Collect sectional mistakes
      if (att.sections && Array.isArray(att.sections)) {
        att.sections.forEach((sec) => {
          if (!subjectMetrics[sec.name]) {
            subjectMetrics[sec.name] = {
              totalScore: 0,
              totalMax: 0,
              totalIncorrect: 0,
              attemptsCount: 0,
            };
          }
          subjectMetrics[sec.name].totalScore += sec.score;
          subjectMetrics[sec.name].totalMax += sec.maxMarks;
          subjectMetrics[sec.name].totalIncorrect += sec.incorrectCount || 0;
          subjectMetrics[sec.name].attemptsCount += 1;
        });
      }
    });

    // Find the weakest subject by percentage
    let weakestSubjectName = "";
    let weakestSubjectAccuracy = 100;
    let weakestSubjectErrors = 0;

    Object.entries(subjectMetrics).forEach(([name, data]) => {
      if (data.totalMax > 0) {
        const pct = (data.totalScore / data.totalMax) * 100;
        if (pct < weakestSubjectAccuracy) {
          weakestSubjectAccuracy = Math.round(pct);
          weakestSubjectName = name;
          weakestSubjectErrors = data.totalIncorrect;
        }
      }
    });

    // Fallback subject from catalog if no sections logged
    if (!weakestSubjectName) {
      const catalogSubjects = getSubjectsForProfile(activeExam);
      if (catalogSubjects.length > 0) {
        weakestSubjectName = catalogSubjects[0].name;
      } else {
        weakestSubjectName = "Quantitative Aptitude";
      }
    }

    // Top weak topic from tags or subject
    const sortedWeakAreas = Object.entries(weakAreasCount).sort((a, b) => b[1] - a[1]);
    const topWeakArea = sortedWeakAreas.length > 0 ? sortedWeakAreas[0] : null;

    // Top mistake reason from tags
    const sortedReasons = Object.entries(reasonsCount).sort((a, b) => b[1] - a[1]);
    const topReason = sortedReasons.length > 0 ? sortedReasons[0] : null;

    // 1. PRIMARY PRACTICE AREA INSIGHT (Weak Topic / Subject)
    if (topWeakArea) {
      insights.push({
        id: "practice_weak_topic",
        category: "weak_topic",
        title: `Priority Topic: ${topWeakArea[0]}`,
        subtitle: `Flagged as a repeated weak area across ${topWeakArea[1]} of your recent mocks.`,
        frequencyText: `Flagged in ${topWeakArea[1]} Tests`,
        impactScoreText: "+8 to +14 Marks",
        impactBadgeClass: "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        accentColor: "text-rose-600 dark:text-rose-400",
        borderColor: "border-rose-200/80 dark:border-rose-800/60 hover:border-rose-300 dark:hover:border-rose-700",
        bgGradient: "from-rose-50/50 via-white to-orange-50/30 dark:from-rose-950/20 dark:via-slate-900 dark:to-orange-950/10",
        icon: <Target className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        observation: `Errors in ${topWeakArea[0]} are currently the primary bottleneck dampening your overall mock scores. Targeted mastery here delivers immediate net marks.`,
        actionableDrills: [
          `Solve 25 Previous Year Questions (PYQs) on ${topWeakArea[0]} in an un-timed diagnostic session.`,
          `Create a one-page formula & theorem cheat sheet for ${topWeakArea[0]} to review before tests.`,
          `Attempt a 15-minute high-pressure sectional drill dedicated purely to ${topWeakArea[0]}.`,
        ],
        tacticalTip: "Don't jump straight into multi-step problems. Cement core concepts with basic Level-1 questions first before tackling tricky variations.",
        estimatedTime: "30 mins / day",
      });
    } else {
      // Use weakest subject from sections
      insights.push({
        id: "practice_weak_subject",
        category: "weak_topic",
        title: `Priority Subject: ${weakestSubjectName}`,
        subtitle: `Currently scoring at ${weakestSubjectAccuracy}% average with ${weakestSubjectErrors > 0 ? `${weakestSubjectErrors} recorded errors` : "growth potential"}.`,
        frequencyText: `${weakestSubjectAccuracy}% Avg Mastery`,
        impactScoreText: "+10 to +16 Marks",
        impactBadgeClass: "bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        accentColor: "text-rose-600 dark:text-rose-400",
        borderColor: "border-rose-200/80 dark:border-rose-800/60 hover:border-rose-300 dark:hover:border-rose-700",
        bgGradient: "from-rose-50/50 via-white to-amber-50/30 dark:from-rose-950/20 dark:via-slate-900 dark:to-amber-950/10",
        icon: <Target className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        observation: `${weakestSubjectName} is your highest-yield recovery opportunity. Bringing this section up to the 75% mark band will dramatically elevate your rank.`,
        actionableDrills: [
          `Allocate your first 35 minutes of daily prep to ${weakestSubjectName} when mental focus is peak.`,
          `Identify 3 recurring question archetypes in ${weakestSubjectName} and practice 10 variations each.`,
          `Review mistakes from your last 2 mocks in this section and re-solve them cleanly from scratch.`,
        ],
        tacticalTip: "In live tests, attempt high-certainty questions in this section first to secure safe marks early.",
        estimatedTime: "35 mins / day",
      });
    }

    // 2. ERROR PATTERN BREAKER (Calculation Errors, Silly Mistakes, Concept Gaps, or Time Pressure)
    if (topReason) {
      const reasonLower = topReason[0].toLowerCase();
      let drills: string[] = [];
      let tip = "";

      if (reasonLower.includes("calc") || reasonLower.includes("math")) {
        drills = [
          "Do 10 minutes of daily mental math: Vedic squares, tables up to 30, and fraction-to-percentage conversions.",
          "Write intermediate calculation steps neatly in dedicated quadrants on rough sheets—avoid overlapping scribble.",
          "Perform a rapid sanity-check on units and decimal positions before clicking the final option.",
        ];
        tip = "Speed math errors often happen when reading the answer options. Double check if the question asks for x, 2x, or the ratio.";
      } else if (reasonLower.includes("time") || reasonLower.includes("rush") || reasonLower.includes("pressure")) {
        drills = [
          "Enforce the strict 45-Second Rule: If you cannot map out the solution in 45 seconds, mark for review and move on.",
          "Divide test time into two clear passes: Pass 1 (guaranteed quick wins) and Pass 2 (moderate calculations).",
          "Practice timed 10-question sprints with a visible countdown timer to condition calmness under pressure.",
        ];
        tip = "Never let a single tricky question steal more than 2 minutes. Every question carries the same weight!";
      } else if (reasonLower.includes("concept") || reasonLower.includes("formula")) {
        drills = [
          "Maintain an active 'Mistake Logbook' with handwritten concept summaries for every missed question.",
          "Review core formula cards 15 minutes before bedtime for spaced memory consolidation.",
          "Teach the underlying concept out loud or write it without reference to verify true comprehension.",
        ];
        tip = "If you guess formulas, you lose twice: once on the wrong question, and once on negative penalty.";
      } else {
        drills = [
          "Underline or mentally repeat key constraint words like 'NOT', 'INCORRECT', 'EXCEPT', and 'MINIMUM'.",
          "Read all 4 options before selecting—don't jump on option A without verifying B, C, and D.",
          "Take a 5-second deep breath pause between test sections to reset focus.",
        ];
        tip = "Most silly errors happen in the first 5 minutes (rush) or final 10 minutes (fatigue). Stay deliberate.";
      }

      insights.push({
        id: "practice_error_pattern",
        category: "error_pattern",
        title: `Error Pattern: ${topReason[0]}`,
        subtitle: `Identified as the leading cause of mark deductions across ${topReason[1]} mock tests.`,
        frequencyText: `Occurred ${topReason[1]} Times`,
        impactScoreText: "+6 to +12 Marks",
        impactBadgeClass: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        accentColor: "text-indigo-600 dark:text-indigo-400",
        borderColor: "border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-300 dark:hover:border-indigo-700",
        bgGradient: "from-indigo-50/50 via-white to-blue-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-blue-950/10",
        icon: <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        observation: `${topReason[0]} is an execution pattern, not a knowledge defect. Correcting test-taking ergonomics and paper-solving discipline directly rescues these marks.`,
        actionableDrills: drills,
        tacticalTip: tip,
        estimatedTime: "15 mins / session",
      });
    } else {
      // Default error pattern if no reason tags logged
      insights.push({
        id: "practice_accuracy_discipline",
        category: "error_pattern",
        title: "Paper Solving Strategy: 2-Pass Method",
        subtitle: "Maximize score certainty by structuring your exam attempt into two disciplined waves.",
        frequencyText: "Strategic Blueprint",
        impactScoreText: "+8 to +15 Marks",
        impactBadgeClass: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
        accentColor: "text-indigo-600 dark:text-indigo-400",
        borderColor: "border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-300 dark:hover:border-indigo-700",
        bgGradient: "from-indigo-50/50 via-white to-blue-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-blue-950/10",
        icon: <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        observation: "Top rankers rarely solve papers strictly sequentially. They sweep through easy questions in Pass 1, then crack medium questions in Pass 2.",
        actionableDrills: [
          "Pass 1 (60% time): Solve 100% certain, fast-recall questions only. Never get stuck.",
          "Pass 2 (30% time): Return to bookmarked calculation-heavy or reading-heavy questions.",
          "Reserve final 10% of time for checking unattempted questions and verifying units.",
        ],
        tacticalTip: "Always record the 'Reason Lost' after submitting each mock to unlock automatic error category tracking.",
        estimatedTime: "Next Mock Application",
      });
    }

    // 3. NEGATIVE MARKING SHIELD (Avoidable Mark Deductions)
    if (totalNegativePenalty > 0) {
      const avgPenalty = Number((totalNegativePenalty / examAttempts.length).toFixed(1));
      insights.push({
        id: "practice_negative_guard",
        category: "negative_guard",
        title: "Negative Marking Shield",
        subtitle: `You lost a cumulative ${totalNegativePenalty} marks across ${examAttempts.length} mocks (avg -${avgPenalty} marks per mock).`,
        frequencyText: `-${avgPenalty} Marks / Mock`,
        impactScoreText: `+${Math.round(avgPenalty * 0.7)} Net Recovery`,
        impactBadgeClass: "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        accentColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-200/80 dark:border-amber-800/60 hover:border-amber-300 dark:hover:border-amber-700",
        bgGradient: "from-amber-50/50 via-white to-yellow-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-yellow-950/10",
        icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        observation: "Negative marking silently erodes the benefit of hard-earned correct answers. Cutting doubtful guesses instantly elevates your rank without studying new chapters.",
        actionableDrills: [
          "Implement the 'Eliminate Two' rule: Never mark a question unless you have logically disqualified at least 2 wrong options.",
          "In General Awareness and English Vocab, eliminate 100% blind wild guesses entirely.",
          "Review each wrong answer from your last mock and tag whether it was a genuine knowledge gap or a risky guess.",
        ],
        tacticalTip: "A skipped question awards 0 marks. An impulsive wrong guess awards negative marks and drains confidence.",
        estimatedTime: "5-min pre-test rule",
      });
    }

    // 4. SPEED & SECTIONAL PACING DRILL
    if (totalUnattempted > 0 || examAttempts.length >= 2) {
      const avgUnattempted = Math.round(totalUnattempted / examAttempts.length);
      insights.push({
        id: "practice_speed_pacing",
        category: "speed_pacing",
        title: "Sectional Speed & Pacing Drill",
        subtitle: avgUnattempted > 0
          ? `An average of ${avgUnattempted} questions remain unattempted per test due to time allocation.`
          : "Optimize your time-per-question distribution to finish 5 minutes ahead of the clock.",
        frequencyText: avgUnattempted > 0 ? `${avgUnattempted} Left Unattempted` : "Pacing Engine",
        impactScoreText: "+6 to +10 Marks",
        impactBadgeClass: "bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
        accentColor: "text-teal-600 dark:text-teal-400",
        borderColor: "border-teal-200/80 dark:border-teal-800/60 hover:border-teal-300 dark:hover:border-teal-700",
        bgGradient: "from-teal-50/50 via-white to-cyan-50/30 dark:from-teal-950/20 dark:via-slate-900 dark:to-cyan-950/10",
        icon: <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
        observation: "Unattempted questions frequently hide easy, low-hanging fruit in the back of the paper that you never got to read.",
        actionableDrills: [
          "Pre-allocate strict time caps per section (e.g. 15 mins Reasoning, 10 mins GK, 15 mins English, 20 mins Quant).",
          "When section time expires, move immediately to the next section—never borrow time from other sections.",
          "Practice 15-minute speed drills with 20 questions to train brisk question evaluation.",
        ],
        tacticalTip: "Always scan to the very last question of every section; test setters often place 3 easy questions right at the end!",
        estimatedTime: "20 mins drill",
      });
    }

    return insights;
  }, [examAttempts, activeExam]);

  // Filtered insights by category chip
  const filteredInsights = useMemo(() => {
    if (selectedCategory === "all") return smartInsights;
    return smartInsights.filter((i) => i.category === selectedCategory);
  }, [smartInsights, selectedCategory]);

  // If no mocks logged yet, show intelligent diagnostic guide
  if (examAttempts.length === 0) {
    return (
      <div className="card-luminous rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Smart Insights</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Diagnostic Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Personalized practice areas based on your frequent mistakes
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500 text-white shrink-0 mt-0.5">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                Unlock Targeted Practice Blueprints
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                As soon as you log your first mock test and tag your mistake reasons (calculation slips, time pressure, concept gaps, or weak topics), Smart Insights will automatically synthesize specific daily drills and score recovery blueprints for {activeExam.name}.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Target: Identify your top score-leakage areas</span>
            </span>

            {onOpenLogModal && (
              <button
                type="button"
                onClick={() => {
                  HapticService.selection();
                  onOpenLogModal();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-display shadow-xs cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Log First Mock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-luminous rounded-3xl p-4 sm:p-5 space-y-4">
      {/* Header with Title and Category Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black font-display text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
                <span>Smart Insights</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                  {smartInsights.length} Practice {smartInsights.length === 1 ? "Area" : "Areas"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                Targeted practice areas identified from frequent mistakes in past mocks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onNavigateTab?.("insights");
            }}
            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Deep Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        {smartInsights.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                setSelectedCategory("all");
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              All Insights ({smartInsights.length})
            </button>

            {smartInsights.some((i) => i.category === "weak_topic") && (
              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setSelectedCategory("weak_topic");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "weak_topic"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Weak Topics
              </button>
            )}

            {smartInsights.some((i) => i.category === "error_pattern") && (
              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setSelectedCategory("error_pattern");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "error_pattern"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Error Patterns
              </button>
            )}

            {smartInsights.some((i) => i.category === "negative_guard") && (
              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setSelectedCategory("negative_guard");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "negative_guard"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Negative Penalty
              </button>
            )}

            {smartInsights.some((i) => i.category === "speed_pacing") && (
              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setSelectedCategory("speed_pacing");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "speed_pacing"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                Pacing &amp; Speed
              </button>
            )}
          </div>
        )}
      </div>

      {/* Smart Insight Cards Grid */}
      <div className="grid gap-3">
        {filteredInsights.map((insight) => {
          const isExpanded = expandedCardId === insight.id;

          return (
            <div
              key={insight.id}
              className={`rounded-2xl border p-4 bg-gradient-to-br ${insight.bgGradient} ${insight.borderColor} transition-all space-y-3 shadow-2xs hover:shadow-sm`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs shrink-0 mt-0.5">
                    {insight.icon}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-black font-display text-slate-900 dark:text-slate-100 truncate">
                        {insight.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${insight.impactBadgeClass}`}>
                        {insight.frequencyText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {insight.subtitle}
                    </p>
                  </div>
                </div>

                {/* Mark Recovery Badge */}
                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    Score Upside
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {insight.impactScoreText}
                  </span>
                </div>
              </div>

              {/* Observation Snippet */}
              <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                {insight.observation}
              </p>

              {/* Actionable Practice Drills (Collapsible) */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    HapticService.lightTap();
                    setExpandedCardId(isExpanded ? null : insight.id);
                  }}
                  className="w-full flex items-center justify-between pt-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-display">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isExpanded ? "Hide Specific Practice Drills" : "View Recommended Practice Drills"}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-indigo-500" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 mt-2"
                    >
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Actionable Practice Routine:
                      </span>

                      <div className="space-y-1.5">
                        {insight.actionableDrills.map((drill, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-snug">{drill}</span>
                          </div>
                        ))}
                      </div>

                      {/* Tactical Pro-Tip */}
                      <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/60 text-xs space-y-1">
                        <span className="font-extrabold text-indigo-800 dark:text-indigo-300 block flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Tactical Strategy:</span>
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                          {insight.tacticalTip}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Pacing Target: <strong>{insight.estimatedTime}</strong></span>
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
