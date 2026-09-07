import { MockAttempt, ExamProfile } from "../types";
import { calculateStreakStats, calculatePracticeTimeStats } from "./habitUtils";

export interface MilestoneEvent {
  id: string;
  type: "personal_best" | "mock_count" | "streak" | "performance" | "time";
  title: string;
  subtitle: string;
  badgeEmoji: string;
  shareableText: string;
  statsHighlight: {
    label: string;
    value: string;
  };
}

/**
 * Check if the newly logged mock triggers a meaningful milestone
 */
export function detectMilestoneOnMockSave(
  existingAttempts: MockAttempt[],
  newAttempt: MockAttempt,
  activeExam: ExamProfile
): MilestoneEvent | null {
  // 1. Check Personal Best on Full Mocks
  const isFullMock =
    newAttempt.testType === "Full Mock" ||
    (!newAttempt.testType && newAttempt.maxMarks === activeExam.totalMarks);

  if (isFullMock) {
    const existingFullMocks = existingAttempts.filter(
      (a) =>
        a.profileId === newAttempt.profileId &&
        (a.testType === "Full Mock" || (!a.testType && a.maxMarks === activeExam.totalMarks))
    );

    if (existingFullMocks.length > 0) {
      const prevMax = Math.max(...existingFullMocks.map((a) => a.score));
      if (newAttempt.score > prevMax) {
        const newPct = Math.round((newAttempt.score / newAttempt.maxMarks) * 100);
        const prevPct = Math.round((prevMax / newAttempt.maxMarks) * 100);
        return {
          id: `pb-${Date.now()}`,
          type: "personal_best",
          title: "New Personal Best! 🎯",
          subtitle: `${newPct}% (Your previous best was ${prevPct}%)`,
          badgeEmoji: "🎯",
          shareableText: `🎯 New Personal Best! Just scored ${newAttempt.score}/${newAttempt.maxMarks} (${newPct}%) in ${activeExam.shortCode || activeExam.name} on MockTrack!`,
          statsHighlight: {
            label: "New Highest Score",
            value: `${newPct}% (${newAttempt.score}/${newAttempt.maxMarks})`,
          },
        };
      }
    }
  }

  // 2. Mock Count Milestones (1, 10, 25, 50, 100, 250, 500)
  const totalCountAfter = existingAttempts.length + 1;
  const countMilestones = [500, 250, 100, 50, 25, 10, 1];
  for (const m of countMilestones) {
    if (totalCountAfter === m) {
      return {
        id: `mock-count-${m}-${Date.now()}`,
        type: "mock_count",
        title: m === 1 ? "First Mock Logged! 🚀" : `${m} Mocks Completed! 🏆`,
        subtitle: m === 1 ? "Your preparation journey has officially begun." : `Incredible dedication! You've logged ${m} mock tests.`,
        badgeEmoji: m === 1 ? "🚀" : "🏆",
        shareableText: `🏆 Just hit the ${m} Mocks milestone in my preparation for ${activeExam.shortCode || activeExam.name} with MockTrack!`,
        statsHighlight: {
          label: "Total Mocks",
          value: `${m} Completed`,
        },
      };
    }
  }

  // 3. Streak Milestones (3, 7, 14, 30, 60, 100 Days)
  const simulatedAttempts = [newAttempt, ...existingAttempts];
  const { currentStreak } = calculateStreakStats(simulatedAttempts);
  const streakMilestones = [100, 60, 30, 14, 7, 3];
  if (streakMilestones.includes(currentStreak)) {
    // Make sure previous streak didn't already equal this
    const prevStreak = calculateStreakStats(existingAttempts).currentStreak;
    if (currentStreak > prevStreak) {
      return {
        id: `streak-${currentStreak}-${Date.now()}`,
        type: "streak",
        title: `${currentStreak} Day Streak! 🔥`,
        subtitle: "Unstoppable consistency. Keep this daily momentum going!",
        badgeEmoji: "🔥",
        shareableText: `🔥 ${currentStreak} Day Streak on MockTrack! Consistent daily practice for ${activeExam.shortCode || activeExam.name}.`,
        statsHighlight: {
          label: "Daily Streak",
          value: `${currentStreak} Consecutive Days`,
        },
      };
    }
  }

  // 4. Performance Milestones: 80%+, 90%+, 95%+
  const newScorePct = Math.round((newAttempt.score / newAttempt.maxMarks) * 100);
  const prevPcts = existingAttempts.map((a) =>
    a.maxMarks > 0 ? Math.round((a.score / a.maxMarks) * 100) : 0
  );
  const maxPrevPct = prevPcts.length > 0 ? Math.max(...prevPcts) : 0;

  if (newScorePct >= 95 && maxPrevPct < 95) {
    return {
      id: `perf-95-${Date.now()}`,
      type: "performance",
      title: "95%+ Elite Score! 🌟",
      subtitle: `Stupendous accuracy and mastery achieved (${newScorePct}%).`,
      badgeEmoji: "🌟",
      shareableText: `🌟 Elite tier performance! Scored ${newScorePct}% in ${activeExam.shortCode || activeExam.name} on MockTrack.`,
      statsHighlight: {
        label: "Score Mastery",
        value: `${newScorePct}%`,
      },
    };
  } else if (newScorePct >= 90 && maxPrevPct < 90) {
    return {
      id: `perf-90-${Date.now()}`,
      type: "performance",
      title: "90%+ Master Score! ⚡",
      subtitle: `Top percentile mark reached (${newScorePct}%).`,
      badgeEmoji: "⚡",
      shareableText: `⚡ Reached 90%+ in ${activeExam.shortCode || activeExam.name} on MockTrack!`,
      statsHighlight: {
        label: "Score Mastery",
        value: `${newScorePct}%`,
      },
    };
  } else if (newScorePct >= 80 && maxPrevPct < 80) {
    return {
      id: `perf-80-${Date.now()}`,
      type: "performance",
      title: "80%+ Distinction! ✨",
      subtitle: `Outstanding benchmark achieved (${newScorePct}%).`,
      badgeEmoji: "✨",
      shareableText: `✨ Crossed 80%+ benchmark in ${activeExam.shortCode || activeExam.name} with MockTrack!`,
      statsHighlight: {
        label: "Score Mastery",
        value: `${newScorePct}%`,
      },
    };
  }

  // 5. Time Milestones (10h, 25h, 50h, 100h)
  const prevTime = calculatePracticeTimeStats(existingAttempts).allTimeMinutes;
  const newTotalTime = calculatePracticeTimeStats(simulatedAttempts).allTimeMinutes;
  const timeThresholds = [
    { hours: 100, mins: 6000 },
    { hours: 50, mins: 3000 },
    { hours: 25, mins: 1500 },
    { hours: 10, mins: 600 },
  ];
  for (const t of timeThresholds) {
    if (newTotalTime >= t.mins && prevTime < t.mins) {
      return {
        id: `time-${t.hours}-${Date.now()}`,
        type: "time",
        title: `${t.hours} Hours Practice Time! ⏱️`,
        subtitle: `Over ${t.hours} hours of dedicated exam preparation logged.`,
        badgeEmoji: "⏱️",
        shareableText: `⏱️ Dedicated ${t.hours}+ hours of mock test practice for ${activeExam.shortCode || activeExam.name} on MockTrack!`,
        statsHighlight: {
          label: "Practice Time",
          value: `${t.hours} Hours Dedicated`,
        },
      };
    }
  }

  return null;
}
