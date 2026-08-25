import { MockAttempt, ExamProfile } from "../types";

export interface PerformanceInsight {
  hasEnoughData: boolean;
  minMocksRequired: number;
  currentMockCount: number;
  trendType?: "Strong Recovery" | "Performance Dip" | "Upward Surge" | "Consistent Baseline" | "High Volatility";
  headline: string;
  description: string;
  badgeColor: string;
  badgeText: string;
  deltaMarks?: number;
  recommendation: string;
}

export interface AnalyticsSummary {
  totalMocks: number;
  averageScore: number;
  peakScore: number;
  overallAccuracy: number;
  totalNegativeMarksLost: number;
  avoidableMarksRecommendation: string;
  baselineScore: number;
  baselineTrend: "peak" | "stable" | "dip";
  performanceInsight: PerformanceInsight;
  archetype: {
    title: string;
    badge: string;
    description: string;
    color: string;
  };
  subjectBreakdown: {
    name: string;
    scoreAvg: number;
    maxAvg: number;
    percentage: number;
    status: "Very Strong" | "Strong" | "Moderate" | "Needs Improvement";
    colorClass: string;
  }[];
}

export function calculateAnalytics(
  attempts: MockAttempt[],
  activeExam: ExamProfile
): AnalyticsSummary {
  const filtered = attempts.filter((a) => a.profileId === activeExam.id);

  if (filtered.length === 0) {
    return {
      totalMocks: 0,
      averageScore: 0,
      peakScore: 0,
      overallAccuracy: 0,
      totalNegativeMarksLost: 0,
      avoidableMarksRecommendation: "Log at least 1 mock test to analyze baseline metrics.",
      baselineScore: 0,
      baselineTrend: "stable",
      performanceInsight: {
        hasEnoughData: false,
        minMocksRequired: 3,
        currentMockCount: 0,
        headline: "Performance Insights Locked",
        description: "Log at least 3 mock tests to unlock trend analysis and performance prediction (0/3 logged).",
        badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700",
        badgeText: "🔒 Need 3 More Mocks",
        recommendation: "Take 3 or more mock tests under realistic exam conditions to reveal reliable performance trends.",
      },
      archetype: {
        title: "Fresh Aspirant",
        badge: "🌱 New Starter",
        description: "Log your first mock test to reveal your exam attempt personality archetype.",
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      },
      subjectBreakdown: [
        { name: "Quantitative Aptitude", scoreAvg: 0, maxAvg: 50, percentage: 0, status: "Needs Improvement", colorClass: "text-red-600 bg-red-500" },
        { name: "Reasoning Ability", scoreAvg: 0, maxAvg: 50, percentage: 0, status: "Needs Improvement", colorClass: "text-red-600 bg-red-500" },
        { name: "English Comprehension", scoreAvg: 0, maxAvg: 50, percentage: 0, status: "Needs Improvement", colorClass: "text-red-600 bg-red-500" },
        { name: "General Awareness", scoreAvg: 0, maxAvg: 50, percentage: 0, status: "Needs Improvement", colorClass: "text-red-600 bg-red-500" },
      ],
    };
  }

  // Sort by date descending
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalMocks = sorted.length;
  const scores = sorted.map((a) => a.score);
  const totalScoreSum = scores.reduce((sum, s) => sum + s, 0);
  const averageScore = Number((totalScoreSum / totalMocks).toFixed(1));
  const peakScore = Math.max(...scores);

  // Accuracy calculation
  const totalCorrect = sorted.reduce((sum, a) => sum + a.correctCount, 0);
  const totalIncorrect = sorted.reduce((sum, a) => sum + a.incorrectCount, 0);
  const totalAttempted = totalCorrect + totalIncorrect;
  const overallAccuracy =
    totalAttempted > 0
      ? Number(((totalCorrect / totalAttempted) * 100).toFixed(1))
      : 0;

  // Negative marks lost
  const totalNegativeMarksLost = Number(
    sorted.reduce((sum, a) => sum + a.negativePenalty, 0).toFixed(1)
  );

  const avgNegPerMock = Number((totalNegativeMarksLost / totalMocks).toFixed(1));

  let avoidableMarksRecommendation = `You lost ${totalNegativeMarksLost} marks due to negative marking across your ${totalMocks} mock attempts (avg -${avgNegPerMock} per mock).`;
  if (avgNegPerMock > 8) {
    avoidableMarksRecommendation += ` Cutting unconfident guesses by 50% can boost your net score by +${Math.round(avgNegPerMock * 0.6)} marks!`;
  } else {
    avoidableMarksRecommendation += ` Your guessing penalty is well-controlled. Focus on increasing speed and total attempted questions.`;
  }

  // Baseline calculation (weighted exponential moving average over last 5 attempts)
  const recent5 = sorted.slice(0, 5);
  let weightedSum = 0;
  let weightSum = 0;
  recent5.forEach((att, idx) => {
    const weight = 5 - idx; // highest weight to newest
    weightedSum += att.score * weight;
    weightSum += weight;
  });
  const baselineScore = Number((weightedSum / weightSum).toFixed(1));

  // Trend status
  let baselineTrend: "peak" | "stable" | "dip" = "stable";
  if (recent5.length >= 2) {
    const latest = recent5[0].score;
    const previousAvg = recent5.slice(1).reduce((s, a) => s + a.score, 0) / (recent5.length - 1);
    if (latest > previousAvg + 5) {
      baselineTrend = "peak";
    } else if (latest < previousAvg - 5) {
      baselineTrend = "dip";
    }
  }

  // Calculate Advanced Performance Insight (only if totalMocks >= 3)
  let performanceInsight: PerformanceInsight;

  if (totalMocks < 3) {
    performanceInsight = {
      hasEnoughData: false,
      minMocksRequired: 3,
      currentMockCount: totalMocks,
      headline: "Performance Insights Locked",
      description: `Log at least 3 mock tests to unlock trend analysis and recovery predictions (${totalMocks}/3 logged).`,
      badgeColor: "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700",
      badgeText: `🔒 Need ${3 - totalMocks} More Mock${3 - totalMocks > 1 ? "s" : ""}`,
      recommendation: "Take 3 or more mock tests under realistic exam conditions to reveal reliable performance trends.",
    };
  } else {
    // Chronological order (oldest to newest)
    const chronological = [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(a.date).getTime()
    );
    const chronoScores = chronological.map((a) => a.score);
    const n = chronoScores.length;

    const latest = chronoScores[n - 1];
    const prev1 = chronoScores[n - 2];
    const prev2 = chronoScores[n - 3];

    const recent4 = chronoScores.slice(-4);
    const recentAvgExcludingLatest =
      chronoScores.slice(-4, -1).reduce((sum, s) => sum + s, 0) / Math.min(3, n - 1);

    const minInRecent = Math.min(...recent4);
    const maxInRecent = Math.max(...recent4);
    const rangeInRecent = maxInRecent - minInRecent;

    if ((latest - prev1 >= 8 || latest - prev1 >= activeExam.totalMarks * 0.04) && (prev1 < prev2 || prev1 < recentAvgExcludingLatest)) {
      // Strong Recovery
      const delta = Number((latest - prev1).toFixed(1));
      performanceInsight = {
        hasEnoughData: true,
        minMocksRequired: 3,
        currentMockCount: totalMocks,
        trendType: "Strong Recovery",
        headline: "Strong Recovery Detected",
        description: `Outstanding bounce-back! Your latest score of ${latest} marks jumped by +${delta} marks following a previous slump.`,
        badgeColor: "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
        badgeText: "📈 Strong Recovery",
        deltaMarks: delta,
        recommendation: "Maintain your revised test strategy and review the weak areas that triggered this positive turnaround.",
      };
    } else if (prev1 - latest >= 8 || recentAvgExcludingLatest - latest >= 8) {
      // Performance Dip
      const delta = Number((prev1 - latest).toFixed(1));
      performanceInsight = {
        hasEnoughData: true,
        minMocksRequired: 3,
        currentMockCount: totalMocks,
        trendType: "Performance Dip",
        headline: "Performance Dip Detected",
        description: `Your latest score (${latest} marks) dropped by -${delta} marks compared to your previous attempt (${prev1} marks).`,
        badgeColor: "bg-red-50 dark:bg-red-950/70 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
        badgeText: "📉 Performance Dip",
        deltaMarks: -delta,
        recommendation: "Don't worry—check if paper difficulty was unusually high or analyze silly errors lost to negative marking.",
      };
    } else if ((latest > prev1 && prev1 > prev2) || (latest >= maxInRecent && latest - chronoScores[Math.max(0, n - 4)] >= 5)) {
      // Upward Surge
      const delta = Number((latest - prev2).toFixed(1));
      performanceInsight = {
        hasEnoughData: true,
        minMocksRequired: 3,
        currentMockCount: totalMocks,
        trendType: "Upward Surge",
        headline: "Upward Growth Surge",
        description: `Consistent upward momentum! Your mock scores have steadily increased over recent attempts (+${delta} marks over last 3 tests).`,
        badgeColor: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
        badgeText: "🚀 Upward Surge",
        deltaMarks: delta,
        recommendation: "Keep taking mocks at this frequency to cement your baseline at this higher score band.",
      };
    } else if (rangeInRecent <= 8) {
      // Consistent Baseline
      performanceInsight = {
        hasEnoughData: true,
        minMocksRequired: 3,
        currentMockCount: totalMocks,
        trendType: "Consistent Baseline",
        headline: "Consistent Baseline Established",
        description: `Your performance is remarkably stable around ${Math.round(recentAvgExcludingLatest)} marks across recent attempts.`,
        badgeColor: "bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700",
        badgeText: "🎯 Consistent Baseline",
        recommendation: "Target specific high-yield weak chapters (like Quant Geometry or Vocab) to break through your score plateau.",
      };
    } else {
      // High Volatility
      performanceInsight = {
        hasEnoughData: true,
        minMocksRequired: 3,
        currentMockCount: totalMocks,
        trendType: "High Volatility",
        headline: "Score Fluctuations Detected",
        description: `Your mock scores vary widely across attempts (range: ${minInRecent} to ${maxInRecent} marks) depending on paper pattern or topic coverage.`,
        badgeColor: "bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700",
        badgeText: "⚡ High Volatility",
        recommendation: "Work on paper attempting strategy and time distribution to achieve more predictable results.",
      };
    }
  }

  // Archetype determination
  let archetype = {
    title: "🎯 Precision Sniper",
    badge: "🎯 Precision Sniper",
    description: "High accuracy (>80%) with selective attempts. You minimize negative marking risk effectively.",
    color: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
  };

  const avgAttemptRatio =
    sorted.reduce(
      (sum, a) => sum + (a.correctCount + a.incorrectCount) / (a.maxMarks / 2),
      0
    ) / totalMocks;

  if (overallAccuracy >= 82 && avgAttemptRatio < 0.85) {
    archetype = {
      title: "🎯 Precision Sniper",
      badge: "🎯 Precision Sniper",
      description: "High accuracy (>82%) with selective attempts. Extremely safe from negative marking penalties.",
      color: "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
    };
  } else if (overallAccuracy < 78 && avgAttemptRatio >= 0.85) {
    archetype = {
      title: "⚡ Aggressive Attempt Specialist",
      badge: "⚡ Aggressive Specialist",
      description: "High attempt volume with moderate accuracy. Trimming 4-5 doubtful guesses per test will unlock a 10+ mark jump.",
      color: "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700",
    };
  } else if (overallAccuracy >= 80) {
    archetype = {
      title: "⚖️ Balanced Strategist",
      badge: "⚖️ Balanced Strategist",
      description: "Optimal balance between speed and accuracy. Ready for cut-off clearance in Tier-1 & Prelims.",
      color: "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700",
    };
  } else {
    archetype = {
      title: "🛡️ Calculated Defender",
      badge: "🛡️ Calculated Defender",
      description: "Steady attempt pattern with growth potential. Focus on strengthening General Awareness & Quant speed.",
      color: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
    };
  }

  // Subject breakdown calculation
  const defaultSections = [
    "Quantitative Aptitude",
    "Reasoning Ability",
    "English Comprehension",
    "General Awareness",
  ];

  const sectionMap: Record<string, { totalScore: number; totalMax: number; count: number }> = {};
  defaultSections.forEach((sec) => {
    sectionMap[sec] = { totalScore: 0, totalMax: 0, count: 0 };
  });

  sorted.forEach((att) => {
    if (att.sections && att.sections.length > 0) {
      att.sections.forEach((sec) => {
        if (!sectionMap[sec.name]) {
          sectionMap[sec.name] = { totalScore: 0, totalMax: 0, count: 0 };
        }
        sectionMap[sec.name].totalScore += sec.score;
        sectionMap[sec.name].totalMax += sec.maxMarks;
        sectionMap[sec.name].count += 1;
      });
    }
  });

  const subjectBreakdown = Object.entries(sectionMap).map(([name, data]) => {
    const scoreAvg = data.count > 0 ? Number((data.totalScore / data.count).toFixed(1)) : 0;
    const maxAvg = data.count > 0 ? Number((data.totalMax / data.count).toFixed(1)) : 50;
    const percentage = maxAvg > 0 ? Math.round((scoreAvg / maxAvg) * 100) : 0;

    let status: "Very Strong" | "Strong" | "Moderate" | "Needs Improvement" = "Moderate";
    let colorClass = "bg-amber-500 text-amber-600";

    if (percentage >= 85) {
      status = "Very Strong";
      colorClass = "bg-emerald-500 text-emerald-600";
    } else if (percentage >= 75) {
      status = "Strong";
      colorClass = "bg-teal-500 text-teal-600";
    } else if (percentage >= 60) {
      status = "Moderate";
      colorClass = "bg-amber-500 text-amber-600";
    } else {
      status = "Needs Improvement";
      colorClass = "bg-red-500 text-red-600";
    }

    return {
      name,
      scoreAvg,
      maxAvg,
      percentage,
      status,
      colorClass,
    };
  });

  return {
    totalMocks,
    averageScore,
    peakScore,
    overallAccuracy,
    totalNegativeMarksLost,
    avoidableMarksRecommendation,
    baselineScore,
    baselineTrend,
    performanceInsight,
    archetype,
    subjectBreakdown,
  };
}

export function calculateDaysLeft(examDateStr?: string): number | null {
  if (!examDateStr) return null;
  const examDate = new Date(examDateStr);
  const now = new Date("2026-08-24T00:00:00");
  const diffTime = examDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
