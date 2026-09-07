import { MockAttempt, ExamProfile } from "../types";

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  isStreakActiveToday: boolean;
  weeklyCompletionCount: number;
  monthlyCompletionCount: number;
  uniqueDaysCount: number;
}

export interface PracticeTimeStats {
  todayMinutes: number;
  thisWeekMinutes: number;
  thisMonthMinutes: number;
  allTimeMinutes: number;
}

export interface TodayMockStatus {
  hasLoggedToday: boolean;
  todayMocksCount: number;
  latestTodayMock?: MockAttempt;
  todayScoreDisplay?: string; // e.g. "78%" or "156 / 200"
}

/**
 * Format minutes into clean human-readable duration e.g. "83h 24m" or "45m"
 */
export function formatPracticeTime(minutes: number): string {
  if (!minutes || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

/**
 * Helper to get local YYYY-MM-DD string
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get start of current week (Monday at 00:00:00)
 */
export function getStartOfWeek(refDate: Date = new Date()): Date {
  const d = new Date(refDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculate streak and consecutive day performance
 */
export function calculateStreakStats(attempts: MockAttempt[]): StreakStats {
  if (!attempts || attempts.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isStreakActiveToday: false,
      weeklyCompletionCount: 0,
      monthlyCompletionCount: 0,
      uniqueDaysCount: 0,
    };
  }

  // Extract unique sorted dates (ascending: oldest to newest)
  const dateSet = new Set<string>();
  attempts.forEach((a) => {
    if (a.date) {
      dateSet.add(a.date.split("T")[0]);
    }
  });

  const uniqueDatesAsc = Array.from(dateSet).sort();
  if (uniqueDatesAsc.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isStreakActiveToday: false,
      weeklyCompletionCount: 0,
      monthlyCompletionCount: 0,
      uniqueDaysCount: 0,
    };
  }

  // Compute longest streak across all history
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDatesAsc.length; i++) {
    const prev = new Date(uniqueDatesAsc[i - 1] + "T00:00:00");
    const curr = new Date(uniqueDatesAsc[i] + "T00:00:00");
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Determine current streak
  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const hasLoggedToday = dateSet.has(todayStr);
  const hasLoggedYesterday = dateSet.has(yesterdayStr);

  let currentStreak = 0;
  if (hasLoggedToday || hasLoggedYesterday) {
    // Traverse backwards from the latest consecutive block
    const uniqueDatesDesc = [...uniqueDatesAsc].reverse();
    currentStreak = 1;
    let currDate = new Date((hasLoggedToday ? todayStr : yesterdayStr) + "T00:00:00");

    for (const dStr of uniqueDatesDesc) {
      if (dStr === getLocalDateString(currDate)) {
        continue;
      }
      const prevDate = new Date(dStr + "T00:00:00");
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
        currDate = prevDate;
      } else {
        break;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // Weekly completion: mocks logged between Monday 00:00 of this week and now
  const startOfWeek = getStartOfWeek();
  const startOfWeekStr = getLocalDateString(startOfWeek);
  const weeklyMocks = attempts.filter((a) => {
    const dStr = a.date ? a.date.split("T")[0] : "";
    return dStr >= startOfWeekStr && dStr <= todayStr;
  });

  // Monthly completion: mocks logged in current calendar month
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyMocks = attempts.filter((a) => {
    const dStr = a.date ? a.date.split("T")[0] : "";
    return dStr.startsWith(currentMonthPrefix);
  });

  return {
    currentStreak,
    longestStreak,
    isStreakActiveToday: hasLoggedToday,
    weeklyCompletionCount: weeklyMocks.length,
    monthlyCompletionCount: monthlyMocks.length,
    uniqueDaysCount: dateSet.size,
  };
}

/**
 * Calculate actual practice time from recorded mock attempt durations
 */
export function calculatePracticeTimeStats(
  attempts: MockAttempt[],
  defaultDurationMinutes = 60
): PracticeTimeStats {
  const todayStr = getLocalDateString(new Date());
  const startOfWeekStr = getLocalDateString(getStartOfWeek());
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let todayMinutes = 0;
  let thisWeekMinutes = 0;
  let thisMonthMinutes = 0;
  let allTimeMinutes = 0;

  for (const att of attempts) {
    const duration = att.timeSpentMinutes && att.timeSpentMinutes > 0
      ? att.timeSpentMinutes
      : (defaultDurationMinutes || 60);

    const dStr = att.date ? att.date.split("T")[0] : "";

    allTimeMinutes += duration;

    if (dStr === todayStr) {
      todayMinutes += duration;
    }
    if (dStr >= startOfWeekStr && dStr <= todayStr) {
      thisWeekMinutes += duration;
    }
    if (dStr.startsWith(currentMonthPrefix)) {
      thisMonthMinutes += duration;
    }
  }

  return {
    todayMinutes,
    thisWeekMinutes,
    thisMonthMinutes,
    allTimeMinutes,
  };
}

/**
 * Today's Mock Status Check
 */
export function getTodayMockStatus(
  attempts: MockAttempt[],
  activeExam?: ExamProfile
): TodayMockStatus {
  const todayStr = getLocalDateString(new Date());
  const todayAttempts = attempts.filter((a) => {
    const dStr = a.date ? a.date.split("T")[0] : "";
    return dStr === todayStr;
  });

  if (todayAttempts.length === 0) {
    return {
      hasLoggedToday: false,
      todayMocksCount: 0,
    };
  }

  // If activeExam is specified, prefer today's mock for activeExam
  const relevantAttempt =
    (activeExam && todayAttempts.find((a) => a.profileId === activeExam.id)) ||
    todayAttempts[0];

  const scorePct = relevantAttempt.maxMarks > 0
    ? Math.round((relevantAttempt.score / relevantAttempt.maxMarks) * 100)
    : 0;

  return {
    hasLoggedToday: true,
    todayMocksCount: todayAttempts.length,
    latestTodayMock: relevantAttempt,
    todayScoreDisplay: `${scorePct}% (${relevantAttempt.score}/${relevantAttempt.maxMarks})`,
  };
}

/**
 * Visual text progress bar helper: ████████░░ 6 / 7
 */
export function renderAsciiProgressBar(completed: number, target: number, totalBlocks = 10): string {
  const safeTarget = Math.max(1, target);
  const ratio = Math.min(1, Math.max(0, completed / safeTarget));
  const filledBlocks = Math.round(ratio * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  return "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
}
