export type PlatformId =
  | "testbook"
  | "oliveboard"
  | "physicswallah"
  | "adda247"
  | "byjus"
  | "unacademy"
  | "nta"
  | "allen"
  | "aakash"
  | "careerlauncher"
  | "coaching"
  | "offline"
  | "pdf"
  | "other"
  | string;

export type TestType =
  | "Full Mock"
  | "Sectional"
  | "Topic/Chapter Test"
  | "Previous Year Paper"
  | "Practice Test"
  | "Coaching Test"
  | "Offline Test"
  | "Other"
  | "Prelims / Tier 1"
  | "Mains / Tier 2"
  | "Topic Test";

export type MockDifficulty = "Easy" | "Moderate" | "Hard" | "Extreme" | "Very Hard";
export type MockConfidence = "Low" | "Medium" | "High" | "Very Confident" | "Confident" | "Average" | "Difficult" | "Very Difficult";

export interface SectionScore {
  name: string; // "Quantitative Aptitude" | "Reasoning Ability" | "English Comprehension" | "General Awareness"
  score: number;
  maxMarks: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  accuracy?: number; // percentage
}

export interface MistakeReviewItem {
  id: string;
  mockId: string;
  mockTitle: string;
  subject: "Quantitative Aptitude" | "Reasoning Ability" | "English Comprehension" | "General Awareness";
  questionSnippet: string;
  errorCategory: "Calculation Error" | "Formula / Concept Flaw" | "Misread Question" | "Time Rush" | "Wild Guess";
  takeawayNote: string;
  isReviewed: boolean;
  reviewedAt?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "review" | "streak" | "accuracy" | "mastery";
  reqCount: number;
  xpReward: number;
}

export interface MockAttempt {
  id: string;
  profileId: string;
  platform: PlatformId;
  title: string;
  testType: TestType;
  score: number;
  maxMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  percentile?: number;
  rank?: number;
  totalCandidates?: number;
  accuracy: number; // percentage
  negativePenalty: number; // marks lost
  date: string; // YYYY-MM-DD
  notes?: string;
  sections?: SectionScore[];
  difficulty?: MockDifficulty;
  confidence?: MockConfidence;
  reasonsLost?: string[]; // e.g. ["Concept gap", "Silly mistake", "Time pressure", "Calculation error"]
  weakAreas?: string[]; // e.g. ["Geometry", "Algebra", "Current Affairs"]
  timeSpentMinutes?: number;
}

export interface ExamProfile {
  id: string;
  name: string; // e.g., "SSC CGL 2026 Tier-1"
  shortCode: string; // e.g., "SSC CGL"
  totalMarks: number;
  defaultDurationMinutes: number;
  examDate?: string; // YYYY-MM-DD
  negativeMarkingRatio: number; // e.g. 0.5 (1/4th penalty of 2 marks) or 0.33
  isSelected: boolean;
}

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  shortLabel: string;
  brandColor: string; // Hex color
  bgClass: string;
  textClass: string;
  badgeClass: string;
  borderClass: string;
  description: string;
}

export interface CandidateProfile {
  name: string;
  avatarSeed: string;
  activeExamProfileId: string;
  theme: "light" | "dark";
  showSplashOnStartup: boolean;
  reviewPoints?: number;
  reviewStreakDays?: number;
  unlockedBadgeIds?: string[];
  language?: "en" | "hi" | "system";
  recentPlatforms?: PlatformId[];
  frequentlyUsedWeakAreas?: string[];
}

export type NavTab = "dashboard" | "history" | "log" | "insights" | "reports" | "profile" | "guide" | "privacy";
