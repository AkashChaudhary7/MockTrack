import React, { useState, useEffect } from "react";
import {
  CandidateProfile,
  ExamProfile,
  MockAttempt,
  MistakeReviewItem,
  NavTab,
} from "./types";
import {
  INITIAL_CANDIDATE,
  INITIAL_EXAM_PROFILES,
  INITIAL_MOCK_ATTEMPTS,
  INITIAL_MISTAKES,
} from "./data/mockSeedData";
import { SplashOnboarding } from "./components/SplashOnboarding";
import { TopAppBar } from "./components/TopAppBar";
import { BottomNav } from "./components/BottomNav";
import { DashboardScreen } from "./components/DashboardScreen";
import { LogMockScreen } from "./components/LogMockScreen";
import { MockLogScreen } from "./components/MockLogScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { InsightsScreen } from "./components/InsightsScreen";
import { ReportsScreen } from "./components/ReportsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { AppGuideScreen } from "./components/AppGuideScreen";
import { PrivacyScreen } from "./components/PrivacyScreen";
import { LogMockModal } from "./components/LogMockModal";
import { OcrExtractorModal } from "./components/OcrExtractorModal";
import { ProfileSwitcherModal } from "./components/ProfileSwitcherModal";
import { NameEditModal } from "./components/NameEditModal";
import { SetDateModal } from "./components/SetDateModal";
import { AddProfileModal } from "./components/AddProfileModal";
import { OfflineBanner } from "./components/OfflineBanner";
import { PwaInstallBanner } from "./components/PwaInstallBanner";
import { LanguageProvider } from "./i18n/LanguageContext";
import { StorageService } from "./services/StorageService";
import { firePersonalBestConfetti } from "./utils/confetti";
import { HapticService } from "./services/HapticService";
import { ScoreCardModal } from "./components/ScoreCardModal";
import { detectMilestoneOnMockSave, MilestoneEvent } from "./utils/milestones";

export default function App() {
  const [candidate, setCandidate] = useState<CandidateProfile>(() => {
    const saved = localStorage.getItem("mocktrack_candidate");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear any old demo reviewPoints or demo streak
        if (parsed.reviewPoints === 120 && parsed.reviewStreakDays === 3) {
          const cleaned = {
            ...parsed,
            name: parsed.name === "Aarav Sharma" ? "Aspirant" : parsed.name,
            reviewPoints: 0,
            reviewStreakDays: 0,
            unlockedBadgeIds: [],
          };
          localStorage.setItem("mocktrack_candidate", JSON.stringify(cleaned));
          return cleaned;
        }
        return parsed;
      } catch {
        return INITIAL_CANDIDATE;
      }
    }
    return INITIAL_CANDIDATE;
  });

  const [examProfiles, setExamProfiles] = useState<ExamProfile[]>(() => {
    const saved = localStorage.getItem("mocktrack_profiles");
    return saved ? JSON.parse(saved) : INITIAL_EXAM_PROFILES;
  });

  const [attempts, setAttempts] = useState<MockAttempt[]>(() => {
    const saved = localStorage.getItem("mocktrack_attempts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Guarantee no demo data (filter out any mock-1..mock-7 seed data)
        const nonDemo = Array.isArray(parsed)
          ? parsed.filter((a: MockAttempt) => !a.id?.startsWith("mock-"))
          : [];
        if (nonDemo.length !== parsed.length) {
          localStorage.setItem("mocktrack_attempts", JSON.stringify(nonDemo));
        }
        return nonDemo;
      } catch {
        return [];
      }
    }
    return [];
  });

  const [mistakes, setMistakes] = useState<MistakeReviewItem[]>(() => {
    const saved = localStorage.getItem("mocktrack_mistakes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const nonDemo = Array.isArray(parsed)
          ? parsed.filter((m: MistakeReviewItem) => !m.id?.startsWith("mst-"))
          : [];
        if (nonDemo.length !== parsed.length) {
          localStorage.setItem("mocktrack_mistakes", JSON.stringify(nonDemo));
        }
        return nonDemo;
      } catch {
        return [];
      }
    }
    return [];
  });

  const [weakAreasHistory, setWeakAreasHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("mocktrack_weak_areas_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const search = window.location.search;
      if (path.includes("/privacy") || search.includes("privacy")) {
        return "privacy";
      }
    }
    return "dashboard";
  });
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return false;
  });

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingAttempt, setEditingAttempt] = useState<Partial<MockAttempt> | undefined>(undefined);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState<boolean>(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState<boolean>(false);
  const [isSetDateOpen, setIsSetDateOpen] = useState<boolean>(false);
  const [isAddProfileOpen, setIsAddProfileOpen] = useState<boolean>(false);
  const [isScoreCardOpen, setIsScoreCardOpen] = useState<boolean>(false);
  const [scoreCardMilestoneTitle, setScoreCardMilestoneTitle] = useState<string | undefined>(undefined);
  const [activeMilestone, setActiveMilestone] = useState<MilestoneEvent | null>(null);

  // Hydrate from IndexedDB on initial load
  useEffect(() => {
    async function loadIndexedDB() {
      try {
        const idbAttempts = await StorageService.getAttempts();
        if (idbAttempts && idbAttempts.length > 0) {
          setAttempts(idbAttempts);
        } else {
          // seed idb with initial attempts
          await StorageService.saveAttempts(INITIAL_MOCK_ATTEMPTS);
        }
      } catch (err) {
        console.warn("IndexedDB load fallback:", err);
      }
    }
    loadIndexedDB();
  }, []);

  // Sync state to LocalStorage and IndexedDB
  useEffect(() => {
    localStorage.setItem("mocktrack_candidate", JSON.stringify(candidate));
  }, [candidate]);

  useEffect(() => {
    localStorage.setItem("mocktrack_profiles", JSON.stringify(examProfiles));
    StorageService.saveExamProfiles(examProfiles).catch(() => {});
  }, [examProfiles]);

  useEffect(() => {
    localStorage.setItem("mocktrack_attempts", JSON.stringify(attempts));
    StorageService.saveAttempts(attempts).catch(() => {});
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem("mocktrack_mistakes", JSON.stringify(mistakes));
  }, [mistakes]);

  useEffect(() => {
    localStorage.setItem("mocktrack_weak_areas_history", JSON.stringify(weakAreasHistory));
  }, [weakAreasHistory]);

  // Perfect Theme Synchronization for Dark, Light, and System Modes
  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    const updateTheme = () => {
      let isDark = false;
      if (candidate.theme === "dark") {
        isDark = true;
      } else if (candidate.theme === "light") {
        isDark = false;
      } else {
        // System mode: query OS preference
        isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      if (isDark) {
        root.classList.add("dark");
        metaThemeColor?.setAttribute("content", "#020617");
      } else {
        root.classList.remove("dark");
        metaThemeColor?.setAttribute("content", "#f8fafc");
      }
    };

    updateTheme();

    if (candidate.theme === "system" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = () => updateTheme();
      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
  }, [candidate.theme]);

  // Active exam profile
  const activeExam =
    examProfiles.find((p) => p.id === candidate.activeExamProfileId) ||
    examProfiles[0] ||
    INITIAL_EXAM_PROFILES[0];

  // Explicit Theme Setting (light, dark, system)
  const handleSetTheme = (newTheme: "light" | "dark" | "system") => {
    setCandidate((prev) => ({
      ...prev,
      theme: newTheme,
    }));
  };

  // Quick theme toggle in top bar (cycles light -> dark -> system)
  const handleToggleTheme = () => {
    setCandidate((prev) => {
      let nextTheme: "light" | "dark" | "system";
      if (prev.theme === "light") nextTheme = "dark";
      else if (prev.theme === "dark") nextTheme = "system";
      else nextTheme = "light";
      return { ...prev, theme: nextTheme };
    });
  };

  // Profile Selection
  const handleSelectProfile = (id: string) => {
    setCandidate((prev) => ({ ...prev, activeExamProfileId: id }));
  };

  // Save weak areas history
  const handleSaveWeakAreasHistory = (newAreas: string[]) => {
    setWeakAreasHistory((prev) => {
      const set = new Set([...prev, ...newAreas]);
      return Array.from(set);
    });
  };

  // Open Share Score Card Modal
  const handleOpenScoreCard = (milestoneTitle?: string) => {
    setScoreCardMilestoneTitle(milestoneTitle);
    setIsScoreCardOpen(true);
    HapticService.lightTap();
  };

  // Update candidate weekly goal
  const handleUpdateWeeklyGoal = (newGoal: number) => {
    setCandidate((prev) => ({ ...prev, weeklyGoal: newGoal }));
  };

  // Save / Update Mock
  const handleSaveMock = async (newAttemptData: Omit<MockAttempt, "id">) => {
    // Check if new attempt achieves a new personal best score for the exam profile
    const existingExamAttempts = attempts.filter(
      (a) => a.profileId === newAttemptData.profileId && a.id !== editingAttempt?.id
    );
    const prevMax = existingExamAttempts.length > 0 
      ? Math.max(...existingExamAttempts.map((a) => a.score)) 
      : -Infinity;

    const isNewPersonalBest = newAttemptData.score > prevMax && existingExamAttempts.length > 0;

    if (editingAttempt && editingAttempt.id) {
      // Update existing
      const updatedMock: MockAttempt = { ...newAttemptData, id: editingAttempt.id };
      setAttempts((prev) =>
        prev.map((a) => (a.id === editingAttempt.id ? updatedMock : a))
      );
      await StorageService.saveAttempt(updatedMock).catch(() => {});
      HapticService.success();
    } else {
      // Add new
      const newAttempt: MockAttempt = {
        ...newAttemptData,
        id: `mock-${Date.now()}`,
      };
      setAttempts((prev) => [newAttempt, ...prev]);
      await StorageService.saveAttempt(newAttempt).catch(() => {});

      // Check for milestone event (Personal Best, Mock Milestones, Streaks, Performance, Time)
      const milestone = detectMilestoneOnMockSave(attempts, newAttempt, activeExam);
      if (milestone) {
        setActiveMilestone(milestone);
        if (milestone.type === "personal_best") {
          firePersonalBestConfetti();
        }
        HapticService.achievement();
      } else if (isNewPersonalBest) {
        firePersonalBestConfetti();
        HapticService.achievement();
      } else {
        HapticService.success();
      }
    }

    setEditingAttempt(undefined);
  };

  // Bulk add multiple attempts (e.g. from CSV import)
  const handleBulkAddAttempts = async (newAttemptsData: Omit<MockAttempt, "id">[]) => {
    if (newAttemptsData.length === 0) return;

    const profileId = newAttemptsData[0].profileId;
    const existingExamAttempts = attempts.filter((a) => a.profileId === profileId);
    const prevMax = existingExamAttempts.length > 0
      ? Math.max(...existingExamAttempts.map((a) => a.score))
      : -Infinity;
    const maxImportedScore = Math.max(...newAttemptsData.map((a) => a.score));

    const isNewPersonalBest = maxImportedScore > prevMax && existingExamAttempts.length > 0;

    const createdAttempts: MockAttempt[] = newAttemptsData.map((data, idx) => ({
      ...data,
      id: `mock-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    setAttempts((prev) => [...createdAttempts, ...prev]);
    await Promise.all(
      createdAttempts.map((att) => StorageService.saveAttempt(att).catch(() => {}))
    );

    if (isNewPersonalBest) {
      firePersonalBestConfetti();
      HapticService.achievement();
    } else {
      HapticService.success();
    }
  };

  // Update exam profile (e.g. Subject Goals)
  const handleUpdateExamProfile = (updatedProfile: ExamProfile) => {
    setExamProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p))
    );
  };

  // Delete Mock
  const handleDeleteAttempt = async (id: string) => {
    setAttempts((prev) => prev.filter((a) => a.id !== id));
    await StorageService.deleteAttempt(id).catch(() => {});
  };

  // OCR Extraction apply
  const handleApplyExtractedData = (data: Partial<MockAttempt>) => {
    setEditingAttempt(data);
    setActiveTab("log");
  };

  // Candidate Name & Aspirant Iconography save
  const handleSaveName = (newName: string, gender?: "male" | "female") => {
    setCandidate((prev) => ({
      ...prev,
      name: newName,
      avatarSeed: newName.slice(0, 2).toUpperCase(),
      ...(gender ? { gender } : {}),
    }));
  };

  // Save target date and target score
  const handleSaveDate = (examId: string, dateStr: string | undefined, targetScore?: number) => {
    setExamProfiles((prev) =>
      prev.map((p) =>
        p.id === examId
          ? {
              ...p,
              examDate: dateStr,
              ...(targetScore !== undefined ? { targetScore } : {}),
            }
          : p
      )
    );
  };

  // Add new profile
  const handleAddProfile = (newProfile: ExamProfile) => {
    setExamProfiles((prev) => [...prev, newProfile]);
    setCandidate((prev) => ({ ...prev, activeExamProfileId: newProfile.id }));
  };

  // Data Export / Import / Clear
  const handleExportData = () => {
    const dump = {
      candidate,
      examProfiles,
      attempts,
      version: "1.5.0",
      exportDate: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dump, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mocktrack_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.candidate) setCandidate(parsed.candidate);
        if (parsed.examProfiles) setExamProfiles(parsed.examProfiles);
        if (parsed.attempts) {
          setAttempts(parsed.attempts);
          await StorageService.saveAttempts(parsed.attempts);
        }
        alert("MockTrack backup data imported successfully!");
      } catch (err) {
        alert("Failed to parse JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    setAttempts([]);
    localStorage.removeItem("mocktrack_attempts");
    await StorageService.clearAll().catch(() => {});
    alert("All mock test logs have been cleared.");
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#FAFCFF] dark:bg-[#090D16] bg-grid-pattern text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
        {/* Offline Banner Indicator */}
        <OfflineBanner />

        {/* 1. Splash & Onboarding Screen */}
        {showSplash && (
          <SplashOnboarding
            candidate={candidate}
            examProfiles={examProfiles}
            onComplete={(candidateData, selectedExamId, examConfig) => {
              setCandidate((prev) => ({
                ...prev,
                name: candidateData.name,
                avatarSeed: candidateData.avatarSeed,
                activeExamProfileId: selectedExamId,
              }));

              if (examConfig) {
                setExamProfiles((prev) =>
                  prev.map((p) =>
                    p.id === selectedExamId
                      ? {
                          ...p,
                          targetScore: examConfig.targetScore,
                          examDate: examConfig.examDate || p.examDate,
                        }
                      : p
                  )
                );
              }
              setShowSplash(false);
            }}
            onDismiss={() => setShowSplash(false)}
          />
        )}

        {/* 2. Top App Bar */}
        <TopAppBar
          activeExam={activeExam}
          candidate={candidate}
          theme={candidate.theme}
          activeTab={activeTab}
          onToggleTheme={handleToggleTheme}
          onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
          onOpenSetDateModal={() => setIsSetDateOpen(true)}
          onNavigateTab={setActiveTab}
        />

        {/* PWA Install Banner */}
        <PwaInstallBanner />

        {/* Main View Container */}
        <main className="max-w-7xl mx-auto px-4 pt-16 sm:pt-20 pb-28">
          {activeTab === "dashboard" && (
            <DashboardScreen
              candidate={candidate}
              activeExam={activeExam}
              attempts={attempts}
              onOpenLogModal={() => {
                setEditingAttempt(undefined);
                setActiveTab("log");
              }}
              onOpenOcrModal={() => setIsOcrModalOpen(true)}
              onNavigateTab={setActiveTab}
              onSelectAttempt={(att) => {
                setEditingAttempt(att);
                setActiveTab("log");
              }}
              onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
              onOpenSetDateModal={() => setIsSetDateOpen(true)}
              onUpdateExamProfile={handleUpdateExamProfile}
              onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
              onOpenScoreCard={handleOpenScoreCard}
              activeMilestone={activeMilestone}
              onDismissMilestone={() => setActiveMilestone(null)}
            />
          )}

          {activeTab === "log" && (
            <LogMockScreen
              activeExam={activeExam}
              attempts={attempts}
              onSaveMock={handleSaveMock}
              onNavigateTab={setActiveTab}
              initialData={editingAttempt}
              onOpenOcrModal={() => setIsOcrModalOpen(true)}
            />
          )}

          {activeTab === "history" && (
            <HistoryScreen
              attempts={attempts}
              activeExam={activeExam}
              onEditMock={(mock) => {
                setEditingAttempt(mock);
                setActiveTab("log");
              }}
              onDeleteMock={handleDeleteAttempt}
              onOpenLogModal={() => {
                setEditingAttempt(undefined);
                setActiveTab("log");
              }}
              onBulkAddAttempts={handleBulkAddAttempts}
            />
          )}

          {activeTab === "insights" && (
            <InsightsScreen activeExam={activeExam} attempts={attempts} />
          )}

          {activeTab === "reports" && (
            <ReportsScreen
              attempts={attempts}
              activeExam={activeExam}
              candidate={candidate}
            />
          )}

          {activeTab === "profile" && (
            <ProfileScreen
              candidate={candidate}
              examProfiles={examProfiles}
              attempts={attempts}
              onSelectExamProfile={handleSelectProfile}
              onOpenAddProfileModal={() => setIsAddProfileOpen(true)}
              onOpenEditNameModal={() => setIsEditNameOpen(true)}
              onOpenSetDateModal={() => setIsSetDateOpen(true)}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onClearAllData={handleClearAllData}
              onNavigateTab={setActiveTab}
              onUpdateExamProfile={handleUpdateExamProfile}
              onOpenScoreCard={handleOpenScoreCard}
              onUpdateCandidate={(updates) =>
                setCandidate((prev) => ({ ...prev, ...updates }))
              }
            />
          )}

          {activeTab === "settings" && (
            <SettingsScreen
              candidate={candidate}
              activeExam={activeExam}
              onSetTheme={handleSetTheme}
              onToggleTheme={handleToggleTheme}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onClearAllData={handleClearAllData}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "guide" && (
            <AppGuideScreen
              candidate={candidate}
              activeExam={activeExam}
              attempts={attempts}
            />
          )}

          {activeTab === "privacy" && (
            <PrivacyScreen onNavigateTab={setActiveTab} />
          )}
        </main>

        {/* 3. Bottom Navigation Shell */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenLogModal={() => {
            setEditingAttempt(undefined);
            setActiveTab("log");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Modals */}
        <LogMockModal
          isOpen={isLogModalOpen}
          onClose={() => {
            setIsLogModalOpen(false);
            setEditingAttempt(undefined);
          }}
          activeExam={activeExam}
          attempts={attempts}
          onSaveMock={handleSaveMock}
          initialData={editingAttempt}
          onOpenOcrModal={() => setIsOcrModalOpen(true)}
          frequentlyUsedWeakAreas={weakAreasHistory}
          onSaveWeakAreasHistory={handleSaveWeakAreasHistory}
        />

        <OcrExtractorModal
          isOpen={isOcrModalOpen}
          onClose={() => setIsOcrModalOpen(false)}
          onApplyExtractedData={handleApplyExtractedData}
        />

        <ProfileSwitcherModal
          isOpen={isProfileSwitcherOpen}
          onClose={() => setIsProfileSwitcherOpen(false)}
          examProfiles={examProfiles}
          activeProfileId={candidate.activeExamProfileId}
          onSelectProfile={handleSelectProfile}
          onOpenAddModal={() => setIsAddProfileOpen(true)}
          onOpenSetDateModal={() => setIsSetDateOpen(true)}
        />

        <NameEditModal
          isOpen={isEditNameOpen}
          onClose={() => setIsEditNameOpen(false)}
          currentName={candidate.name}
          currentGender={candidate.gender || "male"}
          onSaveName={handleSaveName}
        />

        <SetDateModal
          isOpen={isSetDateOpen}
          onClose={() => setIsSetDateOpen(false)}
          activeExam={activeExam}
          onSaveDate={handleSaveDate}
        />

        <AddProfileModal
          isOpen={isAddProfileOpen}
          onClose={() => setIsAddProfileOpen(false)}
          onAddProfile={handleAddProfile}
        />

        <ScoreCardModal
          isOpen={isScoreCardOpen}
          onClose={() => setIsScoreCardOpen(false)}
          candidate={candidate}
          activeExam={activeExam}
          attempts={attempts}
          milestoneTitle={scoreCardMilestoneTitle}
        />
      </div>
    </LanguageProvider>
  );
}

