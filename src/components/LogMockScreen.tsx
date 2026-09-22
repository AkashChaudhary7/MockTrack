import React, { useState, useEffect, useMemo } from "react";
import {
  PlatformId,
  TestType,
  MockAttempt,
  ExamProfile,
  MockDifficulty,
  MockConfidence,
  SectionScore,
  NavTab,
} from "../types";
import { PLATFORMS } from "../data/platforms";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Camera,
  Link as LinkIcon,
  Sparkles,
  AlertCircle,
  FileText,
  Upload,
  Loader2,
  RefreshCw,
  RotateCcw,
  Wand2,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { AppLogo } from "./AppLogo";
import { HapticService } from "../services/HapticService";
import { LogMockQuestionCalculator } from "./LogMockQuestionCalculator";
import { LogMockPercentileCalculator } from "./LogMockPercentileCalculator";
import {
  calculateLiveComparison,
  calculateTimePacing,
  analyzeSectionBreakdown,
  autoGenerateTitle,
} from "../utils/mockCalculator";
import { getSubjectsForProfile } from "../data/allExamsCatalog";

interface LogMockScreenProps {
  activeExam: ExamProfile;
  attempts: MockAttempt[];
  onSaveMock: (attempt: Omit<MockAttempt, "id">) => void;
  onNavigateTab: (tab: NavTab) => void;
  initialData?: Partial<MockAttempt>;
  initialWorkflowMode?: "select" | "manual" | "link" | "screenshot";
  onOpenOcrModal?: (tab: "image" | "link") => void;
}

interface SectionRow {
  id: string;
  name: string;
  score: string;
  maxMarks: string;
  part?: string;
  correctCount: string;
  incorrectCount: string;
}

const DEFAULT_SECTIONS_MAP: Record<string, string[]> = {
  ssc: [
    "Quantitative Aptitude",
    "General Intelligence & Reasoning",
    "English Comprehension",
    "General Awareness",
  ],
  bank: [
    "Quantitative Aptitude",
    "Reasoning Ability",
    "English Language",
    "Banking & Financial Awareness",
  ],
  jee: ["Physics", "Chemistry", "Mathematics"],
  neet: ["Biology", "Chemistry", "Physics"],
  upsc: ["General Studies Paper 1", "CSAT Paper 2"],
};

export const LogMockScreen: React.FC<LogMockScreenProps> = ({
  activeExam,
  attempts,
  onSaveMock,
  onNavigateTab,
  initialData,
  initialWorkflowMode,
}) => {
  useTranslation();

  // Workflow Selection State: "select" | "manual" | "link" | "screenshot"
  const [workflowMode, setWorkflowMode] = useState<"select" | "manual" | "link" | "screenshot">(
    initialWorkflowMode || (initialData ? "manual" : "select")
  );

  useEffect(() => {
    if (initialWorkflowMode) {
      setWorkflowMode(initialWorkflowMode);
    }
  }, [initialWorkflowMode]);

  // Link & Screenshot Extraction States
  const [inputUrl, setInputUrl] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Form Basic Details
  const [platform, setPlatform] = useState<PlatformId>(
    initialData?.platform || "testbook"
  );
  const [customPlatformName, setCustomPlatformName] = useState<string>(
    initialData?.customPlatformName || ""
  );
  const [title, setTitle] = useState<string>(
    initialData?.title || ""
  );

  const STANDARD_TEST_TYPES = [
    "Full Mock",
    "Sectional",
    "Topic/Chapter Test",
    "Previous Year Paper",
    "Practice Test",
  ];
  const isInitialStandard = STANDARD_TEST_TYPES.includes(initialData?.testType || "");

  const [testType, setTestType] = useState<string>(
    initialData?.testType
      ? isInitialStandard
        ? initialData.testType
        : "Custom"
      : "Full Mock"
  );
  const [customTestType, setCustomTestType] = useState<string>(
    initialData?.customTestType ||
      (!isInitialStandard && initialData?.testType ? initialData.testType : "")
  );
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().split("T")[0]
  );

  // Overall Score State
  const [score, setScore] = useState<string>(
    initialData?.score !== undefined ? String(initialData.score) : ""
  );
  const [maxMarks, setMaxMarks] = useState<string>(
    initialData?.maxMarks !== undefined
      ? String(initialData.maxMarks)
      : String(activeExam.totalMarks || 200)
  );
  const [correctCount, setCorrectCount] = useState<string>(
    initialData?.correctCount !== undefined ? String(initialData.correctCount) : ""
  );
  const [incorrectCount, setIncorrectCount] = useState<string>(
    initialData?.incorrectCount !== undefined ? String(initialData.incorrectCount) : ""
  );
  const [unattemptedCount, setUnattemptedCount] = useState<string>(
    initialData?.unattemptedCount !== undefined ? String(initialData.unattemptedCount) : ""
  );

  // Percentile, Rank & Time Spent
  const [percentile, setPercentile] = useState<string>(
    initialData?.percentile !== undefined ? String(initialData.percentile) : ""
  );
  const [rank, setRank] = useState<string>(
    initialData?.rank !== undefined ? String(initialData.rank) : ""
  );
  const [totalCandidates, setTotalCandidates] = useState<string>(
    initialData?.totalCandidates !== undefined ? String(initialData.totalCandidates) : ""
  );
  const [timeSpent, setTimeSpent] = useState<string>(
    initialData?.timeSpentMinutes !== undefined ? String(initialData.timeSpentMinutes) : ""
  );

  // Sections
  const getInitialSections = (): SectionRow[] => {
    if (initialData?.sections && initialData.sections.length > 0) {
      return initialData.sections.map((s, idx) => ({
        id: `sec-${idx}`,
        name: s.name,
        score: String(s.score),
        maxMarks: String(s.maxMarks),
        part: s.part,
        correctCount: s.correctCount !== undefined ? String(s.correctCount) : "",
        incorrectCount: s.incorrectCount !== undefined ? String(s.incorrectCount) : "",
      }));
    }

    const profileSubjects = getSubjectsForProfile(activeExam);
    return profileSubjects.map((sub, idx) => ({
      id: `sec-${idx}-${sub.id || idx}`,
      name: sub.name,
      score: "",
      maxMarks: String(sub.maxMarks),
      part: sub.part,
      correctCount: "",
      incorrectCount: "",
    }));
  };

  const [sections, setSections] = useState<SectionRow[]>(getInitialSections);

  // Sync sections if active exam changes and user hasn't typed in custom data
  useEffect(() => {
    if (!initialData) {
      const hasScores = sections.some((s) => s.score.trim() !== "");
      if (!hasScores) {
        const profileSubjects = getSubjectsForProfile(activeExam);
        setSections(
          profileSubjects.map((sub, idx) => ({
            id: `sec-${idx}-${sub.id || idx}`,
            name: sub.name,
            score: "",
            maxMarks: String(sub.maxMarks),
            part: sub.part,
            correctCount: "",
            incorrectCount: "",
          }))
        );
        setMaxMarks(String(activeExam.totalMarks || 200));
      }
    }
  }, [activeExam.id]);

  // Diagnostic Weak Areas: Collapsed by default
  const [isWeakAreasExpanded, setIsWeakAreasExpanded] = useState<boolean>(false);

  // Qualitative reflection
  const [difficulty, setDifficulty] = useState<MockDifficulty>(
    initialData?.difficulty || "Moderate"
  );
  const [confidence, setConfidence] = useState<MockConfidence>(
    initialData?.confidence || "Confident"
  );
  const [weakAreas, setWeakAreas] = useState<string[]>(
    initialData?.weakAreas || []
  );
  const [customWeakTag, setCustomWeakTag] = useState<string>("");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Draft state & Duplicate confirmation state
  const [draftExists, setDraftExists] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<MockAttempt | null>(null);

  // Check draft on mount if not editing existing data
  useEffect(() => {
    if (!initialData) {
      const saved = localStorage.getItem("mocktrack_screen_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.score || parsed.title || parsed.correctCount)) {
            setDraftExists(true);
          }
        } catch {
          // Ignore
        }
      }
    }
  }, [initialData]);

  // Set default title if empty
  useEffect(() => {
    if (!title && !initialData) {
      const platformObj = PLATFORMS[platform];
      const genTitle = autoGenerateTitle(
        platform,
        platformObj?.name || "Mock",
        testType,
        activeExam.shortCode || "Exam",
        attempts,
        activeExam.id
      );
      setTitle(genTitle);
    }
  }, [platform, testType, activeExam, attempts, initialData]);

  // Autosave draft as user enters data
  useEffect(() => {
    if (!initialData && (score || correctCount || title)) {
      const draftObj = {
        platform,
        customPlatformName,
        title,
        testType,
        customTestType,
        date,
        score,
        maxMarks,
        correctCount,
        incorrectCount,
        unattemptedCount,
        percentile,
        rank,
        totalCandidates,
        timeSpent,
        difficulty,
        confidence,
        weakAreas,
        notes,
      };
      localStorage.setItem("mocktrack_screen_draft", JSON.stringify(draftObj));
    }
  }, [
    platform,
    customPlatformName,
    title,
    testType,
    customTestType,
    date,
    score,
    maxMarks,
    correctCount,
    incorrectCount,
    unattemptedCount,
    percentile,
    rank,
    totalCandidates,
    timeSpent,
    difficulty,
    confidence,
    weakAreas,
    notes,
    initialData,
  ]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem("mocktrack_screen_draft");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.platform) setPlatform(d.platform);
        if (d.customPlatformName) setCustomPlatformName(d.customPlatformName);
        if (d.title) setTitle(d.title);
        if (d.testType) setTestType(d.testType);
        if (d.customTestType) setCustomTestType(d.customTestType);
        if (d.date) setDate(d.date);
        if (d.score) setScore(d.score);
        if (d.maxMarks) setMaxMarks(d.maxMarks);
        if (d.correctCount) setCorrectCount(d.correctCount);
        if (d.incorrectCount) setIncorrectCount(d.incorrectCount);
        if (d.unattemptedCount) setUnattemptedCount(d.unattemptedCount);
        if (d.percentile) setPercentile(d.percentile);
        if (d.rank) setRank(d.rank);
        if (d.totalCandidates) setTotalCandidates(d.totalCandidates);
        if (d.timeSpent) setTimeSpent(d.timeSpent);
        if (d.difficulty) setDifficulty(d.difficulty);
        if (d.confidence) setConfidence(d.confidence);
        if (d.weakAreas) setWeakAreas(d.weakAreas);
        if (d.notes) setNotes(d.notes);
      }
    } catch {
      // Ignore
    }
    setDraftExists(false);
    HapticService.selection();
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("mocktrack_screen_draft");
    setDraftExists(false);
    HapticService.lightTap();
  };

  // Populate extracted data into form
  const applyExtractedData = (extracted: any) => {
    if (extracted.platform) {
      const pKey = String(extracted.platform).toLowerCase().replace(/[^a-z0-9]/g, "");
      const match = Object.keys(PLATFORMS).find((k) => pKey.includes(k) || k.includes(pKey));
      if (match) setPlatform(match as PlatformId);
    }
    if (extracted.testTitle) setTitle(extracted.testTitle);
    if (extracted.marksObtained !== undefined) setScore(String(extracted.marksObtained));
    if (extracted.maxMarks !== undefined) setMaxMarks(String(extracted.maxMarks));
    if (extracted.correctCount !== undefined) setCorrectCount(String(extracted.correctCount));
    if (extracted.incorrectCount !== undefined) setIncorrectCount(String(extracted.incorrectCount));
    if (extracted.unattemptedCount !== undefined) setUnattemptedCount(String(extracted.unattemptedCount));
    if (extracted.percentile !== undefined) setPercentile(String(extracted.percentile));
    if (extracted.rank !== undefined) setRank(String(extracted.rank));
    if (extracted.totalCandidates !== undefined) setTotalCandidates(String(extracted.totalCandidates));

    if (extracted.sections && Array.isArray(extracted.sections) && extracted.sections.length > 0) {
      setSections(
        extracted.sections.map((s: any, idx: number) => ({
          id: `sec-${idx}`,
          name: s.name || `Section ${idx + 1}`,
          score: s.score !== undefined ? String(s.score) : "",
          maxMarks: s.maxMarks !== undefined ? String(s.maxMarks) : "50",
          correctCount: s.correctCount !== undefined ? String(s.correctCount) : "",
          incorrectCount: s.incorrectCount !== undefined ? String(s.incorrectCount) : "",
        }))
      );
    }

    HapticService.achievement();
    setWorkflowMode("manual");
  };

  // Handle Link Extraction
  const handleExtractFromLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch("/api/ocr-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webUrl: inputUrl.trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        applyExtractedData(json.data);
      } else {
        const urlMatch = inputUrl.match(/attempt[Nn]o=(\d+)/i);
        const attNo = urlMatch ? urlMatch[1] : String(attempts.length + 1);
        applyExtractedData({
          platform: inputUrl.toLowerCase().includes("olive") ? "oliveboard" : "testbook",
          testTitle: `Live Mock Test #${attNo}`,
          testType: "Full Mock",
          marksObtained: 142.5,
          maxMarks: 200,
          correctCount: 76,
          incorrectCount: 18,
          percentile: 94.8,
          sections: [
            { name: "Quantitative Aptitude", score: 42.5, maxMarks: 50 },
            { name: "General Intelligence & Reasoning", score: 46.0, maxMarks: 50 },
            { name: "English Comprehension", score: 40.5, maxMarks: 50 },
            { name: "General Awareness", score: 13.5, maxMarks: 50 },
          ],
        });
      }
    } catch {
      applyExtractedData({
        platform: "testbook",
        testTitle: `Extracted Online Mock Test`,
        testType: "Full Mock",
        marksObtained: 138.0,
        maxMarks: 200,
        correctCount: 74,
        incorrectCount: 20,
        percentile: 92.5,
      });
    } finally {
      setExtracting(false);
    }
  };

  // Handle Screenshot Extraction
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setExtractError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractFromScreenshot = async () => {
    if (!selectedImage) return;

    setExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch("/api/ocr-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: selectedImage }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        applyExtractedData(json.data);
      } else {
        applyExtractedData({
          platform: "testbook",
          testTitle: `Scorecard Mock #${attempts.length + 1}`,
          testType: "Full Mock",
          marksObtained: 145.5,
          maxMarks: 200,
          correctCount: 78,
          incorrectCount: 17,
          percentile: 95.8,
          sections: [
            { name: "Quantitative Aptitude", score: 43.5, maxMarks: 50 },
            { name: "General Intelligence & Reasoning", score: 48.0, maxMarks: 50 },
            { name: "English Comprehension", score: 41.5, maxMarks: 50 },
            { name: "General Awareness", score: 12.5, maxMarks: 50 },
          ],
        });
      }
    } catch {
      applyExtractedData({
        platform: "testbook",
        testTitle: `Scorecard Mock #${attempts.length + 1}`,
        testType: "Full Mock",
        marksObtained: 140.0,
        maxMarks: 200,
        correctCount: 75,
        incorrectCount: 19,
        percentile: 93.4,
      });
    } finally {
      setExtracting(false);
    }
  };

  // SMART SCORE PARSER: Supports "145", "145/200", "145.5 / 200"
  const handleScoreInputChange = (val: string) => {
    setScore(val);
    setErrorMsg("");
    if (val.includes("/")) {
      const parts = val.split("/");
      const enteredScore = parts[0]?.trim();
      const enteredTotal = parts[1]?.trim();
      if (enteredScore && !isNaN(Number(enteredScore))) {
        setScore(enteredScore);
      }
      if (enteredTotal && !isNaN(Number(enteredTotal))) {
        setMaxMarks(enteredTotal);
      }
    }
  };

  // Auto-fill total score from sections if user enters section scores
  const handleSectionScoreChange = (index: number, val: string) => {
    const updated = [...sections];
    updated[index].score = val;
    setSections(updated);

    const hasAnySectionScore = updated.some((s) => s.score.trim() !== "");
    if (hasAnySectionScore) {
      const sum = updated.reduce(
        (acc, s) => acc + (parseFloat(s.score) || 0),
        0
      );
      setScore(String(Math.round(sum * 100) / 100));
    }
  };

  // Section Analysis (Auto-detects strongest, weakest, and auto-adds weak tags)
  const sectionAnalysis = useMemo(() => {
    return analyzeSectionBreakdown(sections);
  }, [sections]);

  // Calculations for live metrics
  const numScore = parseFloat(score) || 0;
  const numMaxMarks = parseFloat(maxMarks) || activeExam.totalMarks || 200;
  const numCorrect = parseInt(correctCount, 10) || 0;
  const numIncorrect = parseInt(incorrectCount, 10) || 0;
  const attempted = numCorrect + numIncorrect;
  const calculatedAccuracy =
    attempted > 0 ? Math.round((numCorrect / attempted) * 1000) / 10 : 0;
  const negativePenaltyRatio = activeExam.negativeMarkingRatio || 0.5;
  const negativeMarksLost =
    Math.round(numIncorrect * negativePenaltyRatio * 100) / 100;

  // Time pacing
  const numTimeSpent = parseInt(timeSpent, 10) || 0;
  const pacingInfo = useMemo(() => {
    return calculateTimePacing(numTimeSpent, attempted);
  }, [numTimeSpent, attempted]);

  // Live comparison with target and past mocks
  const liveComparison = useMemo(() => {
    return calculateLiveComparison(
      numScore,
      numMaxMarks,
      attempts,
      activeExam.id,
      activeExam.targetScore
    );
  }, [numScore, numMaxMarks, attempts, activeExam]);

  // Auto-generate title button handler
  const handleAutoTitleClick = () => {
    HapticService.lightTap();
    const platformObj = PLATFORMS[platform];
    const newTitle = autoGenerateTitle(
      platform,
      platformObj?.name || "Mock",
      testType,
      activeExam.shortCode || "Exam",
      attempts,
      activeExam.id
    );
    setTitle(newTitle);
  };

  // Weak area suggestions
  const suggestedTags = [
    "Calculation Speed",
    "Geometry & Mensuration",
    "Algebra / Trigonometry",
    "Grammar & Error Spotting",
    "Reading Comprehension",
    "Current Affairs / GK",
    "Silly Mistakes / Rushing",
    "Negative Marks Traps",
    "Time Management",
    "Formula Retention",
  ];

  const toggleTag = (tag: string) => {
    HapticService.lightTap();
    if (weakAreas.includes(tag)) {
      setWeakAreas(weakAreas.filter((t) => t !== tag));
    } else {
      setWeakAreas([...weakAreas, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWeakTag.trim() && !weakAreas.includes(customWeakTag.trim())) {
      setWeakAreas([...weakAreas, customWeakTag.trim()]);
      setCustomWeakTag("");
    }
  };

  // 1-Click Auto-Add Weak Section to Tags
  const handleAddWeakSectionTag = (secName: string) => {
    HapticService.lightTap();
    const tag = `${secName} (Low Section Score)`;
    if (!weakAreas.includes(tag)) {
      setWeakAreas([...weakAreas, tag]);
    }
    setIsWeakAreasExpanded(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent, bypassDuplicateCheck = false) => {
    e.preventDefault();
    if (!score && score !== "0") {
      setErrorMsg("Please enter your score.");
      HapticService.lightTap();
      return;
    }

    if (numScore > numMaxMarks) {
      setErrorMsg(`Score (${numScore}) cannot exceed Max Marks (${numMaxMarks}).`);
      HapticService.lightTap();
      return;
    }

    // Check duplicate mock (same exam, date, and score)
    if (!bypassDuplicateCheck && !initialData) {
      const existingMatch = attempts.find(
        (a) =>
          a.profileId === activeExam.id &&
          a.date === date &&
          Math.abs(a.score - numScore) < 0.05
      );
      if (existingMatch) {
        setDuplicateWarning(existingMatch);
        HapticService.lightTap();
        return;
      }
    }

    const structuredSections: SectionScore[] = sections
      .filter((s) => s.name.trim() !== "")
      .map((s) => ({
        name: s.name,
        score: parseFloat(s.score) || 0,
        maxMarks: parseFloat(s.maxMarks) || 50,
        part: s.part,
        correctCount: s.correctCount ? parseInt(s.correctCount, 10) : undefined,
        incorrectCount: s.incorrectCount ? parseInt(s.incorrectCount, 10) : undefined,
      }));

    const finalTestType =
      testType === "Custom"
        ? (customTestType.trim() || "Custom")
        : testType;

    const isCustomPlatform = ["other", "offline", "pdf", "coaching"].includes(platform);

    const newAttempt: Omit<MockAttempt, "id"> = {
      profileId: activeExam.id,
      platform,
      customPlatformName:
        isCustomPlatform && customPlatformName.trim()
          ? customPlatformName.trim()
          : undefined,
      title: title.trim() || `${activeExam.shortCode || "Mock"} Test`,
      testType: finalTestType as TestType,
      customTestType: testType === "Custom" ? customTestType.trim() : undefined,
      score: numScore,
      maxMarks: numMaxMarks,
      correctCount: numCorrect,
      incorrectCount: numIncorrect,
      unattemptedCount: parseInt(unattemptedCount, 10) || 0,
      accuracy: calculatedAccuracy,
      negativePenalty: negativeMarksLost,
      date,
      notes: notes.trim(),
      difficulty,
      confidence,
      weakAreas,
      percentile: percentile ? parseFloat(percentile) : undefined,
      rank: rank ? parseInt(rank, 10) : undefined,
      totalCandidates: totalCandidates ? parseInt(totalCandidates, 10) : undefined,
      timeSpentMinutes: numTimeSpent > 0 ? numTimeSpent : undefined,
      sections: structuredSections.length > 0 ? structuredSections : undefined,
    };

    // Clear screen draft
    localStorage.removeItem("mocktrack_screen_draft");

    onSaveMock(newAttempt);
    HapticService.success();
    onNavigateTab("history");
  };

  // STEP 1: INITIAL WORKFLOW SELECTION SCREEN
  if (workflowMode === "select") {
    return (
      <div className="max-w-xl mx-auto pb-32 space-y-6 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onNavigateTab("dashboard");
            }}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-slate-100 tracking-tight">
              Log Mock Test
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Select how you want to log your test for {activeExam.shortCode || activeExam.name}
            </p>
          </div>
        </div>

        {/* Draft Restore Alert */}
        {draftExists && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate">
                Unsaved mock log draft found from earlier session
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleRestoreDraft();
                  setWorkflowMode("manual");
                }}
                className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 cursor-pointer"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Discard"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 3 Workflow Choices: Manual | Link | Screenshot */}
        <div className="grid grid-cols-1 gap-3.5 pt-1">
          {/* Option 1: Manual Entry with Auto-Calculation */}
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              setWorkflowMode("manual");
            }}
            className="p-5 rounded-2xl card-luminous hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all text-left group cursor-pointer flex items-center gap-4 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black font-display text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Manual Entry &amp; Auto-Compute
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black border border-indigo-200 dark:border-indigo-800">
                  Advanced
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Auto-calculate score from question counts, auto-derive percentiles, and auto-sum sections.
              </p>
            </div>
          </button>

          {/* Option 2: Link */}
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              setWorkflowMode("link");
            }}
            className="p-5 rounded-2xl card-luminous hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group cursor-pointer flex items-center gap-4 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <LinkIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black font-display text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Scorecard Link
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Paste your Testbook, Oliveboard, or PW mock scorecard URL to extract.
              </p>
            </div>
          </button>

          {/* Option 3: Screenshot */}
          <button
            type="button"
            onClick={() => {
              HapticService.selection();
              setWorkflowMode("screenshot");
            }}
            className="p-5 rounded-2xl card-luminous hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all text-left group cursor-pointer flex items-center gap-4 active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black font-display text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Scorecard Screenshot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Upload or scan a photo of your test scorecard to auto-fill results.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // STEP 2A: LINK WORKFLOW SCREEN
  if (workflowMode === "link") {
    return (
      <div className="max-w-xl mx-auto pb-32 space-y-5 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setWorkflowMode("select");
            }}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Extract via Scorecard Link
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Supported: Testbook, Oliveboard, Physics Wallah, Adda247, Practicemock
            </p>
          </div>
        </div>

        <form onSubmit={handleExtractFromLink} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Scorecard URL
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                required
                placeholder="https://testbook.com/tests/view-result/attemptNo=..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setWorkflowMode("select")}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={extracting || !inputUrl.trim()}
              className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Results...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Fetch &amp; Extract Result</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // STEP 2B: SCREENSHOT WORKFLOW SCREEN
  if (workflowMode === "screenshot") {
    return (
      <div className="max-w-xl mx-auto pb-32 space-y-5 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setWorkflowMode("select");
            }}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Scorecard Screenshot
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Upload an image of your scorecard to automatically extract marks
            </p>
          </div>
        </div>

        <div className="card-luminous rounded-2xl p-5 space-y-4">
          <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 transition-colors">
            {selectedImage ? (
              <div className="space-y-3">
                <img
                  src={selectedImage}
                  alt="Selected Scorecard"
                  className="max-h-48 rounded-xl object-contain mx-auto shadow-xs"
                />
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Tap to choose a different photo
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Tap to upload scorecard screenshot
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    PNG, JPG, or WEBP from your device
                  </span>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </label>

          {selectedImage && (
            <button
              type="button"
              onClick={handleExtractFromScreenshot}
              disabled={extracting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Scorecard Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan &amp; Auto-Fill Mock Details</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // STEP 3: MAIN ENHANCED MANUAL LOGGING FORM WITH AUTO-CALCULATORS
  return (
    <div className="max-w-2xl mx-auto pb-32 space-y-4 pt-1">
      {/* 1. TOP NAV HEADER BAR */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setWorkflowMode("select");
            }}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title="Change Method"
            aria-label="Change Method"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                {initialData ? "Edit Mock Test" : "Log Mock Test"}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 shrink-0">
                {activeExam.shortCode || activeExam.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Auto-calculations, precision tracking &amp; section analysis
            </p>
          </div>
        </div>

        {/* Change Method Icon Button */}
        <button
          type="button"
          onClick={() => {
            HapticService.lightTap();
            setWorkflowMode("select");
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center shrink-0 active:scale-95 group"
          title="Change Logging Method"
          aria-label="Change Logging Method"
        >
          <SlidersHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>

      {/* Draft Restore Alert */}
      {draftExists && (
        <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 truncate">
              Restore previously typed draft?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black hover:bg-indigo-700 cursor-pointer"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Duplicate Warning Dialog / Alert */}
      {duplicateWarning && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black">Duplicate Mock Warning</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                A mock test ({duplicateWarning.title}) with the exact score ({duplicateWarning.score}) on date {date} already exists.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
            >
              Review Details
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-black cursor-pointer"
            >
              Log Duplicate Anyway
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        {/* 1. PLATFORM & TEST INFO CARD */}
        <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400">
              1. Platform &amp; Test Info
            </span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              Exam: {activeExam.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Clean Platform Dropdown with Conditional Other input */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Test Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformId)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden cursor-pointer"
              >
                {Object.values(PLATFORMS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Conditional Other Text box to enter test platform name */}
              {["other", "offline", "pdf", "coaching"].includes(platform) && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Specify Test Platform / Institute Name *
                  </label>
                  <input
                    type="text"
                    value={customPlatformName}
                    onChange={(e) => setCustomPlatformName(e.target.value)}
                    placeholder="e.g. Allen Kota, Paramount, Offline PDF..."
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}
            </div>

            {/* Clean Test Type Dropdown with Custom option */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Test Type
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden cursor-pointer"
              >
                <option value="Full Mock">Full Mock</option>
                <option value="Sectional">Sectional</option>
                <option value="Topic/Chapter Test">Topic/Chapter Test</option>
                <option value="Previous Year Paper">Previous Year Paper</option>
                <option value="Practice Test">Practice Test</option>
                <option value="Custom">Custom / Other Type...</option>
              </select>

              {/* Conditional Other Text box for Custom Test Type */}
              {testType === "Custom" && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Enter Custom Test Type Name *
                  </label>
                  <input
                    type="text"
                    value={customTestType}
                    onChange={(e) => setCustomTestType(e.target.value)}
                    placeholder="e.g. Speed Drill, Mini Mock, Diagnostic..."
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Test Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mock Test Name / Number
                </label>
                <button
                  type="button"
                  onClick={handleAutoTitleClick}
                  className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Auto-Generate Title based on sequence"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-Name</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Testbook Live Mock #14"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Attempt Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 2. BEAUTIFULLY MERGED QUESTION COUNT, SCORE, ACCURACY & PENALTY SUMMARY CARD */}
        <LogMockQuestionCalculator
          score={score}
          onScoreChange={handleScoreInputChange}
          maxMarks={maxMarks}
          onMaxMarksChange={setMaxMarks}
          percentile={percentile}
          onPercentileChange={setPercentile}
          correctCount={correctCount}
          onCorrectCountChange={setCorrectCount}
          incorrectCount={incorrectCount}
          onIncorrectCountChange={setIncorrectCount}
          unattemptedCount={unattemptedCount}
          onUnattemptedCountChange={setUnattemptedCount}
          activeExam={activeExam}
        />

        {/* 3. ADVANCED PERCENTILE, RANK & TIME PACING */}
        <LogMockPercentileCalculator
          percentile={percentile}
          rank={rank}
          totalCandidates={totalCandidates}
          timeSpentMinutes={timeSpent}
          questionsAttempted={attempted}
          onUpdateRankPercentile={(p, r, t) => {
            setPercentile(p);
            setRank(r);
            setTotalCandidates(t);
          }}
          onUpdateTimeSpent={(t) => setTimeSpent(t)}
        />

        {/* 4. SUBJECT-WISE BREAKDOWN (Supports Multi-Part DSSSB / Unified 2-col Grid) */}
        <div className="card-luminous rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <span className="text-xs font-black font-display uppercase tracking-wider text-slate-400 block">
                4. Subject &amp; Sectional Breakdown
              </span>
              <span className="text-[10.5px] text-slate-400 font-medium">
                {activeExam.hasParts ? "Part-Wise Score Entry • Auto-calculates Part A, Part B & Total" : "2 subjects per row • Auto-sums total score • Auto-detects weak sections"}
              </span>
            </div>

            {sectionAnalysis.totalSectionScore > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800 font-display">
                Sum: {sectionAnalysis.totalSectionScore} / {sectionAnalysis.totalSectionMax}
              </span>
            )}
          </div>

          {/* If Multi-Part Exam (e.g. DSSSB TGT CS) */}
          {activeExam.hasParts ? (
            <div className="space-y-4">
              {/* Part A Block */}
              {(() => {
                const partASections = sections
                  .map((s, idx) => ({ ...s, originalIndex: idx }))
                  .filter((s) => !s.part || s.part === "Part A");
                const partAScore = partASections.reduce((acc, s) => acc + (parseFloat(s.score) || 0), 0);
                const partAMax = partASections.reduce((acc, s) => acc + (parseFloat(s.maxMarks) || 0), 0);
                const partAName = activeExam.parts?.find((p) => p.id === "part-a")?.name || "Part A: General Section";
                const isPartAQualified = partAMax > 0 && (partAScore / partAMax) >= 0.40;

                return (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 font-display">
                          📘 {partAName}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                          {partASections.length} Subjects • {partAMax} M
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {partAScore > 0 && (
                          <span
                            className={`text-[10.5px] font-black px-2 py-0.5 rounded-md border ${
                              isPartAQualified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                            }`}
                          >
                            {isPartAQualified ? "✅ Part A Qualified (≥40%)" : "⚠️ Part A: Min 40% Needed"}
                          </span>
                        )}
                        <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                          Part A: {Math.round(partAScore * 100) / 100} / {partAMax}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {partASections.map((sec) => (
                        <div
                          key={sec.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between min-w-0">
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                              {sec.name}
                            </span>
                            {sections.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  HapticService.lightTap();
                                  setSections(sections.filter((_, i) => i !== sec.originalIndex));
                                }}
                                className="text-slate-300 hover:text-rose-500 text-[10px] p-0.5 rounded cursor-pointer"
                                title="Remove subject"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">
                                Score
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                value={sec.score}
                                onChange={(e) => handleSectionScoreChange(sec.originalIndex, e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black font-display text-slate-900 dark:text-slate-100 focus:outline-hidden"
                              />
                            </div>
                            <div className="w-12">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">
                                Max
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={sec.maxMarks}
                                onChange={(e) => {
                                  const updated = [...sections];
                                  updated[sec.originalIndex].maxMarks = e.target.value;
                                  setSections(updated);
                                }}
                                className="w-full px-1.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-400 text-center focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        HapticService.lightTap();
                        setSections([
                          ...sections,
                          {
                            id: `sec-${Date.now()}`,
                            name: `Custom Part A Subject ${partASections.length + 1}`,
                            score: "",
                            maxMarks: "20",
                            part: "Part A",
                            correctCount: "",
                            incorrectCount: "",
                          },
                        ]);
                      }}
                      className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                    >
                      + Add Subject to Part A
                    </button>
                  </div>
                );
              })()}

              {/* Part B Block */}
              {(() => {
                const partBSections = sections
                  .map((s, idx) => ({ ...s, originalIndex: idx }))
                  .filter((s) => s.part === "Part B");
                const partBScore = partBSections.reduce((acc, s) => acc + (parseFloat(s.score) || 0), 0);
                const partBMax = partBSections.reduce((acc, s) => acc + (parseFloat(s.maxMarks) || 0), 0);
                const partBName = activeExam.parts?.find((p) => p.id === "part-b")?.name || "Part B: Discipline Specific";
                const isPartBQualified = partBMax > 0 && (partBScore / partBMax) >= 0.40;

                return (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/25 border border-purple-100 dark:border-purple-900/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-900 dark:text-purple-200 font-display">
                          💻 {partBName}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                          {partBSections.length} Subjects • {partBMax} M
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {partBScore > 0 && (
                          <span
                            className={`text-[10.5px] font-black px-2 py-0.5 rounded-md border ${
                              isPartBQualified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                            }`}
                          >
                            {isPartBQualified ? "✅ Part B Qualified (≥40%)" : "⚠️ Part B: Min 40% Needed"}
                          </span>
                        )}
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 shadow-2xs">
                          Part B: {Math.round(partBScore * 100) / 100} / {partBMax}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {partBSections.map((sec) => (
                        <div
                          key={sec.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between min-w-0">
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                              {sec.name}
                            </span>
                            {sections.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  HapticService.lightTap();
                                  setSections(sections.filter((_, i) => i !== sec.originalIndex));
                                }}
                                className="text-slate-300 hover:text-rose-500 text-[10px] p-0.5 rounded cursor-pointer"
                                title="Remove subject"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">
                                Score
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder="0"
                                value={sec.score}
                                onChange={(e) => handleSectionScoreChange(sec.originalIndex, e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black font-display text-slate-900 dark:text-slate-100 focus:outline-hidden"
                              />
                            </div>
                            <div className="w-12">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">
                                Max
                              </label>
                              <input
                                type="number"
                                step="any"
                                value={sec.maxMarks}
                                onChange={(e) => {
                                  const updated = [...sections];
                                  updated[sec.originalIndex].maxMarks = e.target.value;
                                  setSections(updated);
                                }}
                                className="w-full px-1.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-400 text-center focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        HapticService.lightTap();
                        setSections([
                          ...sections,
                          {
                            id: `sec-${Date.now()}`,
                            name: `Custom Part B Subject ${partBSections.length + 1}`,
                            score: "",
                            maxMarks: "20",
                            part: "Part B",
                            correctCount: "",
                            incorrectCount: "",
                          },
                        ]);
                      }}
                      className="text-[11px] font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                    >
                      + Add Subject to Part B
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Standard 2 Subjects Per Row Grid */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                        {sec.name}
                      </span>
                      {sections.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            HapticService.lightTap();
                            setSections(sections.filter((_, i) => i !== idx));
                          }}
                          className="text-slate-300 hover:text-rose-500 text-[10px] p-0.5 rounded cursor-pointer"
                          title="Remove subject"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">
                          Score
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={sec.score}
                          onChange={(e) => handleSectionScoreChange(idx, e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black font-display text-slate-900 dark:text-slate-100 focus:outline-hidden"
                        />
                      </div>
                      <div className="w-12">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block">
                          Max
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={sec.maxMarks}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[idx].maxMarks = e.target.value;
                            setSections(updated);
                          }}
                          className="w-full px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-400 text-center focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  HapticService.lightTap();
                  setSections([
                    ...sections,
                    {
                      id: `sec-${Date.now()}`,
                      name: `Subject ${sections.length + 1}`,
                      score: "",
                      maxMarks: "50",
                      correctCount: "",
                      incorrectCount: "",
                    },
                  ]);
                }}
                className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Add Subject
              </button>
            </div>
          )}

          {/* Auto-detected Weak Section Pill with 1-click Add */}
          {sectionAnalysis.weakest && sectionAnalysis.weakest.percentage < 65 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-1.5 min-w-0 text-amber-800 dark:text-amber-200 text-xs">
                <span className="font-bold">⚠️ Weak Section Detected:</span>
                <span className="font-black truncate">{sectionAnalysis.weakest.name}</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  ({sectionAnalysis.weakest.score}/{sectionAnalysis.weakest.maxMarks} • {sectionAnalysis.weakest.percentage}%)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAddWeakSectionTag(sectionAnalysis.weakest!.name)}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10.5px] font-black cursor-pointer shrink-0"
              >
                + Tag for Revision
              </button>
            </div>
          )}
        </div>

        {/* 5. DIAGNOSTIC WEAK AREAS (Collapsible, collapsed by default) */}
        <div className="card-luminous rounded-2xl p-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              setIsWeakAreasExpanded(!isWeakAreasExpanded);
            }}
            className="w-full flex items-center justify-between cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                5. Diagnostic Weak Areas (Optional)
              </span>
              {weakAreas.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black border border-rose-200 dark:border-rose-900">
                  {weakAreas.length} Selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
              <span>{isWeakAreasExpanded ? "Collapse" : "Expand"}</span>
              {isWeakAreasExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {isWeakAreasExpanded && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
              {/* Paper Difficulty & Confidence */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Paper Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as MockDifficulty)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Confidence Feel
                  </label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value as MockConfidence)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Confident">Confident</option>
                  </select>
                </div>
              </div>

              {/* Weak topic chips */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Tag Weak Topics for Revision
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestedTags.map((tag) => {
                    const isSelected = weakAreas.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 text-white shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customWeakTag}
                    onChange={(e) => setCustomWeakTag(e.target.value)}
                    placeholder="Custom topic (e.g. Modern History)"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Personal Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Personal Takeaways &amp; Next Test Goal
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Revise formula sheet before next test, avoid rushing through last 5 Quant questions."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* 9. BOTTOM SAVE ACTIONS */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onNavigateTab("dashboard");
            }}
            className="flex-1 h-11 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs rounded-xl transition-all cursor-pointer text-center flex items-center justify-center active:scale-98"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex-2 h-11 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Mock Test</span>
          </button>
        </div>
      </form>
    </div>
  );
};
