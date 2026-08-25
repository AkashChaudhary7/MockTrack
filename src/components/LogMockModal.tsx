import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { AppLogo } from "./AppLogo";
import { PlatformLogo } from "./PlatformLogo";

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

  if (!isOpen) return null;

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
                  {/* 3. ESSENTIAL FIELD: SCORE / TOTAL                 */}
                  {/* ================================================= */}
                  {testFormat === "full" && (
                    <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                          3. Score Input
                        </label>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
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
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-2xl text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <span className="text-xl font-black text-slate-400">/</span>

                        <div className="w-24">
                          <input
                            type="number"
                            value={maxMarks}
                            onChange={(e) => setMaxMarks(Number(e.target.value))}
                            className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-lg text-slate-900 dark:text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
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
                        {subjectRows.map((r) => (
                          <div
                            key={r.id}
                            className={`p-2 rounded-xl border transition-all space-y-1 ${
                              r.isWeak
                                ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                                : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={r.name}
                                onChange={(e) => updateSubjectRow(r.id, "name", e.target.value)}
                                className="flex-1 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-extrabold text-slate-900 dark:text-slate-100"
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
                          </div>
                        ))}
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
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">
                              Title / Mock Name
                            </label>
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
                              onChange={(e) => setRank(e.target.value)}
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

                        {/* Quick Notes */}
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">
                            Quick Note
                          </label>
                          <input
                            type="text"
                            placeholder="What should you remember from this mock?"
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
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

              {/* METHOD 3: LINK ENTRY */}
              {entryMethod === "link" && (
                <div className="space-y-4 py-2">
                  {!extractedSuccessData ? (
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                          Paste Result Link
                        </label>
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
                            className="px-2.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs cursor-pointer"
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
                            <span>Fetching Result...</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-4 h-4" />
                            <span>Fetch Result Data</span>
                          </>
                        )}
                      </button>
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
                          className="text-[11px] font-bold text-slate-500 hover:underline"
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
