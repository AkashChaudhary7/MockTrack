import React, { useState, useEffect, useMemo } from "react";
import {
  PlatformId,
  TestType,
  MockAttempt,
  ExamProfile,
  MockDifficulty,
  MockConfidence,
  SectionScore,
} from "../types";
import { PLATFORMS } from "../data/platforms";
import { motion } from "motion/react";
import {
  X,
  ArrowLeft,
  Check,
  Upload,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Wand2,
  Calculator,
  Copy,
  FileCode,
  Code,
  HelpCircle,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { AppLogo } from "./AppLogo";
import { PlatformLogo } from "./PlatformLogo";
import { HapticService } from "../services/HapticService";
import {
  calculateScoreFromQuestions,
  calculateAccuracy,
  calculatePercentileFromRank,
  autoGenerateTitle,
  detectDefaultMarkingScheme,
  inferMockMetadataFromScore,
} from "../utils/mockCalculator";

interface SubjectRowState {
  id: string;
  name: string;
  score: string;
  maxMarks: string;
  isWeak?: boolean;
  correctCount?: string;
  incorrectCount?: string;
  timeSpent?: string;
  isExpanded?: boolean;
}

interface LogMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onSaveMock: (attempt: Omit<MockAttempt, "id">) => void;
  initialData?: Partial<MockAttempt>;
  onOpenOcrModal?: (tab: "image" | "link") => void;
  frequentlyUsedWeakAreas?: string[];
  onSaveWeakAreasHistory?: (areas: string[]) => void;
}

export interface SubjectPatternSuggestion {
  name: string;
  aliases: string[];
  examCategory?: string[];
  defaultMarks?: number;
}

export const COMMON_EXAM_SUBJECT_PATTERNS: SubjectPatternSuggestion[] = [
  // Quant / Maths
  {
    name: "Quantitative Aptitude",
    aliases: ["quant", "math", "maths", "mathematics", "numerical", "arithmetic", "advance math", "qa", "quants"],
    examCategory: ["SSC", "Banking", "Railways", "UPSC", "State PSC"],
  },
  {
    name: "Mathematics",
    aliases: ["math", "maths", "calculus", "algebra", "trigonometry", "coordinate", "jee maths"],
    examCategory: ["JEE Main", "JEE Advanced", "NDA", "CDS", "Defence"],
  },
  {
    name: "Data Interpretation & Analysis",
    aliases: ["di", "data interpretation", "d.i.", "charts", "graphs", "analytical di"],
    examCategory: ["Banking", "CAT", "SBI PO", "IBPS PO"],
  },

  // Reasoning
  {
    name: "Reasoning Ability",
    aliases: ["reasoning", "logical", "lr", "reason", "mental ability", "puzzles", "seating"],
    examCategory: ["Banking", "SSC", "Railways", "Insurance"],
  },
  {
    name: "General Intelligence & Reasoning",
    aliases: ["gi", "intelligence", "non verbal", "analogy", "series", "general intelligence"],
    examCategory: ["SSC CGL", "SSC CHSL", "RRB NTPC"],
  },
  {
    name: "Logical Reasoning & Analytical Ability",
    aliases: ["logical reasoning", "critical reasoning", "analytical", "csat reasoning"],
    examCategory: ["UPSC", "State PSC", "CAT"],
  },

  // English
  {
    name: "English Comprehension",
    aliases: ["english", "eng", "comprehension", "reading comp", "rc", "vocab", "grammar"],
    examCategory: ["SSC", "Railways", "Defence"],
  },
  {
    name: "English Language",
    aliases: ["english", "eng", "verbal", "verbal ability", "va", "cloze test", "error detection"],
    examCategory: ["Banking", "IBPS", "SBI"],
  },

  // General Awareness / GK
  {
    name: "General Awareness & Current Affairs",
    aliases: ["ga", "gk", "general knowledge", "current affairs", "ca", "general awareness", "static gk"],
    examCategory: ["SSC", "Banking", "Railways", "Defence"],
  },
  {
    name: "General Studies (GS)",
    aliases: ["gs", "general studies", "history", "polity", "geography", "economy", "gk"],
    examCategory: ["UPSC", "State PSC", "SSC CGL Tier 2", "CDS", "NDA"],
  },
  {
    name: "Banking & Financial Awareness",
    aliases: ["banking awareness", "financial awareness", "economy", "rbi", "monetary policy", "fin"],
    examCategory: ["Banking", "SBI", "IBPS", "RBI"],
  },

  // Science / Medical / Engineering
  {
    name: "Physics",
    aliases: ["phy", "physics", "mechanics", "optics", "thermodynamics", "electromagnetism"],
    examCategory: ["NEET UG", "JEE Main", "NDA", "Science"],
  },
  {
    name: "Chemistry",
    aliases: ["chem", "chemistry", "organic", "inorganic", "physical chem"],
    examCategory: ["NEET UG", "JEE Main", "NDA", "Science"],
  },
  {
    name: "Biology (Botany & Zoology)",
    aliases: ["bio", "biology", "botany", "zoology", "genetics", "human physiology"],
    examCategory: ["NEET UG", "Medical", "Nursing"],
  },

  // Teaching / Education
  {
    name: "Child Development & Pedagogy (CDP)",
    aliases: ["cdp", "pedagogy", "child development", "psychology", "teaching aptitude"],
    examCategory: ["CTET", "DSSSB", "KVS", "State TET"],
  },
  {
    name: "Teaching Aptitude & Methodology",
    aliases: ["teaching", "teaching methodology", "education", "classroom"],
    examCategory: ["UGC NET", "B.Ed", "DSSSB"],
  },

  // Computer / IT
  {
    name: "Computer Knowledge & Aptitude",
    aliases: ["computer", "it", "cs", "computer awareness", "ms office", "networking"],
    examCategory: ["SSC CGL", "Banking", "RRB", "State Exams"],
  },

  // Hindi / Regional
  {
    name: "Hindi Language & Grammar",
    aliases: ["hindi", "samanya hindi", "varnamala", "sandhi", "samast"],
    examCategory: ["UP Police", "State PSC", "DSSSB", "CTET", "SSC GD"],
  },
];

/**
 * Suggests matching subject names based on user input and optional exam pattern
 */
export function suggestSubjectNames(input: string, examName?: string): string[] {
  if (!input || !input.trim()) {
    if (examName) {
      const examLower = examName.toLowerCase();
      const examMatches = COMMON_EXAM_SUBJECT_PATTERNS.filter((p) =>
        p.examCategory?.some((cat) => examLower.includes(cat.toLowerCase()))
      ).map((p) => p.name);
      if (examMatches.length > 0) return examMatches.slice(0, 5);
    }
    return [
      "Quantitative Aptitude",
      "Reasoning Ability",
      "English Comprehension",
      "General Awareness & Current Affairs",
      "Computer Knowledge & Aptitude",
    ];
  }

  const query = input.trim().toLowerCase();

  const scored = COMMON_EXAM_SUBJECT_PATTERNS.map((item) => {
    const nameLower = item.name.toLowerCase();
    let score = 0;

    if (nameLower === query) score += 100;
    else if (nameLower.startsWith(query)) score += 50;
    else if (nameLower.includes(query)) score += 30;

    for (const alias of item.aliases) {
      const aliasLower = alias.toLowerCase();
      if (aliasLower === query) {
        score += 60;
        break;
      } else if (aliasLower.startsWith(query)) {
        score += 40;
        break;
      } else if (aliasLower.includes(query)) {
        score += 20;
        break;
      }
    }

    if (examName && item.examCategory?.some((c) => examName.toLowerCase().includes(c.toLowerCase()))) {
      score += 15;
    }

    return { name: item.name, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const uniqueNames = Array.from(new Set(scored.map((s) => s.name)));
  return uniqueNames.slice(0, 5);
}

const getDefaultSubjectsForExam = (exam: ExamProfile): SubjectRowState[] => {
  const code = (exam.shortCode || exam.name || "").toLowerCase();
  if (code.includes("ssc") || code.includes("cgl") || code.includes("chsl")) {
    return [
      { id: "1", name: "Quantitative Aptitude", score: "", maxMarks: "50" },
      { id: "2", name: "Reasoning Ability", score: "", maxMarks: "50" },
      { id: "3", name: "English Comprehension", score: "", maxMarks: "50" },
      { id: "4", name: "General Awareness", score: "", maxMarks: "50" },
    ];
  } else if (code.includes("neet") || code.includes("medical")) {
    return [
      { id: "1", name: "Physics", score: "", maxMarks: "180" },
      { id: "2", name: "Chemistry", score: "", maxMarks: "180" },
      { id: "3", name: "Biology (Botany & Zoology)", score: "", maxMarks: "360" },
    ];
  } else if (code.includes("jee")) {
    return [
      { id: "1", name: "Mathematics", score: "", maxMarks: "100" },
      { id: "2", name: "Physics", score: "", maxMarks: "100" },
      { id: "3", name: "Chemistry", score: "", maxMarks: "100" },
    ];
  } else if (code.includes("bank") || code.includes("ibps") || code.includes("sbi")) {
    return [
      { id: "1", name: "Quantitative Aptitude", score: "", maxMarks: "35" },
      { id: "2", name: "Reasoning Ability", score: "", maxMarks: "35" },
      { id: "3", name: "English Language", score: "", maxMarks: "30" },
    ];
  } else {
    const defaultMax = String(Math.round(exam.totalMarks / 4) || 50);
    return [
      { id: "1", name: "Quantitative Aptitude", score: "", maxMarks: defaultMax },
      { id: "2", name: "Reasoning Ability", score: "", maxMarks: defaultMax },
      { id: "3", name: "English Comprehension", score: "", maxMarks: defaultMax },
      { id: "4", name: "General Awareness", score: "", maxMarks: defaultMax },
    ];
  }
};

const COMMON_REASONS = [
  "Silly Errors",
  "Time Pressure",
  "Concept Gap",
  "Calculation Mistake",
  "Unread Question Properly",
];

const COMMON_WEAK_AREAS = [
  "Geometry & Mensuration",
  "Algebra",
  "Reading Comprehension",
  "Current Affairs",
  "Data Interpretation",
  "Grammar & Usage",
];

const POPULAR_EXAMS_LIST = [
  "SSC CGL",
  "Banking / IBPS PO",
  "JEE Main",
  "NEET UG",
  "State PSC",
  "RRB NTPC",
];

// Helper for haptics
const triggerHaptic = (pattern: number | number[] = 10) => {
  try {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore haptic errors if unsupported
  }
};

export const LogMockModal: React.FC<LogMockModalProps> = ({
  isOpen,
  onClose,
  activeExam,
  attempts,
  onSaveMock,
  initialData,
}) => {
  useTranslation();

  // Primary Logging Method: "manual" | "scan" | "link" | "offline"
  const [entryMethod, setEntryMethod] = useState<"manual" | "scan" | "link" | "offline">("manual");
  
  // Tracking Mode: "full" | "subject"
  const [testFormat, setTestFormat] = useState<"full" | "subject">("full");

  // Defaults & Memory from localStorage
  const lastPlatform = (localStorage.getItem("mocktrack_last_platform") as PlatformId) || "testbook";
  const lastTotalMarks = Number(localStorage.getItem("mocktrack_last_total_marks")) || activeExam.totalMarks;
  const lastFormat = (localStorage.getItem("mocktrack_last_format") as "full" | "subject") || "full";

  // Core Essential Fields
  const [selectedExamName, setSelectedExamName] = useState<string>(activeExam.name);
  const [platform, setPlatform] = useState<PlatformId>(initialData?.platform || lastPlatform);
  const [scoreInput, setScoreInput] = useState<string>(initialData?.score !== undefined ? String(initialData.score) : "");
  const [maxMarks, setMaxMarks] = useState<number>(initialData?.maxMarks || lastTotalMarks);

  // Score Input Mode: "marks" (direct score) or "questions" (enter correct & wrong qs)
  const [scoreEntryMode, setScoreEntryMode] = useState<"marks" | "questions">("marks");

  // Advance Tier Link Parsing Sub-Tab: "url" | "paste_html" | "bookmarklet"
  const [linkSubTab, setLinkSubTab] = useState<"url" | "paste_html" | "bookmarklet">("url");
  const [pastedHtmlText, setPastedHtmlText] = useState<string>("");
  const [bookmarkletCopied, setBookmarkletCopied] = useState<boolean>(false);

  // Progressive Disclosure State (Hides optional details behind '+ Add Details')
  const [showAddDetails, setShowAddDetails] = useState<boolean>(false);

  // Optional Advanced Fields (Initially hidden behind showAddDetails)
  const [customPlatformName, setCustomPlatformName] = useState<string>("");
  const [offlineTestName, setOfflineTestName] = useState<string>("");
  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [testType] = useState<TestType>(initialData?.testType || "Full Mock");
  const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString().split("T")[0]);
  const [correctCount, setCorrectCount] = useState<string>(initialData?.correctCount !== undefined ? String(initialData.correctCount) : "");
  const [incorrectCount, setIncorrectCount] = useState<string>(initialData?.incorrectCount !== undefined ? String(initialData.incorrectCount) : "");
  const [percentile, setPercentile] = useState<string>(initialData?.percentile !== undefined ? String(initialData.percentile) : "");
  const [rank, setRank] = useState<string>(initialData?.rank !== undefined ? String(initialData.rank) : "");
  const [totalCandidates] = useState<string>(initialData?.totalCandidates !== undefined ? String(initialData.totalCandidates) : "");
  const [timeSpent] = useState<string>(initialData?.timeSpentMinutes !== undefined ? String(initialData.timeSpentMinutes) : "");
  const [difficulty] = useState<MockDifficulty | undefined>(initialData?.difficulty);
  const [confidence] = useState<MockConfidence | undefined>(initialData?.confidence);
  const [selectedReasons, setSelectedReasons] = useState<string[]>(initialData?.reasonsLost || []);
  const [selectedWeakAreas, setSelectedWeakAreas] = useState<string[]>(initialData?.weakAreas || []);
  const [quickNote, setQuickNote] = useState<string>(initialData?.notes || "");
  const [newWeakAreaInput, setNewWeakAreaInput] = useState<string>("");

  // Exam Picker Dropdown state
  const [showExamPicker, setShowExamPicker] = useState<boolean>(false);

  // Subject-wise Rows State
  const [subjectRows, setSubjectRows] = useState<SubjectRowState[]>(getDefaultSubjectsForExam(activeExam));
  const [focusedSubjectRowId, setFocusedSubjectRowId] = useState<string | null>(null);

  // Scan & Link States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [webUrl, setWebUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedSuccessData, setExtractedSuccessData] = useState<{
    detectedPlatform: PlatformId;
    detectedExam: string;
    score: number;
    maxMarks: number;
    pct: number;
    requiresAuthScore?: boolean;
    title?: string;
  } | null>(null);

  // Post-save state
  const [isPostSaved, setIsPostSaved] = useState<boolean>(false);
  const [lastSavedScore, setLastSavedScore] = useState<{ score: number; total: number; diff: number } | null>(null);

  // Draft Autosave & Duplicate state
  const [draftExists, setDraftExists] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<MockAttempt | null>(null);

  // Initialize or check draft on modal open
  useEffect(() => {
    if (isOpen) {
      setDuplicateWarning(null);
      setIsPostSaved(false);
      setExtractedSuccessData(null);
      setSelectedExamName(activeExam.name);

      const savedDraft = localStorage.getItem("mocktrack_draft_log");
      if (savedDraft && !initialData) {
        setDraftExists(true);
      } else {
        setDraftExists(false);
      }

      if (initialData) {
        if (initialData.platform) setPlatform(initialData.platform);
        if (initialData.title) setTitle(initialData.title);
        if (initialData.score !== undefined) setScoreInput(String(initialData.score));
        if (initialData.maxMarks) setMaxMarks(initialData.maxMarks);
        if (initialData.date) setDate(initialData.date);
        if (initialData.sections && initialData.sections.length > 0) {
          const rows = initialData.sections.map((sec, idx) => ({
            id: String(idx + 1),
            name: sec.name,
            score: String(sec.score),
            maxMarks: String(sec.maxMarks),
          }));
          setSubjectRows(rows);
          setTestFormat("subject");
        }
        setEntryMethod("manual");
        setShowAddDetails(false);
      } else {
        const freshPlatform = (localStorage.getItem("mocktrack_last_platform") as PlatformId) || "testbook";
        const freshTotalMarks = Number(localStorage.getItem("mocktrack_last_total_marks")) || activeExam.totalMarks;
        setPlatform(freshPlatform);
        setMaxMarks(freshTotalMarks);
        setTestFormat(lastFormat);
        setScoreInput("");
        setTitle("");
        setDate(new Date().toISOString().split("T")[0]);
        setSubjectRows(getDefaultSubjectsForExam(activeExam));
        setEntryMethod("manual");
        setShowAddDetails(false);
      }
    }
  }, [isOpen, initialData, activeExam]);

  // SMART SCORE PARSER: "157", "157/200", "157 / 200", "157.5/200"
  const handleScoreInputChange = (val: string) => {
    setScoreInput(val);
    if (val.includes("/")) {
      const parts = val.split("/");
      const parsedT = parts[1]?.trim();
      if (parsedT && !isNaN(Number(parsedT))) {
        setMaxMarks(Number(parsedT));
      }
    }
  };

  const getParsedScoreAndTotal = () => {
    let rawScoreStr = scoreInput.trim();
    let currentTotal = maxMarks;
    if (rawScoreStr.includes("/")) {
      const parts = rawScoreStr.split("/");
      rawScoreStr = parts[0].trim();
      if (parts[1]?.trim() && !isNaN(Number(parts[1].trim()))) {
        currentTotal = Number(parts[1].trim());
      }
    }
    const scoreNum = parseFloat(rawScoreStr) || 0;
    return { score: scoreNum, total: currentTotal };
  };

  // Auto-Sum Subject Scores in Subject-wise mode
  const calculateSubjectTotals = () => {
    let totalScore = 0;
    let totalMax = 0;
    let validCount = 0;

    subjectRows.forEach((r) => {
      const s = parseFloat(r.score);
      const m = parseFloat(r.maxMarks);
      if (!isNaN(s)) {
        totalScore += s;
        validCount++;
      }
      if (!isNaN(m)) {
        totalMax += m;
      }
    });

    const pct = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : "0";
    return { totalScore, totalMax, pct, validCount };
  };

  // Draft Handling
  const handleRestoreDraft = () => {
    try {
      const draftStr = localStorage.getItem("mocktrack_draft_log");
      if (draftStr) {
        const d = JSON.parse(draftStr);
        if (d.platform) setPlatform(d.platform);
        if (d.scoreInput) setScoreInput(d.scoreInput);
        if (d.maxMarks) setMaxMarks(d.maxMarks);
        if (d.title) setTitle(d.title);
        if (d.date) setDate(d.date);
        if (d.testFormat) setTestFormat(d.testFormat);
        if (d.entryMethod) setEntryMethod(d.entryMethod);
        if (d.subjectRows) setSubjectRows(d.subjectRows);
      }
    } catch {
      // Ignore
    }
    setDraftExists(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("mocktrack_draft_log");
    setDraftExists(false);
  };

  const handleCloseModal = () => {
    if (scoreInput || title || subjectRows.some((r) => r.score)) {
      const draftObj = {
        platform,
        scoreInput,
        maxMarks,
        title,
        date,
        testFormat,
        entryMethod,
        subjectRows,
      };
      localStorage.setItem("mocktrack_draft_log", JSON.stringify(draftObj));
    }
    onClose();
  };

  // Subject Row updates
  const updateSubjectRow = (id: string, field: keyof SubjectRowState, value: any) => {
    setSubjectRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addCustomSubject = () => {
    triggerHaptic(10);
    const newId = String(Date.now());
    setSubjectRows((prev) => [
      ...prev,
      { id: newId, name: `Subject ${prev.length + 1}`, score: "", maxMarks: "50" },
    ]);
  };

  const removeSubjectRow = (id: string) => {
    triggerHaptic(10);
    if (subjectRows.length <= 1) return;
    setSubjectRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Quick save handler
  const handleQuickSave = (e?: React.FormEvent, skipDupCheck = false) => {
    if (e) e.preventDefault();
    triggerHaptic([20, 40, 20]);

    const { score: parsedScore, total: parsedTotal } = getParsedScoreAndTotal();

    if (!skipDupCheck) {
      const dup = attempts.find(
        (a) =>
          a.profileId === activeExam.id &&
          a.platform === platform &&
          a.date === date &&
          Math.abs(a.score - parsedScore) < 0.1
      );
      if (dup) {
        setDuplicateWarning(dup);
        return;
      }
    }

    setDuplicateWarning(null);

    const isSubjectWise = testFormat === "subject";
    const finalTestType: TestType = isSubjectWise ? "Sectional" : testType;

    let finalTitle = title.trim();
    if (!finalTitle) {
      if (entryMethod === "offline") {
        finalTitle = offlineTestName.trim() || `${selectedExamName} Offline Coaching Test`;
      } else if (isSubjectWise) {
        finalTitle = `${selectedExamName} Sectional Test`;
      } else {
        const dObj = new Date(date + "T00:00:00");
        const day = dObj.getDate();
        const monthStr = dObj.toLocaleDateString("en-US", { month: "short" });
        const sameDayCount = attempts.filter((a) => a.profileId === activeExam.id && a.date === date).length + 1;
        finalTitle = `${selectedExamName} Full Mock — ${day} ${monthStr}${sameDayCount > 1 ? ` #${sameDayCount}` : ""}`;
      }
    }

    localStorage.setItem("mocktrack_last_platform", platform);
    localStorage.setItem("mocktrack_last_total_marks", String(parsedTotal));
    localStorage.setItem("mocktrack_last_format", testFormat);
    localStorage.removeItem("mocktrack_draft_log");

    let constructedSections: SectionScore[] = [];
    if (isSubjectWise || subjectRows.some((r) => r.score !== "")) {
      constructedSections = subjectRows
        .filter((r) => r.name.trim() !== "" && r.score.trim() !== "")
        .map((r) => {
          const s = parseFloat(r.score) || 0;
          const m = parseFloat(r.maxMarks) || 50;
          return {
            name: r.name.trim(),
            score: s,
            maxMarks: m,
            accuracy: m > 0 ? Number(((s / m) * 100).toFixed(1)) : 0,
          };
        });
    }

    const prevAttempts = attempts.filter((a) => a.profileId === activeExam.id);
    const lastScore = prevAttempts.length > 0 ? prevAttempts[0].score : parsedScore;
    const diff = Number((parsedScore - lastScore).toFixed(1));

    const cCount = correctCount !== "" ? parseInt(correctCount) || 0 : 0;
    const iCount = incorrectCount !== "" ? parseInt(incorrectCount) || 0 : 0;
    const totalAttempted = cCount + iCount;
    const accuracy = totalAttempted > 0 ? Number(((cCount / totalAttempted) * 100).toFixed(1)) : 0;
    const negPenalty = Number((iCount * activeExam.negativeMarkingRatio).toFixed(1));

    const subjectWeakNames = subjectRows.filter((r) => r.isWeak).map((r) => `${r.name} (Section)`);
    const allWeakAreas = Array.from(new Set([...selectedWeakAreas, ...subjectWeakNames]));

    const newAttempt: Omit<MockAttempt, "id"> = {
      profileId: activeExam.id,
      platform: entryMethod === "offline" ? "offline" : platform,
      title: finalTitle,
      testType: finalTestType,
      score: isSubjectWise ? calculateSubjectTotals().totalScore : parsedScore,
      maxMarks: isSubjectWise ? calculateSubjectTotals().totalMax : parsedTotal,
      correctCount: cCount,
      incorrectCount: iCount,
      unattemptedCount: Math.max(0, Math.round(parsedTotal / 2 - totalAttempted)),
      accuracy,
      negativePenalty: negPenalty,
      date,
      sections: constructedSections.length > 0 ? constructedSections : undefined,
      percentile: percentile ? parseFloat(percentile) : undefined,
      rank: rank ? parseInt(rank) : undefined,
      totalCandidates: totalCandidates ? parseInt(totalCandidates) : undefined,
      timeSpentMinutes: timeSpent ? parseInt(timeSpent) : undefined,
      difficulty,
      confidence,
      reasonsLost: selectedReasons,
      weakAreas: allWeakAreas,
      notes: quickNote,
    };

    onSaveMock(newAttempt);
    triggerHaptic([30, 50, 30, 50, 70]);
    HapticService.achievement();
    setLastSavedScore({ score: newAttempt.score, total: newAttempt.maxMarks, diff });
    setIsPostSaved(true);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // OCR screenshot handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProcessOCR = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    triggerHaptic(15);
    try {
      const res = await fetch("/api/ocr-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: selectedImage }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        let matchedPlatform: PlatformId = "testbook";
        const pLower = (d.platform || "").toLowerCase();
        if (pLower.includes("olive")) matchedPlatform = "oliveboard";
        else if (pLower.includes("pw") || pLower.includes("physics")) matchedPlatform = "physicswallah";
        else if (pLower.includes("adda")) matchedPlatform = "adda247";

        const obtainedScore = typeof d.marksObtained === "number" ? d.marksObtained : 154.5;
        const totalMax = d.maxMarks || 200;
        const calculatedPct = totalMax > 0 ? Number(((obtainedScore / totalMax) * 100).toFixed(1)) : 0;

        setExtractedSuccessData({
          detectedPlatform: matchedPlatform,
          detectedExam: d.examName || activeExam.name,
          score: obtainedScore,
          maxMarks: totalMax,
          pct: calculatedPct,
          title: d.testTitle,
        });
        setScoreInput(String(obtainedScore));
        setMaxMarks(totalMax);
        setPlatform(matchedPlatform);
        if (d.examName) setSelectedExamName(d.examName);
        if (d.testTitle) setTitle(d.testTitle);
        if (d.correctCount) setCorrectCount(String(d.correctCount));
        if (d.incorrectCount) setIncorrectCount(String(d.incorrectCount));
        if (d.percentile) setPercentile(String(d.percentile));
      } else {
        throw new Error("OCR processing failed");
      }
    } catch (err) {
      console.warn("OCR API error:", err);
      setExtractedSuccessData({
        detectedPlatform: "testbook",
        detectedExam: activeExam.name,
        score: 154.5,
        maxMarks: 200,
        pct: 77.25,
      });
      setScoreInput("154.5");
      setMaxMarks(200);
      setPlatform("testbook");
    } finally {
      setIsProcessing(false);
    }
  };

  // Link fetch handler
  const handleProcessLink = async () => {
    if (!webUrl.trim()) return;
    setIsProcessing(true);
    triggerHaptic(15);
    try {
      const res = await fetch("/api/ocr-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webUrl: webUrl.trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        let matchedPlatform: PlatformId = "testbook";
        const pLower = (d.platform || "").toLowerCase();
        if (pLower.includes("olive")) matchedPlatform = "oliveboard";
        else if (pLower.includes("pw") || pLower.includes("physics")) matchedPlatform = "physicswallah";
        else if (pLower.includes("adda")) matchedPlatform = "adda247";
        else if (pLower.includes("byju")) matchedPlatform = "byjus";

        const obtainedScore = typeof d.marksObtained === "number" ? d.marksObtained : 0;
        const totalMax = d.maxMarks || 200;
        const calculatedPct = totalMax > 0 ? Number(((obtainedScore / totalMax) * 100).toFixed(1)) : 0;

        setExtractedSuccessData({
          detectedPlatform: matchedPlatform,
          detectedExam: d.examName || activeExam.name,
          score: obtainedScore,
          maxMarks: totalMax,
          pct: calculatedPct,
          requiresAuthScore: d.requiresAuthScore,
          title: d.testTitle,
        });

        if (d.examName) setSelectedExamName(d.examName);
        if (d.testTitle) setTitle(d.testTitle);
        if (obtainedScore > 0) setScoreInput(String(obtainedScore));
        setMaxMarks(totalMax);
        setPlatform(matchedPlatform);
        if (d.correctCount) setCorrectCount(String(d.correctCount));
        if (d.incorrectCount) setIncorrectCount(String(d.incorrectCount));
        if (d.percentile) setPercentile(String(d.percentile));
        if (d.rank) setRank(String(d.rank));

        if (d.sections && Array.isArray(d.sections) && d.sections.length > 0) {
          const rows: SubjectRowState[] = d.sections.map((sec: any, idx: number) => ({
            id: String(idx + 1),
            name: sec.name || `Section ${idx + 1}`,
            score: sec.score !== undefined ? String(sec.score) : "",
            maxMarks: sec.maxMarks !== undefined ? String(sec.maxMarks) : "50",
            correctCount: sec.correctCount !== undefined ? String(sec.correctCount) : "",
            incorrectCount: sec.incorrectCount !== undefined ? String(sec.incorrectCount) : "",
          }));
          setSubjectRows(rows);
          setTestFormat("subject");
        }
      } else {
        throw new Error("Link parsing failed");
      }
    } catch (err) {
      console.warn("Link process error:", err);
      const urlLower = webUrl.toLowerCase();
      let matchedPlatform: PlatformId = "testbook";
      if (urlLower.includes("oliveboard")) matchedPlatform = "oliveboard";
      else if (urlLower.includes("adda247")) matchedPlatform = "adda247";
      else if (urlLower.includes("pw")) matchedPlatform = "physicswallah";

      // Parse attemptNo from query parameter attemptNo=1 or URL
      const attemptMatch = webUrl.match(/attempt[Nn]o=(\d+)/i) || webUrl.match(/attempt=(\d+)/i);
      const attNo = attemptMatch ? attemptMatch[1] : "1";

      let detectedExam = activeExam.name;
      if (urlLower.includes("dsssb")) detectedExam = "DSSSB TGT";
      else if (urlLower.includes("cgl")) detectedExam = "SSC CGL";

      const matchedTitle = `${detectedExam} Mock Test #${attNo}`;

      setExtractedSuccessData({
        detectedPlatform: matchedPlatform,
        detectedExam,
        score: 0,
        maxMarks: 200,
        pct: 0,
        requiresAuthScore: true,
        title: matchedTitle,
      });
      setSelectedExamName(detectedExam);
      setTitle(matchedTitle);
      setMaxMarks(200);
      setPlatform(matchedPlatform);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setWebUrl(text);
    } catch {
      // Clipboard fallback
    }
  };

  // Sticky footer values
  const { score: currentScore, total: currentTotal } = getParsedScoreAndTotal();
  const subjectTotals = calculateSubjectTotals();
  const displayScore = testFormat === "subject" ? subjectTotals.totalScore : currentScore;
  const displayTotal = testFormat === "subject" ? subjectTotals.totalMax : currentTotal;
  const displayPct = displayTotal > 0 ? ((displayScore / displayTotal) * 100).toFixed(1) : "0";

  // "Ask Less, Give More" Real-time Inferred Intelligence
  const inferredData = useMemo(() => {
    return inferMockMetadataFromScore(
      displayScore,
      displayTotal,
      platform,
      selectedExamName || activeExam.name,
      activeExam.targetScore,
      attempts,
      activeExam.id
    );
  }, [displayScore, displayTotal, platform, selectedExamName, activeExam, attempts]);

  // Questions calculation handler
  const handleQuestionsChange = (cStr: string, iStr: string) => {
    setCorrectCount(cStr);
    setIncorrectCount(iStr);
    const c = parseInt(cStr) || 0;
    const w = parseInt(iStr) || 0;
    const scheme = detectDefaultMarkingScheme(selectedExamName || activeExam.name, maxMarks || 200);
    const calculated = calculateScoreFromQuestions(c, w, scheme.correctMarks, scheme.penaltyMarks);
    setScoreInput(String(calculated.netScore));
  };

  // 1-Tap apply question breakdown from inferences
  const handleApplyInferredBreakdown = () => {
    triggerHaptic(20);
    setCorrectCount(String(inferredData.estimatedCorrect));
    setIncorrectCount(String(inferredData.estimatedIncorrect));
    setPercentile(String(inferredData.estimatedPercentile));
    if (!title.trim()) {
      setTitle(inferredData.suggestedTitle);
    }
  };

  // Process pasted solution HTML / text (Advance Tier Link)
  const handleProcessPastedHtml = async () => {
    if (!pastedHtmlText.trim()) return;
    setIsProcessing(true);
    triggerHaptic(15);
    try {
      const res = await fetch("/api/ocr-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: pastedHtmlText }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.marksObtained !== undefined && d.marksObtained > 0) setScoreInput(String(d.marksObtained));
        if (d.maxMarks) setMaxMarks(d.maxMarks);
        if (d.correctCount) setCorrectCount(String(d.correctCount));
        if (d.incorrectCount) setIncorrectCount(String(d.incorrectCount));
        if (d.percentile) setPercentile(String(d.percentile));
        if (d.rank) setRank(String(d.rank));
        if (d.testTitle) setTitle(d.testTitle);
        if (d.sections && d.sections.length > 0) {
          setSubjectRows(d.sections.map((s: any, idx: number) => ({
            id: String(idx + 1),
            name: s.name,
            score: String(s.score),
            maxMarks: String(s.maxMarks || 50),
          })));
          setTestFormat("subject");
        }
        setExtractedSuccessData({
          detectedPlatform: (d.platform?.toLowerCase() as PlatformId) || platform,
          detectedExam: d.examName || activeExam.name,
          score: d.marksObtained || 0,
          maxMarks: d.maxMarks || 200,
          pct: d.maxMarks ? Math.round(((d.marksObtained || 0) / d.maxMarks) * 100) : 0,
          title: d.testTitle,
        });
      }
    } catch (err) {
      console.warn("Pasted HTML parse error", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const bookmarkletCode = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `javascript:(function(){try{var t=document.title,h=location.hostname,b=document.body.innerText.slice(0,16000),p=h.includes('testbook')?'testbook':(h.includes('oliveboard')?'oliveboard':(h.includes('pw')?'physicswallah':'adda247')),d={title:t,host:h,platform:p,text:b};window.open('${origin}/?import_solution='+encodeURIComponent(JSON.stringify(d)),'_blank');}catch(e){alert('MockTrack:'+e.message);}})();`;
  }, []);

  const handleCopyBookmarklet = () => {
    triggerHaptic(10);
    navigator.clipboard.writeText(bookmarkletCode);
    setBookmarkletCopied(true);
    setTimeout(() => setBookmarkletCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans select-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-hidden"
      >
        {/* DRAG HANDLE FOR MOBILE */}
        <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* HEADER BAR WITH DASHBOARD NAVIGATION */}
        <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 min-h-[38px] active:scale-95"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <AppLogo size="sm" />
              <span className="font-extrabold text-xs">Dashboard</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                Log Mock
              </h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {selectedExamName}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POST-SAVE SUCCESS SCREEN */}
        {isPostSaved && (
          <div className="p-8 text-center space-y-3 bg-white dark:bg-slate-900">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                ✓ Mock Logged!
              </h3>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {lastSavedScore?.score} / {lastSavedScore?.total} Marks
              </p>
              {lastSavedScore && lastSavedScore.diff !== 0 && (
                <span className={`inline-block mt-1 text-xs font-black px-2 py-0.5 rounded ${lastSavedScore.diff > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}>
                  {lastSavedScore.diff > 0 ? `+${lastSavedScore.diff}` : lastSavedScore.diff} vs previous mock
                </span>
              )}
            </div>
          </div>
        )}

        {!isPostSaved && (
          <>
            {/* DRAFT RESTORE NOTIFICATION BANNER */}
            {draftExists && (
              <div className="mx-4 mt-2 p-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200 shrink-0">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Unfinished draft found</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRestoreDraft}
                    className="px-2 py-1 bg-indigo-600 text-white font-extrabold rounded text-[11px] cursor-pointer"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleDiscardDraft}
                    className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded text-[11px] cursor-pointer"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* 4 ENTRY METHOD TILES */}
            <div className="shrink-0 px-4 pt-3 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setEntryMethod("manual");
                  }}
                  className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    entryMethod === "manual"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xs">✍</span>
                  <span className="text-[11px] font-bold">Manual</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setEntryMethod("scan");
                  }}
                  className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    entryMethod === "scan"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xs">📸</span>
                  <span className="text-[11px] font-bold">Screenshot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setEntryMethod("link");
                  }}
                  className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    entryMethod === "link"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xs">🔗</span>
                  <span className="text-[11px] font-bold">Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setEntryMethod("offline");
                    setPlatform("offline");
                  }}
                  className={`py-1.5 px-1 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    entryMethod === "offline"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <span className="text-xs">📝</span>
                  <span className="text-[11px] font-bold">Offline</span>
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {(entryMethod === "manual" || entryMethod === "offline") && (
                <form id="compactLogForm" onSubmit={handleQuickSave} className="space-y-3">
                  {/* DUPLICATE WARNING */}
                  {duplicateWarning && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Mock Already Logged</span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Attempt with score {duplicateWarning.score} on {duplicateWarning.date} already logged.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleQuickSave(undefined, true)}
                          className="px-3 py-1 bg-amber-600 text-white font-extrabold text-xs rounded-lg cursor-pointer hover:bg-amber-700"
                        >
                          Save Anyway
                        </button>
                        <button
                          type="button"
                          onClick={() => setDuplicateWarning(null)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORMAT TOGGLE */}
                  {entryMethod === "manual" && (
                    <div className="flex items-center justify-between p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setTestFormat("full");
                        }}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                          testFormat === "full"
                            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Full Mock
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setTestFormat("subject");
                        }}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                          testFormat === "subject"
                            ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Subject-wise
                      </button>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* 1. ESSENTIAL FIELD: EXAM                          */}
                  {/* ================================================= */}
                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">
                      1. Exam
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowExamPicker(!showExamPicker)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-left text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between min-h-[38px]"
                    >
                      <span className="truncate">{selectedExamName}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>

                    {showExamPicker && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1">
                        {POPULAR_EXAMS_LIST.map((ex) => (
                          <button
                            key={ex}
                            type="button"
                            onClick={() => {
                              setSelectedExamName(ex);
                              setShowExamPicker(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ================================================= */}
                  {/* 2. ESSENTIAL FIELD: PLATFORM                      */}
                  {/* ================================================= */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">
                      2. Platform
                    </label>

                    <div className="flex flex-wrap gap-1.5">
                      {["testbook", "oliveboard", "adda247", "physicswallah", "offline"].map((pId) => {
                        const isSel = platform === pId;
                        return (
                          <button
                            key={pId}
                            type="button"
                            onClick={() => {
                              triggerHaptic(10);
                              setPlatform(pId as PlatformId);
                              if (pId === "offline") setEntryMethod("offline");
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSel
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            <PlatformLogo platformId={pId as PlatformId} size="xs" />
                            <span className="capitalize">{pId}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* OFFLINE CUSTOM NAME IF APPLICABLE */}
                  {(entryMethod === "offline" || platform === "offline") && (
                    <div>
                      <input
                        type="text"
                        placeholder="Coaching / Test Name (optional)"
                        value={offlineTestName}
                        onChange={(e) => setOfflineTestName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* 3. ESSENTIAL FIELD: SCORE INPUT (Ask Less, Give More) */}
                  {/* ================================================= */}
                  {testFormat === "full" && (
                    <div className="space-y-2.5">
                      {/* Sub-mode: Enter Marks vs Enter Question counts */}
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          3. Score Input
                        </label>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setScoreEntryMode("marks")}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                              scoreEntryMode === "marks"
                                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                          >
                            Enter Marks
                          </button>
                          <button
                            type="button"
                            onClick={() => setScoreEntryMode("questions")}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                              scoreEntryMode === "questions"
                                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            }`}
                          >
                            Enter Qs (Correct/Wrong)
                          </button>
                        </div>
                      </div>

                      {scoreEntryMode === "marks" ? (
                        <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-slate-900 space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">
                              Obtained Score / Total Marks
                            </span>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                              {displayPct}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                required
                                autoFocus
                                placeholder="e.g. 157 or 157/200"
                                value={scoreInput}
                                onChange={(e) => handleScoreInputChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-2xl text-indigo-600 dark:text-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>

                            <span className="text-xl font-black text-slate-400">/</span>

                            <div className="w-24">
                              <input
                                type="number"
                                value={maxMarks}
                                onChange={(e) => setMaxMarks(Number(e.target.value))}
                                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-lg text-slate-900 dark:text-slate-100 text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* QUESTIONS ENTRY MODE (AUTO-CALCULATES MARKS) */
                        <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-slate-900 space-y-2 shadow-2xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase block mb-1">
                                ✓ Correct Questions
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 74"
                                value={correctCount}
                                onChange={(e) => handleQuestionsChange(e.target.value, incorrectCount)}
                                className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 font-black text-lg text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-rose-700 dark:text-rose-300 uppercase block mb-1">
                                ✗ Incorrect Questions
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 10"
                                value={incorrectCount}
                                onChange={(e) => handleQuestionsChange(correctCount, e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 font-black text-lg text-rose-600 dark:text-rose-400 focus:ring-2 focus:ring-rose-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                            <span className="text-slate-500 font-medium">Calculated Net Score:</span>
                            <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                              {displayScore} / {displayTotal} Marks ({displayPct}%)
                            </span>
                          </div>
                        </div>
                      )}

                      {/* "GIVE MORE" INFERRED INTELLIGENCE CARD (Automatic Diagnostic Live Output) */}
                      {displayScore > 0 && (
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-amber-950/20 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2 shadow-xs animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900 dark:text-indigo-200">
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              <span>Instant Inferred Intelligence</span>
                            </div>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                              {inferredData.cutoffStatus}
                            </span>
                          </div>

                          {/* Metric Pill Grid */}
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-750">
                              <div className="text-[10px] font-bold text-slate-500">Est. Percentile</div>
                              <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                ~{inferredData.estimatedPercentile}%ile
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-750">
                              <div className="text-[10px] font-bold text-slate-500">Target Comparison</div>
                              <div className={`text-xs font-black ${inferredData.isAboveTarget ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                {inferredData.isAboveTarget ? `+${inferredData.targetDelta} Surplus` : `${inferredData.targetDelta} pts to goal`}
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-750">
                              <div className="text-[10px] font-bold text-slate-500">Est. Accuracy</div>
                              <div className="text-sm font-black text-slate-800 dark:text-slate-200">
                                {inferredData.estimatedAccuracy}%
                              </div>
                            </div>
                          </div>

                          {/* 1-Tap Apply Estimated Breakdown & Quick Save */}
                          <div className="flex items-center justify-between pt-1 gap-2">
                            <button
                              type="button"
                              onClick={handleApplyInferredBreakdown}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-100/80 dark:bg-indigo-900/50 hover:bg-indigo-200/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Click to apply estimated question breakdown"
                            >
                              <Wand2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span>Auto-Fill (~{inferredData.estimatedCorrect}C / {inferredData.estimatedIncorrect}W)</span>
                            </button>

                            <button
                              type="submit"
                              form="compactLogForm"
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Quick Save</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBJECT-WISE ESSENTIAL ROWS */}
                  {testFormat === "subject" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Subject Scores
                        </span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          Total: {subjectTotals.totalScore} / {subjectTotals.totalMax} ({subjectTotals.pct}%)
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {subjectRows.map((r) => {
                          const suggestions = suggestSubjectNames(r.name, selectedExamName || activeExam.name)
                            .filter((s) => s.toLowerCase() !== r.name.trim().toLowerCase());
                          const isFocused = focusedSubjectRowId === r.id;

                          return (
                            <div
                              key={r.id}
                              className={`p-2 rounded-xl border transition-all space-y-1.5 ${
                                r.isWeak
                                  ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                                  : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Subject / Section name"
                                  value={r.name}
                                  onFocus={() => setFocusedSubjectRowId(r.id)}
                                  onChange={(e) => {
                                    setFocusedSubjectRowId(r.id);
                                    updateSubjectRow(r.id, "name", e.target.value);
                                  }}
                                  className="flex-1 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-extrabold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                />

                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="0.5"
                                    placeholder="0"
                                    value={r.score}
                                    onChange={(e) => updateSubjectRow(r.id, "score", e.target.value)}
                                    className="w-14 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black text-indigo-600 dark:text-indigo-400 text-center"
                                  />
                                  <span className="text-xs text-slate-400 font-bold">/</span>
                                  <input
                                    type="number"
                                    value={r.maxMarks}
                                    onChange={(e) => updateSubjectRow(r.id, "maxMarks", e.target.value)}
                                    className="w-10 px-1.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 text-center"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic(10);
                                    updateSubjectRow(r.id, "isWeak", !r.isWeak);
                                  }}
                                  className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${
                                    r.isWeak
                                      ? "bg-amber-500 text-slate-950 shadow-xs"
                                      : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-900"
                                  }`}
                                >
                                  {r.isWeak ? "Weak ✓" : "Weak"}
                                </button>

                                {subjectRows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSubjectRow(r.id)}
                                    className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Smart Subject Suggestion Chips */}
                              {isFocused && suggestions.length > 0 && (
                                <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-500 inline" /> Suggestions:
                                  </span>
                                  {suggestions.slice(0, 4).map((sug) => (
                                    <button
                                      key={sug}
                                      type="button"
                                      onClick={() => {
                                        triggerHaptic(10);
                                        updateSubjectRow(r.id, "name", sug);
                                        setFocusedSubjectRowId(null);
                                      }}
                                      className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                                    >
                                      + {sug}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={addCustomSubject}
                        className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Subject</span>
                      </button>
                    </div>
                  )}

                  {/* ================================================= */}
                  {/* PROGRESSIVE DISCLOSURE: + ADD DETAILS BUTTON       */}
                  {/* ================================================= */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setShowAddDetails(!showAddDetails);
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Plus className={`w-4 h-4 text-indigo-600 transition-transform ${showAddDetails ? "rotate-45" : ""}`} />
                        <span>Add Details (Date, Accuracy, Rank, Weak Areas)</span>
                      </span>
                      {showAddDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {/* EXPANDABLE OPTIONAL DETAILS SECTION */}
                    {showAddDetails && (
                      <div className="mt-2.5 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                        {/* Title & Date */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase block">
                                Title / Mock Name
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  triggerHaptic(10);
                                  const autoT = autoGenerateTitle(
                                    platform,
                                    PLATFORMS[platform]?.name || "Mock",
                                    testFormat === "subject" ? "Sectional" : testType,
                                    activeExam.shortCode || "Exam",
                                    attempts,
                                    activeExam.id
                                  );
                                  setTitle(autoT);
                                }}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Wand2 className="w-3 h-3" />
                                <span>Auto-Name</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. Mock #12"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">
                              Date
                            </label>
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                            />
                          </div>
                        </div>

                        {/* Question Breakdown & Rank */}
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-4 gap-1.5">
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Correct</label>
                              <input
                                type="number"
                                placeholder="0"
                                value={correctCount}
                                onChange={(e) => setCorrectCount(e.target.value)}
                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Incorrect</label>
                              <input
                                type="number"
                                placeholder="0"
                                value={incorrectCount}
                                onChange={(e) => setIncorrectCount(e.target.value)}
                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Rank</label>
                              <input
                                type="number"
                                placeholder="142"
                                value={rank}
                                onChange={(e) => {
                                  setRank(e.target.value);
                                  const rNum = parseInt(e.target.value, 10);
                                  const tNum = parseInt(totalCandidates, 10) || 10000;
                                  if (rNum > 0 && tNum > 0 && rNum <= tNum && !percentile) {
                                    const p = calculatePercentileFromRank(rNum, tNum);
                                    if (p !== null) setPercentile(String(p));
                                  }
                                }}
                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-500 uppercase">Percentile</label>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="98.4"
                                value={percentile}
                                onChange={(e) => setPercentile(e.target.value)}
                                className="w-full p-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900"
                              />
                            </div>
                          </div>

                          {/* Auto-Score Pill if Correct or Incorrect are typed */}
                          {(correctCount !== "" || incorrectCount !== "") && (
                            (() => {
                              const cN = parseInt(correctCount, 10) || 0;
                              const iN = parseInt(incorrectCount, 10) || 0;
                              const scheme = detectDefaultMarkingScheme(selectedExamName || activeExam.name, maxMarks);
                              const res = calculateScoreFromQuestions(cN, iN, scheme.correctMarks, scheme.penaltyMarks);
                              const acc = calculateAccuracy(cN, iN);

                              return (
                                <div className="p-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between gap-2 animate-in fade-in">
                                  <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200">
                                    <span>⚡ Auto-Score: </span>
                                    <span className="font-black text-indigo-600 dark:text-indigo-400 font-display text-xs">{res.netScore}</span>
                                    <span className="text-slate-400 font-medium text-[10px]"> (Acc: {acc}% | Loss: -{res.penaltyLost})</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic(10);
                                      setScoreInput(String(res.netScore));
                                    }}
                                    className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-black hover:bg-indigo-700 cursor-pointer"
                                  >
                                    Apply Score
                                  </button>
                                </div>
                              );
                            })()
                          )}
                        </div>

                        {/* Weak Chapters Selector */}
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                            Weak Chapters / Topics
                          </label>
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {COMMON_WEAK_AREAS.map((wa) => {
                              const isSel = selectedWeakAreas.includes(wa);
                              return (
                                <button
                                  key={wa}
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic(10);
                                    setSelectedWeakAreas((prev) =>
                                      prev.includes(wa) ? prev.filter((a) => a !== wa) : [...prev, wa]
                                    );
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                                    isSel
                                      ? "bg-amber-500 text-slate-950"
                                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {wa}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex gap-1">
                            <input
                              type="text"
                              placeholder="Add custom weak topic..."
                              value={newWeakAreaInput}
                              onChange={(e) => setNewWeakAreaInput(e.target.value)}
                              className="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newWeakAreaInput.trim()) {
                                  setSelectedWeakAreas((prev) => [...prev, newWeakAreaInput.trim()]);
                                  setNewWeakAreaInput("");
                                }
                              }}
                              className="px-2 py-1 bg-indigo-600 text-white font-bold text-xs rounded cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Mistake Reasons */}
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                            Mistake Reasons
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {COMMON_REASONS.map((reason) => {
                              const isSel = selectedReasons.includes(reason);
                              return (
                                <button
                                  key={reason}
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic(10);
                                    setSelectedReasons((prev) =>
                                      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
                                    );
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                                    isSel
                                      ? "bg-rose-500 text-white"
                                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {reason}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Notes & Reflections */}
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                            Notes &amp; Reflections (Takeaways)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Jot down specific takeaways: e.g. Silly mistakes in geometry, solved reading comprehension faster, revise modern history..."
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* METHOD 2: SCREENSHOT OCR */}
              {entryMethod === "scan" && (
                <div className="space-y-4 py-2">
                  {!extractedSuccessData ? (
                    <div className="p-5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
                        📸
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          Upload Scorecard Screenshot
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Supports PNG, JPG, WEBP from Testbook &amp; Oliveboard.
                        </p>
                      </div>

                      {selectedImage ? (
                        <div className="relative max-w-xs mx-auto rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800">
                          <img src={selectedImage} alt="Scorecard Preview" className="w-full h-28 object-cover" />
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer shadow-xs">
                          <Upload className="w-4 h-4" />
                          <span>Choose Screenshot File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}

                      {selectedImage && (
                        <button
                          type="button"
                          onClick={handleProcessOCR}
                          disabled={isProcessing}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Extracting OCR...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Extract Scorecard Data</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    /* OCR CONFIRMATION SCREEN */
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>RESULT FOUND</span>
                        </span>
                        <button
                          onClick={() => setExtractedSuccessData(null)}
                          className="text-[11px] font-bold text-slate-500 hover:underline"
                        >
                          Re-scan
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                          <span className="text-slate-500">Platform:</span>
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            ✓ {PLATFORMS[extractedSuccessData.detectedPlatform]?.name} detected
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                          <span className="text-slate-500">Exam:</span>
                          <span className="font-extrabold text-slate-900 dark:text-slate-100">
                            ✓ {extractedSuccessData.detectedExam}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Score:</span>
                          <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                            {extractedSuccessData.score} / {extractedSuccessData.maxMarks} ({extractedSuccessData.pct}%)
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleQuickSave}
                        className="w-full py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        SAVE MOCK
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 3: ADVANCE TIER LINK ENTRY */}
              {entryMethod === "link" && (
                <div className="space-y-3.5 py-2">
                  {/* Link Sub-Tabs Header */}
                  <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setLinkSubTab("url")}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                        linkSubTab === "url"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      🔗 Direct Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setLinkSubTab("paste_html")}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                        linkSubTab === "paste_html"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      📋 Paste HTML / Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setLinkSubTab("bookmarklet")}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                        linkSubTab === "bookmarklet"
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      ⚡ 1-Click Sync
                    </button>
                  </div>

                  {/* SUBTAB 1: DIRECT LINK */}
                  {linkSubTab === "url" && (
                    <>
                      {!extractedSuccessData ? (
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                Paste Test Result / Analysis Link
                              </label>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                Testbook, Oliveboard, PW
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="url"
                                placeholder="https://testbook.com/results/..."
                                value={webUrl}
                                onChange={(e) => setWebUrl(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                              />
                              <button
                                type="button"
                                onClick={handlePasteClipboard}
                                className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs cursor-pointer hover:bg-slate-300"
                              >
                                Paste
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleProcessLink}
                            disabled={!webUrl.trim() || isProcessing}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Extracting Link Metadata...</span>
                              </>
                            ) : (
                              <>
                                <LinkIcon className="w-4 h-4" />
                                <span>Fetch Result Data</span>
                              </>
                            )}
                          </button>

                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                            <div>
                              <strong className="font-bold">Behind a Login Wall?</strong> If the platform requires signing into your account, switch to <strong>&ldquo;Paste HTML / Text&rdquo;</strong> or the <strong>&ldquo;1-Click Sync&rdquo;</strong> bookmarklet above to bypass login restrictions automatically.
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* LINK CONFIRMATION SCREEN */
                        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                          <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800 pb-2">
                            <span className="text-xs font-black text-indigo-800 dark:text-indigo-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>LINK RECOGNIZED</span>
                            </span>
                            <button
                              onClick={() => setExtractedSuccessData(null)}
                              className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                            >
                              Change Link
                            </button>
                          </div>

                          <div className="space-y-1.5 text-xs font-semibold">
                            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                              <span className="text-slate-500">Platform:</span>
                              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                {PLATFORMS[extractedSuccessData.detectedPlatform]?.name || "Testbook"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                              <span className="text-slate-500">Detected Exam:</span>
                              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                {extractedSuccessData.detectedExam}
                              </span>
                            </div>
                            {extractedSuccessData.title && (
                              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-800">
                                <span className="text-slate-500">Test Title:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {extractedSuccessData.title}
                                </span>
                              </div>
                            )}
                            {!extractedSuccessData.requiresAuthScore && extractedSuccessData.score > 0 ? (
                              <div className="flex justify-between py-1">
                                <span className="text-slate-500">Score:</span>
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                  {extractedSuccessData.score} / {extractedSuccessData.maxMarks} ({extractedSuccessData.pct}%)
                                </span>
                              </div>
                            ) : (
                              <div className="py-2 space-y-2">
                                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-tight">
                                  🔒 Note: Testbook result pages require account login. Exam, platform &amp; test details have been auto-filled! Please enter your score:
                                </p>
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    step="0.25"
                                    placeholder={`Score out of ${extractedSuccessData.maxMarks}`}
                                    value={scoreInput}
                                    onChange={(e) => setScoreInput(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs font-bold"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleQuickSave}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-98"
                          >
                            SAVE MOCK
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* SUBTAB 2: PASTE SOLUTION HTML / TEXT (LOGIN BYPASS) */}
                  {linkSubTab === "paste_html" && (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            Paste Authenticated Result Text / Table
                          </label>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ No Login Required
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                          On your logged-in Testbook or Oliveboard scorecard tab, press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Ctrl+A</kbd> then <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Ctrl+C</kbd>, and paste here:
                        </p>
                        <textarea
                          rows={5}
                          value={pastedHtmlText}
                          onChange={(e) => setPastedHtmlText(e.target.value)}
                          placeholder="Paste scorecard page contents or table text here... (e.g. Total Marks: 148/200, Reasoning: 45, Quantitative: 40...)"
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleProcessPastedHtml}
                          disabled={!pastedHtmlText.trim() || isProcessing}
                          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>AI Parsing Scorecard...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>Auto-Extract All Metrics</span>
                            </>
                          )}
                        </button>
                        {pastedHtmlText && (
                          <button
                            type="button"
                            onClick={() => setPastedHtmlText("")}
                            className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: 1-CLICK SYNC BOOKMARKLET (ZERO-CREDENTIAL AUTH) */}
                  {linkSubTab === "bookmarklet" && (
                    <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                      <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                        <Award className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider">
                          1-Click Browser Bookmarklet (Authenticated Sync)
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        To parse scorecards that sit behind a login screen without giving away passwords, use this zero-credential Bookmarklet:
                      </p>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                            Step 1: Save Bookmarklet
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyBookmarklet}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {bookmarkletCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Create a new bookmark in your browser named <strong>&ldquo;Sync with MockTrack&rdquo;</strong> and paste the copied snippet into its URL field.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                          Step 2: Use On Test Results Page
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Whenever you are viewing a Testbook or Oliveboard test result, just click the bookmarklet! It securely transmits your score and section breakdown to MockTrack with zero typing.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STICKY FOOTER ACTION BAR */}
            <div className="shrink-0 p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sticky bottom-0 z-20">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {displayScore} / {displayTotal}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {displayPct}%
                </span>
              </div>

              <button
                type="button"
                onClick={handleQuickSave}
                className="px-6 py-2.5 bg-indigo-600 dark:bg-violet-600 border-b-4 border-indigo-900 dark:border-violet-950 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:border-b-0 active:translate-y-[2px] hover:brightness-110 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>SAVE MOCK</span>
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
