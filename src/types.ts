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
  name: string;
  score: number;
  maxMarks: number;
  part?: string; // e.g. "Part A" | "Part B"
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

export interface SubjectGoal {
  id: string;
  subjectName: string;
  targetScore: number;
  maxMarks: number;
  deadline?: string;
}

export interface MockAttempt {
  id: string;
  profileId: string;
  platform: PlatformId;
  customPlatformName?: string;
  title: string;
  testType: TestType;
  customTestType?: string;
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

export type ExamCategory =
  | "UPSC"
  | "SSC"
  | "BANK"
  | "DSSSB"
  | "RPSC"
  | "RSSB"
  | "UPPCS"
  | "UPSSSC"
  | "STATE"
  | "TEACHING"
  | "DEFENCE"
  | "RAILWAYS"
  | "ENGINEERING"
  | "MEDICAL"
  | "CUSTOM"
  | "OTHER";

export interface ExamSubjectConfig {
  id: string;
  name: string;
  maxMarks: number;
  part?: string; // e.g. "Part A" | "Part B" | "Section 1"
  questionCount?: number;
  marksPerQuestion?: number;
  negativeMarks?: number;
}

export interface ExamPartConfig {
  id: string;
  name: string; // e.g. "Part A (General Section)" | "Part B (Discipline Specific)"
  totalMarks: number;
}

export interface ExamProfile {
  id: string;
  name: string; // e.g., "SSC CGL 2026 Tier-1"
  shortCode: string; // e.g., "SSC CGL"
  category?: ExamCategory;
  icon?: string; // e.g. "🦅", "🏦", "🏛️", "💻", "📜", "🎓", "🏰"
  totalMarks: number;
  targetScore?: number; // Target goal score e.g. 160 / 200
  defaultDurationMinutes: number;
  examDate?: string; // YYYY-MM-DD
  negativeMarkingRatio: number; // e.g. 0.5 (1/4th penalty of 2 marks) or 0.33
  isSelected: boolean;
  subjectGoals?: SubjectGoal[];
  syllabusProgress?: number; // e.g. 68%
  isCustom?: boolean;
  hasParts?: boolean;
  parts?: ExamPartConfig[];
  subjects?: ExamSubjectConfig[];
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

export type ThemeMode = "light" | "dark" | "system";

export interface CandidateProfile {
  name: string;
  avatarSeed: string;
  activeExamProfileId: string;
  theme: ThemeMode;
  showSplashOnStartup: boolean;
  reviewPoints?: number;
  reviewStreakDays?: number;
  unlockedBadgeIds?: string[];
  language?: "en" | "hi" | "system";
  recentPlatforms?: PlatformId[];
  frequentlyUsedWeakAreas?: string[];
  weeklyGoal?: number; // target mocks per week, default 7 (1/day)
  photoUrl?: string; // Optional user uploaded photo/avatar
  gender?: "male" | "female"; // Male or Female aspirant iconography
}

export type ScoreCardTheme = "obsidian" | "indigo" | "emerald" | "minimal";

export interface ScoreCardConfig {
  theme: ScoreCardTheme;
  avatarType: "initials" | "photo" | "emoji";
  avatarEmoji?: string;
  photoUrl?: string;
  scope: "current_exam" | "all_exams";
  showStreak: boolean;
  showPracticeTime: boolean;
  showLongestStreak: boolean;
  showWeeklyMocks: boolean;
  showAccuracy: boolean;
}

export type NavTab =
  | "dashboard"
  | "history"
  | "log"
  | "insights"
  | "reports"
  | "profile"
  | "guide"
  | "privacy"
  | "calendar"
  | "settings";
