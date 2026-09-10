import { MockAttempt, PlatformId, TestType, SectionScore } from "../types";

export interface MarkingSchemePreset {
  id: string;
  label: string;
  shortLabel: string;
  correctMarks: number;
  penaltyMarks: number; // Positive number, subtracted per incorrect answer
  defaultQuestions: number;
  defaultMaxMarks: number;
  description: string;
}

export const MARKING_SCHEMES: MarkingSchemePreset[] = [
  {
    id: "ssc_cgl",
    label: "SSC CGL / CHSL (+2, -0.5)",
    shortLabel: "+2 / -0.5",
    correctMarks: 2.0,
    penaltyMarks: 0.5,
    defaultQuestions: 100,
    defaultMaxMarks: 200,
    description: "Standard SSC Tier-1 scheme: 100 questions, 2 marks each, 0.25 (0.50 marks) negative",
  },
  {
    id: "bank_prelims",
    label: "Banking / IBPS / SBI Prelims (+1, -0.25)",
    shortLabel: "+1 / -0.25",
    correctMarks: 1.0,
    penaltyMarks: 0.25,
    defaultQuestions: 100,
    defaultMaxMarks: 100,
    description: "100 questions, 1 mark each, 0.25 penalty per wrong question",
  },
  {
    id: "rrb_railways",
    label: "Railways RRB NTPC (+1, -0.33)",
    shortLabel: "+1 / -0.33",
    correctMarks: 1.0,
    penaltyMarks: 0.333,
    defaultQuestions: 100,
    defaultMaxMarks: 100,
    description: "100 questions, 1 mark each, 1/3rd (0.33) negative penalty",
  },
  {
    id: "jee_main",
    label: "JEE Main / NDA (+4, -1)",
    shortLabel: "+4 / -1",
    correctMarks: 4.0,
    penaltyMarks: 1.0,
    defaultQuestions: 75,
    defaultMaxMarks: 300,
    description: "75 questions, 4 marks each, -1 penalty for incorrect MCQs",
  },
  {
    id: "neet_ug",
    label: "NEET UG (+4, -1)",
    shortLabel: "+4 / -1 (720M)",
    correctMarks: 4.0,
    penaltyMarks: 1.0,
    defaultQuestions: 180,
    defaultMaxMarks: 720,
    description: "180 questions, 4 marks each, -1 mark penalty",
  },
  {
    id: "upsc_prelims",
    label: "UPSC Prelims GS-1 (+2, -0.66)",
    shortLabel: "+2 / -0.66",
    correctMarks: 2.0,
    penaltyMarks: 0.666,
    defaultQuestions: 100,
    defaultMaxMarks: 200,
    description: "100 questions, 2 marks each, 1/3rd (0.666 marks) penalty",
  },
  {
    id: "custom",
    label: "Custom Marking Scheme",
    shortLabel: "Custom",
    correctMarks: 1.0,
    penaltyMarks: 0.25,
    defaultQuestions: 100,
    defaultMaxMarks: 100,
    description: "Custom user-specified correct marks and negative penalty",
  },
];

/**
 * Intelligently detects the best matching marking scheme preset for an exam
 */
export function detectDefaultMarkingScheme(examName: string, totalMarks: number): MarkingSchemePreset {
  const name = (examName || "").toLowerCase();

  if (name.includes("neet")) {
    return MARKING_SCHEMES.find((s) => s.id === "neet_ug")!;
  }
  if (name.includes("jee")) {
    return MARKING_SCHEMES.find((s) => s.id === "jee_main")!;
  }
  if (name.includes("bank") || name.includes("ibps") || name.includes("sbi") || name.includes("rbi")) {
    return MARKING_SCHEMES.find((s) => s.id === "bank_prelims")!;
  }
  if (name.includes("railway") || name.includes("rrb") || name.includes("ntpc")) {
    return MARKING_SCHEMES.find((s) => s.id === "rrb_railways")!;
  }
  if (name.includes("upsc") || name.includes("civil services") || name.includes("ias")) {
    return MARKING_SCHEMES.find((s) => s.id === "upsc_prelims")!;
  }
  if (name.includes("ssc") || name.includes("cgl") || name.includes("chsl") || totalMarks === 200) {
    return MARKING_SCHEMES.find((s) => s.id === "ssc_cgl")!;
  }

  // Fallback by totalMarks
  if (totalMarks === 720) return MARKING_SCHEMES.find((s) => s.id === "neet_ug")!;
  if (totalMarks === 300) return MARKING_SCHEMES.find((s) => s.id === "jee_main")!;
  if (totalMarks === 100) return MARKING_SCHEMES.find((s) => s.id === "bank_prelims")!;

  return MARKING_SCHEMES[0];
}

/**
 * Calculates raw and net score from correct and incorrect question counts
 */
export function calculateScoreFromQuestions(
  correctCount: number,
  incorrectCount: number,
  correctMarks: number,
  penaltyMarks: number
): {
  grossScore: number;
  penaltyLost: number;
  netScore: number;
} {
  const grossScore = Math.max(0, correctCount * correctMarks);
  const penaltyLost = Math.max(0, incorrectCount * penaltyMarks);
  const netScore = Math.round((grossScore - penaltyLost) * 100) / 100;

  return {
    grossScore: Math.round(grossScore * 100) / 100,
    penaltyLost: Math.round(penaltyLost * 100) / 100,
    netScore,
  };
}

/**
 * Auto-calculates Skipped questions given totalQuestions, correct, and incorrect
 */
export function calculateSkippedQuestions(
  totalQuestions: number,
  correctCount: number,
  incorrectCount: number
): number {
  if (totalQuestions <= 0) return 0;
  return Math.max(0, totalQuestions - (correctCount + incorrectCount));
}

/**
 * Auto-calculates Accuracy percentage
 */
export function calculateAccuracy(correctCount: number, incorrectCount: number): number {
  const attempted = correctCount + incorrectCount;
  if (attempted <= 0) return 0;
  return Math.round((correctCount / attempted) * 1000) / 10;
}

/**
 * Returns accuracy category and badge style
 */
export function getAccuracyTier(accuracy: number): {
  label: string;
  badgeClass: string;
  textColor: string;
  icon: string;
  advice: string;
} {
  if (accuracy >= 92) {
    return {
      label: "Sniper Accuracy",
      badgeClass: "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
      textColor: "text-emerald-600 dark:text-emerald-400",
      icon: "🎯",
      advice: "Flawless precision! Keep this consistency on exam day.",
    };
  }
  if (accuracy >= 84) {
    return {
      label: "High Precision",
      badgeClass: "bg-teal-50 dark:bg-teal-950/70 border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300",
      textColor: "text-teal-600 dark:text-teal-400",
      icon: "✓",
      advice: "Solid accuracy. Minimize marginal 50-50 gambles to cross 90%.",
    };
  }
  if (accuracy >= 72) {
    return {
      label: "Moderate (Needs Caution)",
      badgeClass: "bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300",
      textColor: "text-amber-600 dark:text-amber-400",
      icon: "⚠️",
      advice: "Negative marks are dragging your score down. Cut blind guesses.",
    };
  }
  return {
    label: "High Negative Trap",
    badgeClass: "bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300",
    textColor: "text-rose-600 dark:text-rose-400",
    icon: "🚨",
    advice: "Heavy penalty leakage! Focus on question selection discipline.",
  };
}

/**
 * Auto-calculates Percentile from Rank and Total Candidates
 */
export function calculatePercentileFromRank(rank: number, totalCandidates: number): number | null {
  if (!rank || !totalCandidates || totalCandidates <= 0 || rank <= 0 || rank > totalCandidates) {
    return null;
  }
  const pct = ((totalCandidates - rank) / totalCandidates) * 100;
  return Math.round(pct * 100) / 100;
}

/**
 * Auto-estimates Rank from Percentile and Total Candidates
 */
export function calculateRankFromPercentile(percentile: number, totalCandidates: number): number | null {
  if (
    percentile === undefined ||
    percentile === null ||
    !totalCandidates ||
    totalCandidates <= 0 ||
    percentile < 0 ||
    percentile > 100
  ) {
    return null;
  }
  const rank = Math.round(totalCandidates * (1 - percentile / 100)) + 1;
  return Math.max(1, Math.min(totalCandidates, rank));
}

/**
 * Auto-calculates Time Pacing (Seconds per Question) and speed diagnosis
 */
export function calculateTimePacing(
  timeSpentMinutes: number,
  questionsAttempted: number
): {
  secondsPerQuestion: number;
  formattedPacing: string;
  speedCategory: "fast" | "optimal" | "deliberate" | "slow";
  statusLabel: string;
} | null {
  if (!timeSpentMinutes || timeSpentMinutes <= 0 || !questionsAttempted || questionsAttempted <= 0) {
    return null;
  }

  const totalSeconds = timeSpentMinutes * 60;
  const secPerQ = Math.round(totalSeconds / questionsAttempted);

  let speedCategory: "fast" | "optimal" | "deliberate" | "slow" = "optimal";
  let statusLabel = "Optimal Pace";

  if (secPerQ < 36) {
    speedCategory = "fast";
    statusLabel = "Lightning Fast (Watch for Silly Errors)";
  } else if (secPerQ <= 58) {
    speedCategory = "optimal";
    statusLabel = "Ideal Competition Speed";
  } else if (secPerQ <= 85) {
    speedCategory = "deliberate";
    statusLabel = "Steady & Thoughtful";
  } else {
    speedCategory = "slow";
    statusLabel = "Slow Pace (Time Pressure Risk)";
  }

  return {
    secondsPerQuestion: secPerQ,
    formattedPacing: `${secPerQ}s / q`,
    speedCategory,
    statusLabel,
  };
}

/**
 * Analyzes subject section scores to identify strongest and weakest areas
 */
export interface SectionAnalysisResult {
  strongest?: { name: string; score: number; maxMarks: number; percentage: number };
  weakest?: { name: string; score: number; maxMarks: number; percentage: number };
  suggestedWeakTags: string[];
  totalSectionScore: number;
  totalSectionMax: number;
}

export function analyzeSectionBreakdown(
  sections: Array<{ name: string; score: string | number; maxMarks: string | number }>
): SectionAnalysisResult {
  const validSections = sections
    .map((s) => {
      const scoreNum = typeof s.score === "number" ? s.score : parseFloat(String(s.score));
      const maxNum = typeof s.maxMarks === "number" ? s.maxMarks : parseFloat(String(s.maxMarks));
      if (isNaN(scoreNum) || isNaN(maxNum) || maxNum <= 0) return null;
      return {
        name: s.name.trim() || "Section",
        score: scoreNum,
        maxMarks: maxNum,
        percentage: Math.round((scoreNum / maxNum) * 1000) / 10,
      };
    })
    .filter((s): s is { name: string; score: number; maxMarks: number; percentage: number } => s !== null);

  if (validSections.length === 0) {
    return { suggestedWeakTags: [], totalSectionScore: 0, totalSectionMax: 0 };
  }

  const totalSectionScore = Math.round(validSections.reduce((acc, s) => acc + s.score, 0) * 100) / 100;
  const totalSectionMax = validSections.reduce((acc, s) => acc + s.maxMarks, 0);

  const sortedByPct = [...validSections].sort((a, b) => b.percentage - a.percentage);
  const strongest = sortedByPct[0];
  const weakest = sortedByPct[sortedByPct.length - 1];

  // Auto-generate suggested weak tags: any section under 55% or lowest
  const suggestedWeakTags: string[] = [];
  if (weakest && weakest.percentage < 65) {
    suggestedWeakTags.push(`${weakest.name} (Low Score)`);
  }

  validSections.forEach((s) => {
    if (s.percentage < 50 && !suggestedWeakTags.some((t) => t.includes(s.name))) {
      suggestedWeakTags.push(`${s.name} Revision Needed`);
    }
  });

  return {
    strongest,
    weakest: validSections.length > 1 ? weakest : undefined,
    suggestedWeakTags,
    totalSectionScore,
    totalSectionMax,
  };
}

/**
 * Computes comparisons against target score, past average, and previous mock
 */
export interface MockLiveComparison {
  deltaVsLast: number | null;
  deltaVsAvg: number | null;
  deltaVsTarget: number | null;
  targetAchieved: boolean;
  isNewPersonalBest: boolean;
  scorePercentage: number;
}

export function calculateLiveComparison(
  currentScore: number,
  maxMarks: number,
  previousAttempts: MockAttempt[],
  examProfileId: string,
  targetScore?: number
): MockLiveComparison {
  const profileAttempts = previousAttempts.filter((a) => a.profileId === examProfileId);
  const scorePercentage = maxMarks > 0 ? Math.round((currentScore / maxMarks) * 1000) / 10 : 0;

  if (profileAttempts.length === 0) {
    return {
      deltaVsLast: null,
      deltaVsAvg: null,
      deltaVsTarget: targetScore ? Math.round((currentScore - targetScore) * 10) / 10 : null,
      targetAchieved: targetScore !== undefined && currentScore >= targetScore,
      isNewPersonalBest: false,
      scorePercentage,
    };
  }

  const lastMock = profileAttempts[0];
  const deltaVsLast = Math.round((currentScore - lastMock.score) * 10) / 10;

  const totalScores = profileAttempts.reduce((acc, a) => acc + a.score, 0);
  const avg = totalScores / profileAttempts.length;
  const deltaVsAvg = Math.round((currentScore - avg) * 10) / 10;

  const peakScore = Math.max(...profileAttempts.map((a) => a.score));
  const isNewPersonalBest = currentScore > peakScore;

  const deltaVsTarget = targetScore !== undefined ? Math.round((currentScore - targetScore) * 10) / 10 : null;
  const targetAchieved = targetScore !== undefined && currentScore >= targetScore;

  return {
    deltaVsLast,
    deltaVsAvg,
    deltaVsTarget,
    targetAchieved,
    isNewPersonalBest,
    scorePercentage,
  };
}

/**
 * Auto-generates a smart, clean title for the mock attempt
 */
export function autoGenerateTitle(
  platformId: PlatformId,
  platformName: string,
  testType: TestType,
  examShortCode: string,
  existingAttempts: MockAttempt[],
  examProfileId: string
): string {
  const samePlatformAttempts = existingAttempts.filter(
    (a) => a.profileId === examProfileId && a.platform === platformId
  );
  const nextNum = samePlatformAttempts.length + 1;

  if (testType === "Sectional") {
    return `${platformName} ${examShortCode || "Exam"} Sectional #${nextNum}`;
  }
  if (testType === "Previous Year Paper") {
    return `${examShortCode || "Exam"} Previous Year Paper #${nextNum}`;
  }
  if (testType === "Topic/Chapter Test") {
    return `${platformName} Topic Test #${nextNum}`;
  }

  return `${platformName} Full Mock #${nextNum}`;
}

export interface InferredMockData {
  percentage: number;
  estimatedPercentile: number;
  projectedRankBand: string;
  rankBandClass: string;
  targetDelta: number | null;
  targetAchieved: boolean;
  estimatedCorrect: number;
  estimatedIncorrect: number;
  estimatedAccuracy: number;
  cutoffComparison: {
    label: string;
    isSafe: boolean;
    margin: number;
    estimatedCutoff: number;
  };
  autoTitle: string;
  estimatedPacePerQSeconds: number;
}

/**
 * High-precision inference engine based on "Ask less, give more"
 * Infers percentile, rank band, target margin, cutoff safety, and question breakdown from score alone.
 */
export function inferMockMetadataFromScore(
  score: number,
  maxMarks: number,
  platformId: PlatformId,
  examName: string,
  targetScore: number | undefined,
  existingAttempts: MockAttempt[],
  examProfileId: string
): InferredMockData {
  const safeMax = maxMarks > 0 ? maxMarks : 200;
  const clampedScore = Math.max(0, Math.min(score, safeMax));
  const ratio = clampedScore / safeMax;
  const percentage = Math.round(ratio * 1000) / 10;

  // Statistical Percentile Curve calibrated to Indian competitive exam distributions
  let estimatedPercentile: number;
  if (ratio >= 0.95) estimatedPercentile = 99.8;
  else if (ratio >= 0.90) estimatedPercentile = 99.2;
  else if (ratio >= 0.85) estimatedPercentile = 98.4;
  else if (ratio >= 0.80) estimatedPercentile = 96.9;
  else if (ratio >= 0.75) estimatedPercentile = 94.5;
  else if (ratio >= 0.70) estimatedPercentile = 89.8;
  else if (ratio >= 0.65) estimatedPercentile = 83.2;
  else if (ratio >= 0.60) estimatedPercentile = 74.5;
  else if (ratio >= 0.55) estimatedPercentile = 63.8;
  else if (ratio >= 0.50) estimatedPercentile = 51.5;
  else if (ratio >= 0.45) estimatedPercentile = 39.5;
  else if (ratio >= 0.40) estimatedPercentile = 29.0;
  else if (ratio >= 0.30) estimatedPercentile = 15.0;
  else estimatedPercentile = Math.max(1, Math.round(ratio * 40));

  // Projected Rank Band
  let projectedRankBand = "Top 50%";
  let rankBandClass = "text-slate-600 bg-slate-100 dark:bg-slate-800";
  if (estimatedPercentile >= 98) {
    projectedRankBand = "Top 1-2% (Top Ranker Zone)";
    rankBandClass = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800";
  } else if (estimatedPercentile >= 92) {
    projectedRankBand = "Top 5-8% (Selection Ready)";
    rankBandClass = "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800";
  } else if (estimatedPercentile >= 80) {
    projectedRankBand = "Top 15-20% (Competitive Band)";
    rankBandClass = "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800";
  } else if (estimatedPercentile >= 65) {
    projectedRankBand = "Borderline Qualifier Zone";
    rankBandClass = "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800";
  } else {
    projectedRankBand = "Revision Required Zone";
    rankBandClass = "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800";
  }

  // Target Delta
  const targetDelta = targetScore !== undefined ? Math.round((clampedScore - targetScore) * 10) / 10 : null;
  const targetAchieved = targetScore !== undefined && clampedScore >= targetScore;

  // Question Breakdown Estimation
  const scheme = detectDefaultMarkingScheme(examName, safeMax);
  const positiveM = scheme.correctMarks || 2;
  const negativeM = scheme.penaltyMarks || 0.5;

  let estimatedCorrect = 0;
  let estimatedIncorrect = 0;
  let estimatedAccuracy = 85;

  if (clampedScore > 0) {
    // Assuming realistic student accuracy of ~86% on competitive exams
    const effectiveNetPerCorrect = positiveM - (0.16 * negativeM);
    estimatedCorrect = Math.max(1, Math.round(clampedScore / effectiveNetPerCorrect));
    estimatedIncorrect = Math.max(0, Math.round(estimatedCorrect * 0.16));
    const totalAtt = estimatedCorrect + estimatedIncorrect;
    estimatedAccuracy = totalAtt > 0 ? Math.round((estimatedCorrect / totalAtt) * 1000) / 10 : 85;
  }

  // Cutoff estimate (~67% of total marks is typical qualifying cutoff for Tier 1 UR)
  const estimatedCutoff = Math.round(safeMax * 0.67);
  const cutoffMargin = Math.round((clampedScore - estimatedCutoff) * 10) / 10;
  const isSafe = cutoffMargin >= 0;
  const cutoffComparison = {
    label: isSafe
      ? `Qualifying Safe Zone (+${cutoffMargin} pts over expected cutoff)`
      : `Needs Push (${Math.abs(cutoffMargin)} pts below expected cutoff)`,
    isSafe,
    margin: cutoffMargin,
    estimatedCutoff,
  };

  // Smart Auto-Title
  const platformName = platformId.charAt(0).toUpperCase() + platformId.slice(1);
  const samePlatformAttempts = existingAttempts.filter(
    (a) => a.profileId === examProfileId && a.platform === platformId
  );
  const nextNum = samePlatformAttempts.length + 1;
  const autoTitle = `${platformName} Full Mock #${nextNum}`;

  // Pace Estimation (Assume 60 mins standard for 100 questions = 36 seconds per question)
  const totalQuestions = scheme.defaultQuestions || 100;
  const totalSeconds = (examName.toLowerCase().includes("neet") ? 200 : 60) * 60;
  const estimatedPacePerQSeconds = Math.round(totalSeconds / totalQuestions);

  return {
    percentage,
    estimatedPercentile,
    projectedRankBand,
    rankBandClass,
    targetDelta,
    targetAchieved,
    estimatedCorrect,
    estimatedIncorrect,
    estimatedAccuracy,
    cutoffComparison,
    autoTitle,
    estimatedPacePerQSeconds,
  };
}
