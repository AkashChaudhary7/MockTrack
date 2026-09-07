import { MockAttempt, ExamProfile } from "../types";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "milestone" | "streak" | "accuracy" | "mastery";
  unlocked: boolean;
  progress: number; // 0 to 100
  currentValue: number;
  targetValue: number;
  unit: string;
  unlockedDate?: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
}

/**
 * Calculates continuous day streaks from mock attempt dates
 */
export function calculateStreakFromAttempts(attempts: MockAttempt[]): number {
  if (attempts.length === 0) return 0;

  // Get unique dates sorted descending
  const uniqueDates = Array.from(new Set(attempts.map((a) => a.date.split("T")[0])))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = new Date(uniqueDates[0]);
  mostRecent.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));

  // If latest attempt was older than yesterday (diff > 1), streak broken unless they logged tests on consecutive days before
  let streak = 1;
  let currentDate = mostRecent;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    const dayGap = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayGap === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  // If user hasn't logged today or yesterday, active streak might be 0, but max consecutive days is streak
  return streak;
}

/**
 * Computes all available achievement badges with live progress and unlock status
 */
export function calculateAchievements(
  attempts: MockAttempt[],
  activeExam: ExamProfile
): Achievement[] {
  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);
  const totalAttemptsCount = attempts.length;
  const examAttemptsCount = examAttempts.length;

  const currentStreak = calculateStreakFromAttempts(attempts);
  const targetScore = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.8);

  const highestScore = totalAttemptsCount > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
  const highestAccuracy = totalAttemptsCount > 0 ? Math.max(...attempts.map((a) => a.accuracy)) : 0;

  // Find lowest negative marking on tests with reasonable attempt volume (>10 questions)
  const lowestNegative = totalAttemptsCount > 0
    ? Math.min(...attempts.filter((a) => (a.correctCount + a.incorrectCount) >= 10).map((a) => a.negativePenalty))
    : 999;

  // Check subject all-rounder (all sections >= 70%)
  const hasSubjectAllRounder = attempts.some((att) => {
    if (!att.sections || att.sections.length < 2) return false;
    return att.sections.every((sec) => sec.maxMarks > 0 && (sec.score / sec.maxMarks) >= 0.7);
  });

  // Find unlock dates where applicable
  const firstAttempt = [...attempts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const targetHitAttempt = attempts.find((a) => a.score >= targetScore);
  const highAccuracyAttempt = attempts.find((a) => a.accuracy >= 85);
  const centuryAttempt = attempts.find((a) => a.score >= 100);

  const achievements: Achievement[] = [
    {
      id: "first_mock",
      title: "First Mock Logged",
      description: "Complete and record your first mock test attempt",
      icon: "🎯",
      category: "milestone",
      unlocked: totalAttemptsCount >= 1,
      progress: Math.min(100, Math.round((totalAttemptsCount / 1) * 100)),
      currentValue: Math.min(1, totalAttemptsCount),
      targetValue: 1,
      unit: "mock",
      unlockedDate: firstAttempt?.date,
      tier: "bronze",
    },
    {
      id: "five_day_streak",
      title: "5-Day Streak",
      description: "Log mock tests on 5 consecutive days of dedicated preparation",
      icon: "🔥",
      category: "streak",
      unlocked: currentStreak >= 5,
      progress: Math.min(100, Math.round((currentStreak / 5) * 100)),
      currentValue: currentStreak,
      targetValue: 5,
      unit: "days",
      tier: "gold",
    },
    {
      id: "high_accuracy",
      title: "Sniper Accuracy",
      description: "Attain 85% or higher overall accuracy in any mock test",
      icon: "🏹",
      category: "accuracy",
      unlocked: highestAccuracy >= 85,
      progress: Math.min(100, Math.round((highestAccuracy / 85) * 100)),
      currentValue: highestAccuracy,
      targetValue: 85,
      unit: "%",
      unlockedDate: highAccuracyAttempt?.date,
      tier: "silver",
    },
    {
      id: "target_crusher",
      title: "Target Crusher",
      description: `Surpass your target goal of ${targetScore} marks in ${activeExam.shortCode || activeExam.name}`,
      icon: "🏆",
      category: "mastery",
      unlocked: highestScore >= targetScore && totalAttemptsCount > 0,
      progress: targetScore > 0 ? Math.min(100, Math.round((highestScore / targetScore) * 100)) : 0,
      currentValue: highestScore,
      targetValue: targetScore,
      unit: "marks",
      unlockedDate: targetHitAttempt?.date,
      tier: "diamond",
    },
    {
      id: "ten_mocks",
      title: "Decathlon Master",
      description: "Log 10 mock test attempts to establish a rock-solid exam baseline",
      icon: "⚡",
      category: "milestone",
      unlocked: totalAttemptsCount >= 10,
      progress: Math.min(100, Math.round((totalAttemptsCount / 10) * 100)),
      currentValue: totalAttemptsCount,
      targetValue: 10,
      unit: "mocks",
      tier: "gold",
    },
    {
      id: "zero_negative",
      title: "Zero Waste Hero",
      description: "Complete a mock with ≤ 1.5 marks lost to negative penalties",
      icon: "🛡️",
      category: "accuracy",
      unlocked: lowestNegative <= 1.5,
      progress: lowestNegative <= 1.5 ? 100 : Math.max(0, Math.round((1 - lowestNegative / 10) * 100)),
      currentValue: lowestNegative === 999 ? 0 : lowestNegative,
      targetValue: 1.5,
      unit: "neg marks",
      tier: "silver",
    },
    {
      id: "century_club",
      title: "Century Club",
      description: "Score 100 or more net marks in a single mock test",
      icon: "💯",
      category: "mastery",
      unlocked: highestScore >= 100,
      progress: Math.min(100, Math.round((highestScore / 100) * 100)),
      currentValue: highestScore,
      targetValue: 100,
      unit: "marks",
      unlockedDate: centuryAttempt?.date,
      tier: "silver",
    },
    {
      id: "all_rounder",
      title: "Section All-Rounder",
      description: "Achieve 70%+ score in every section of a subject-wise mock",
      icon: "🌟",
      category: "mastery",
      unlocked: hasSubjectAllRounder,
      progress: hasSubjectAllRounder ? 100 : 40,
      currentValue: hasSubjectAllRounder ? 1 : 0,
      targetValue: 1,
      unit: "mock",
      tier: "gold",
    },
  ];

  return achievements;
}
