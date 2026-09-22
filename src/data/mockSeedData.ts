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

import { EXAM_CATALOG } from "./examCatalog";

export const INITIAL_MISTAKES: MistakeReviewItem[] = [];

export const INITIAL_EXAM_PROFILES: ExamProfile[] = EXAM_CATALOG;

export const INITIAL_MOCK_ATTEMPTS: MockAttempt[] = [];

