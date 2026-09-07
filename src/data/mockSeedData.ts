import { ExamProfile, MockAttempt, CandidateProfile, AchievementBadge, MistakeReviewItem } from "../types";

export const INITIAL_CANDIDATE: CandidateProfile = {
  name: "Aspirant",
  avatarSeed: "AS",
  activeExamProfileId: "ssc-cgl-2026",
  theme: "light",
  showSplashOnStartup: false,
  reviewPoints: 0,
  reviewStreakDays: 0,
  unlockedBadgeIds: [],
};

export const ACHIEVEMENTS_LIST: AchievementBadge[] = [
  {
    id: "mistake-surgeon-1",
    title: "Mistake Surgeon I",
    description: "Review at least 3 incorrect questions across logged mock tests",
    icon: "🩺",
    category: "review",
    reqCount: 3,
    xpReward: 50,
  },
  {
    id: "review-streak-3",
    title: "Streak Warrior",
    description: "Maintain a 3-day active review streak analyzing past errors",
    icon: "🔥",
    category: "streak",
    reqCount: 3,
    xpReward: 50,
  },
  {
    id: "quant-retry-hero",
    title: "Quant Mastermind",
    description: "Analyze 5 calculation & formula errors in Quantitative Aptitude",
    icon: "📐",
    category: "mastery",
    reqCount: 5,
    xpReward: 100,
  },
  {
    id: "error-eradicator",
    title: "Error Eradicator",
    description: "Earn 250 Total Review XP by marking mistake takeaways",
    icon: "🛡️",
    category: "review",
    reqCount: 250,
    xpReward: 150,
  },
  {
    id: "ga-scholar",
    title: "GA & Static GK Scholar",
    description: "Review 5 General Awareness mistakes to eliminate wild guessing",
    icon: "🌐",
    category: "mastery",
    reqCount: 5,
    xpReward: 100,
  },
  {
    id: "flawless-analyzer",
    title: "Grand Analyst",
    description: "Fully review all incorrect questions for 5 logged mock tests",
    icon: "🎯",
    category: "accuracy",
    reqCount: 5,
    xpReward: 200,
  },
];

export const INITIAL_MISTAKES: MistakeReviewItem[] = [];

export const INITIAL_EXAM_PROFILES: ExamProfile[] = [
  {
    id: "ssc-cgl-2026",
    name: "SSC CGL 2026 Tier-1",
    shortCode: "SSC CGL",
    totalMarks: 200,
    targetScore: 160,
    defaultDurationMinutes: 60,
    examDate: "2026-09-17", // 24 days left from Aug 24, 2026
    negativeMarkingRatio: 0.5, // -0.5 per wrong question for 2-mark Qs
    isSelected: true,
  },
  {
    id: "ibps-po-2026",
    name: "IBPS PO 2026 Prelims",
    shortCode: "IBPS PO",
    totalMarks: 100,
    targetScore: 78,
    defaultDurationMinutes: 60,
    examDate: "2026-10-12",
    negativeMarkingRatio: 0.25, // -0.25 per wrong question
    isSelected: false,
  },
  {
    id: "rrb-ntpc-2026",
    name: "RRB NTPC CBT-1",
    shortCode: "RRB NTPC",
    totalMarks: 100,
    targetScore: 82,
    defaultDurationMinutes: 90,
    examDate: undefined,
    negativeMarkingRatio: 0.33, // -0.33 per wrong question
    isSelected: false,
  },
  {
    id: "upsc-cse-2026",
    name: "UPSC CSE Prelims 2026",
    shortCode: "UPSC",
    totalMarks: 200,
    targetScore: 115,
    defaultDurationMinutes: 120,
    examDate: undefined,
    negativeMarkingRatio: 0.66,
    isSelected: false,
  },
];

export const INITIAL_MOCK_ATTEMPTS: MockAttempt[] = [];

