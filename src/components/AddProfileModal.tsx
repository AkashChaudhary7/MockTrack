import React, { useState } from "react";
import { ExamProfile, ExamSubjectConfig, ExamCategory, ExamPartConfig } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Plus,
  Sparkles,
  Trash2,
  Layers,
  BookOpen,
  CheckCircle2,
  Clock,
  Target,
  HelpCircle,
} from "lucide-react";
import { HapticService } from "../services/HapticService";

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (profile: ExamProfile) => void;
}

const COMMON_SUBJECT_SUGGESTIONS = [
  "General Awareness",
  "General Intelligence & Reasoning",
  "Quantitative Aptitude",
  "English Comprehension",
  "Hindi Language",
  "Computer Science & IT Domain",
  "Teaching Methodology & Pedagogy",
  "Rajasthan GK & Culture",
  "UP Special GK",
  "General Science",
  "Basic Computer",
  "Child Development & Pedagogy",
  "Statistics",
  "Economics",
];

export const AddProfileModal: React.FC<AddProfileModalProps> = ({
  isOpen,
  onClose,
  onAddProfile,
}) => {
  const [name, setName] = useState<string>("");
  const [shortCode, setShortCode] = useState<string>("");
  const [category, setCategory] = useState<ExamCategory>("CUSTOM");
  const [icon, setIcon] = useState<string>("💻");
  const [hasParts, setHasParts] = useState<boolean>(true);
  const [partAName, setPartAName] = useState<string>("Part A: General Section");
  const [partBName, setPartBName] = useState<string>("Part B: Discipline Specific");

  // Subject List
  const [subjects, setSubjects] = useState<ExamSubjectConfig[]>([
    { id: "sub-1", name: "General Awareness", maxMarks: 20, part: "Part A" },
    { id: "sub-2", name: "General Intelligence & Reasoning", maxMarks: 20, part: "Part A" },
    { id: "sub-3", name: "Arithmetical & Numerical Ability", maxMarks: 20, part: "Part A" },
    { id: "sub-4", name: "Hindi Language & Comprehension", maxMarks: 20, part: "Part A" },
    { id: "sub-5", name: "English Language & Comprehension", maxMarks: 20, part: "Part A" },
    { id: "sub-6", name: "Computer Science & IT Domain", maxMarks: 90, part: "Part B" },
    { id: "sub-7", name: "Teaching Methodology & Pedagogy", maxMarks: 10, part: "Part B" },
  ]);

  const [duration, setDuration] = useState<number>(120);
  const [penaltyRatio, setPenaltyRatio] = useState<number>(0.25);
  const [targetScore, setTargetScore] = useState<number>(140);
  const [examDate, setExamDate] = useState<string>("");

  if (!isOpen) return null;

  // Auto-calculated total marks from subjects sum
  const totalCalculatedMarks = subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
  const partASum = subjects.filter((s) => s.part === "Part A").reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
  const partBSum = subjects.filter((s) => s.part === "Part B").reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);

  const applyTemplate = (type: "dsssb_cs" | "ssc_cgl" | "banking" | "upsc" | "state_150" | "blank") => {
    HapticService.lightTap();
    if (type === "dsssb_cs") {
      setName("DSSSB TGT Computer Science");
      setShortCode("DSSSB CS");
      setCategory("DSSSB");
      setIcon("💻");
      setHasParts(true);
      setPartAName("Part A: General Section");
      setPartBName("Part B: Discipline Specific");
      setDuration(120);
      setPenaltyRatio(0.25);
      setTargetScore(135);
      setSubjects([
        { id: "sub-1", name: "General Awareness", maxMarks: 20, part: "Part A" },
        { id: "sub-2", name: "General Intelligence & Reasoning", maxMarks: 20, part: "Part A" },
        { id: "sub-3", name: "Arithmetical & Numerical Ability", maxMarks: 20, part: "Part A" },
        { id: "sub-4", name: "Hindi Language & Comprehension", maxMarks: 20, part: "Part A" },
        { id: "sub-5", name: "English Language & Comprehension", maxMarks: 20, part: "Part A" },
        { id: "sub-6", name: "Computer Science & IT Domain", maxMarks: 90, part: "Part B" },
        { id: "sub-7", name: "Teaching Methodology & Pedagogy", maxMarks: 10, part: "Part B" },
      ]);
    } else if (type === "ssc_cgl") {
      setName("SSC CGL Tier-1");
      setShortCode("SSC CGL");
      setCategory("SSC");
      setIcon("🦅");
      setHasParts(false);
      setDuration(60);
      setPenaltyRatio(0.5);
      setTargetScore(160);
      setSubjects([
        { id: "sub-1", name: "Quantitative Aptitude", maxMarks: 50 },
        { id: "sub-2", name: "General Intelligence & Reasoning", maxMarks: 50 },
        { id: "sub-3", name: "English Comprehension", maxMarks: 50 },
        { id: "sub-4", name: "General Awareness", maxMarks: 50 },
      ]);
    } else if (type === "banking") {
      setName("IBPS / SBI PO Prelims");
      setShortCode("BANK PO");
      setCategory("BANK");
      setIcon("🏦");
      setHasParts(false);
      setDuration(60);
      setPenaltyRatio(0.25);
      setTargetScore(75);
      setSubjects([
        { id: "sub-1", name: "Quantitative Aptitude", maxMarks: 35 },
        { id: "sub-2", name: "Reasoning Ability", maxMarks: 35 },
        { id: "sub-3", name: "English Language", maxMarks: 30 },
      ]);
    } else if (type === "upsc") {
      setName("UPSC CSE Prelims GS-1");
      setShortCode("UPSC GS-1");
      setCategory("UPSC");
      setIcon("🏛️");
      setHasParts(false);
      setDuration(120);
      setPenaltyRatio(0.66);
      setTargetScore(115);
      setSubjects([
        { id: "sub-1", name: "Indian Polity & Governance", maxMarks: 40 },
        { id: "sub-2", name: "History & Culture", maxMarks: 35 },
        { id: "sub-3", name: "Geography & Ecology", maxMarks: 50 },
        { id: "sub-4", name: "Indian Economy", maxMarks: 35 },
        { id: "sub-5", name: "General Science & Current Affairs", maxMarks: 40 },
      ]);
    } else if (type === "state_150") {
      setName("State PSC / Board Examination");
      setShortCode("State Exam");
      setCategory("STATE");
      setIcon("🏰");
      setHasParts(false);
      setDuration(120);
      setPenaltyRatio(0.33);
      setTargetScore(105);
      setSubjects([
        { id: "sub-1", name: "State History, Art & Culture", maxMarks: 50 },
        { id: "sub-2", name: "State Geography & Economy", maxMarks: 40 },
        { id: "sub-3", name: "Indian Polity & Constitution", maxMarks: 30 },
        { id: "sub-4", name: "General Science & Reasoning", maxMarks: 30 },
      ]);
    } else if (type === "blank") {
      setHasParts(false);
      setSubjects([
        { id: `sub-${Date.now()}-1`, name: "Subject 1", maxMarks: 50 },
        { id: `sub-${Date.now()}-2`, name: "Subject 2", maxMarks: 50 },
      ]);
    }
  };

  const handleAddSubject = () => {
    HapticService.lightTap();
    const newSub: ExamSubjectConfig = {
      id: `sub-${Date.now()}`,
      name: "",
      maxMarks: 20,
      part: hasParts ? "Part A" : undefined,
    };
    setSubjects([...subjects, newSub]);
  };

  const handleUpdateSubject = (id: string, updates: Partial<ExamSubjectConfig>) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleRemoveSubject = (id: string) => {
    HapticService.lightTap();
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    HapticService.success();
    const newId = `custom-profile-${Date.now()}`;
    const code = shortCode.trim() || name.split(" ")[0].toUpperCase();

    const partsConfig: ExamPartConfig[] | undefined = hasParts
      ? [
          { id: "part-a", name: partAName || "Part A: General Section", totalMarks: partASum },
          { id: "part-b", name: partBName || "Part B: Discipline Specific", totalMarks: partBSum },
        ]
      : undefined;

    const newProfile: ExamProfile = {
      id: newId,
      name: name.trim(),
      shortCode: code,
      category,
      icon: icon || "📝",
      totalMarks: totalCalculatedMarks > 0 ? totalCalculatedMarks : 200,
      targetScore: targetScore ? Number(targetScore) : Math.round(totalCalculatedMarks * 0.8),
      defaultDurationMinutes: Number(duration) || 120,
      examDate: examDate || undefined,
      negativeMarkingRatio: Number(penaltyRatio),
      isSelected: true,
      isCustom: true,
      hasParts,
      parts: partsConfig,
      subjects: subjects.map((s) => ({
        ...s,
        name: s.name.trim() || "Subject",
        maxMarks: Number(s.maxMarks) || 20,
      })),
    };

    onAddProfile(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/40 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 font-display">
                Create Custom Exam Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Configure custom subjects, multi-part structure, and marks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              HapticService.lightTap();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Quick Preset Templates</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyTemplate("dsssb_cs")}
                className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                💻 DSSSB TGT CS (2-Part 100+100)
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("ssc_cgl")}
                className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🦅 SSC CGL (4x50M)
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("banking")}
                className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🏦 Banking (3-Sec 100M)
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("upsc")}
                className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🏛️ UPSC GS-1
              </button>
              <button
                type="button"
                onClick={() => applyTemplate("state_150")}
                className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🏰 State Exam (150M)
              </button>
            </div>
          </div>

          {/* Section 1: Basic Exam Info */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Exam Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DSSSB TGT Computer Science 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Short Badge Code
              </label>
              <input
                type="text"
                placeholder="e.g. DSSSB CS"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Icon Emoji
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="💻">💻 Tech / CS</option>
                <option value="🎓">🎓 Teaching</option>
                <option value="🦅">🦅 SSC</option>
                <option value="🏦">🏦 Banking</option>
                <option value="🏛️">🏛️ UPSC / Civil</option>
                <option value="🏰">🏰 RPSC</option>
                <option value="📜">📜 RSSB / Board</option>
                <option value="📝">📝 UPSSSC</option>
                <option value="🛡️">🛡️ Police / Defence</option>
                <option value="🚆">🚆 Railways</option>
                <option value="✨">✨ Custom</option>
              </select>
            </div>
          </div>

          {/* Section 2: Structure & Multi-Part Toggle */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Exam Paper Structure (Part A &amp; Part B)</span>
                </h4>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 font-medium mt-0.5">
                  Enable for exams like DSSSB (Part A General + Part B Discipline)
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasParts}
                  onChange={(e) => {
                    setHasParts(e.target.checked);
                    if (e.target.checked) {
                      setSubjects(
                        subjects.map((s, idx) => ({
                          ...s,
                          part: s.part || (idx < 5 ? "Part A" : "Part B"),
                        }))
                      );
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {hasParts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase mb-1">
                    Part A Title ({partASum} Marks)
                  </label>
                  <input
                    type="text"
                    value={partAName}
                    onChange={(e) => setPartAName(e.target.value)}
                    placeholder="e.g. Part A: General Section"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase mb-1">
                    Part B Title ({partBSum} Marks)
                  </label>
                  <input
                    type="text"
                    value={partBName}
                    onChange={(e) => setPartBName(e.target.value)}
                    placeholder="e.g. Part B: Discipline Specific"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Subject & Marks Creator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Subjects &amp; Marks Breakdown ({subjects.length} Subjects)</span>
                </label>
                <p className="text-[11px] text-slate-500 font-medium">
                  Total Exam Marks: <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{totalCalculatedMarks} Marks</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-black flex items-center gap-1 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Subject</span>
              </button>
            </div>

            {/* List of Subjects */}
            <div className="space-y-2">
              {subjects.map((sub, index) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 flex flex-wrap sm:flex-nowrap items-center gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-black text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Subject Name */}
                  <div className="flex-1 min-w-[160px]">
                    <input
                      type="text"
                      required
                      placeholder="Subject Name (e.g. Computer Science)"
                      value={sub.name}
                      onChange={(e) => handleUpdateSubject(sub.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Part Selector (if hasParts) */}
                  {hasParts && (
                    <div className="w-28 shrink-0">
                      <select
                        value={sub.part || "Part A"}
                        onChange={(e) => handleUpdateSubject(sub.id, { part: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                      >
                        <option value="Part A">Part A</option>
                        <option value="Part B">Part B</option>
                      </select>
                    </div>
                  )}

                  {/* Max Marks */}
                  <div className="w-24 shrink-0 flex items-center gap-1">
                    <input
                      type="number"
                      required
                      min={1}
                      max={1000}
                      value={sub.maxMarks}
                      onChange={(e) => handleUpdateSubject(sub.id, { maxMarks: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="text-[11px] font-extrabold text-slate-400">M</span>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub.id)}
                    disabled={subjects.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Common Suggestion Chips */}
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1.5">
                Quick Add Subjects:
              </span>
              <div className="inline-flex flex-wrap gap-1 mt-1">
                {COMMON_SUBJECT_SUGGESTIONS.filter(
                  (s) => !subjects.some((sub) => sub.name.toLowerCase() === s.toLowerCase())
                ).slice(0, 6).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => {
                      HapticService.lightTap();
                      setSubjects([
                        ...subjects,
                        {
                          id: `sub-${Date.now()}`,
                          name: sugg,
                          maxMarks: 20,
                          part: hasParts ? "Part A" : undefined,
                        },
                      ]);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Marking & Duration Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 120)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Negative Penalty
              </label>
              <select
                value={penaltyRatio}
                onChange={(e) => setPenaltyRatio(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                <option value={0.25}>-0.25 Marks (1/4th - DSSSB / IBPS)</option>
                <option value={0.33}>-0.33 Marks (1/3rd - RPSC / RSSB)</option>
                <option value={0.5}>-0.5 Marks (SSC Tier 1)</option>
                <option value={0.66}>-0.66 Marks (UPSC / UPPSC)</option>
                <option value={1.0}>-1.0 Marks (SSC Tier 2)</option>
                <option value={0}>0 (No Negative Penalty)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Score (Goal)
              </label>
              <input
                type="number"
                placeholder="e.g. 140"
                value={targetScore}
                onChange={(e) => setTargetScore(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-xs"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/90 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-500">
            Total: <span className="font-black text-slate-900 dark:text-slate-100">{totalCalculatedMarks} Marks</span>
            {hasParts && ` (${partASum} + ${partBSum})`}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                HapticService.lightTap();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || subjects.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Save &amp; Activate Profile</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
