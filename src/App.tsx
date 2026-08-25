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
import { MockLogScreen } from "./components/MockLogScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { InsightsScreen } from "./components/InsightsScreen";
import { ReportsScreen } from "./components/ReportsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { AppGuideScreen } from "./components/AppGuideScreen";
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

export default function App() {
  const [candidate, setCandidate] = useState<CandidateProfile>(() => {
    const saved = localStorage.getItem("mocktrack_candidate");
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATE;
  });

  const [examProfiles, setExamProfiles] = useState<ExamProfile[]>(() => {
    const saved = localStorage.getItem("mocktrack_profiles");
    return saved ? JSON.parse(saved) : INITIAL_EXAM_PROFILES;
  });

  const [attempts, setAttempts] = useState<MockAttempt[]>(() => {
    const saved = localStorage.getItem("mocktrack_attempts");
    return saved ? JSON.parse(saved) : INITIAL_MOCK_ATTEMPTS;
  });

  const [mistakes, setMistakes] = useState<MistakeReviewItem[]>(() => {
    const saved = localStorage.getItem("mocktrack_mistakes");
    return saved ? JSON.parse(saved) : INITIAL_MISTAKES;
  });

  const [weakAreasHistory, setWeakAreasHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("mocktrack_weak_areas_history");
    return saved
      ? JSON.parse(saved)
      : ["Geometry", "Algebra", "Current Affairs", "Time & Work", "Reading Comprehension"];
  });

  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [editingAttempt, setEditingAttempt] = useState<Partial<MockAttempt> | undefined>(undefined);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState<boolean>(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState<boolean>(false);
  const [isSetDateOpen, setIsSetDateOpen] = useState<boolean>(false);
  const [isAddProfileOpen, setIsAddProfileOpen] = useState<boolean>(false);

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

  // Sync HTML root dark class
  useEffect(() => {
    const root = document.documentElement;
    if (candidate.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [candidate.theme]);

  // Active exam profile
  const activeExam =
    examProfiles.find((p) => p.id === candidate.activeExamProfileId) ||
    examProfiles[0] ||
    INITIAL_EXAM_PROFILES[0];

  // Theme Toggle
  const handleToggleTheme = () => {
    setCandidate((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
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

  // Save / Update Mock
  const handleSaveMock = async (newAttemptData: Omit<MockAttempt, "id">) => {
    if (editingAttempt && editingAttempt.id) {
      // Update existing
      const updatedMock: MockAttempt = { ...newAttemptData, id: editingAttempt.id };
      setAttempts((prev) =>
        prev.map((a) => (a.id === editingAttempt.id ? updatedMock : a))
      );
      await StorageService.saveAttempt(updatedMock).catch(() => {});
    } else {
      // Add new
      const newAttempt: MockAttempt = {
        ...newAttemptData,
        id: `mock-${Date.now()}`,
      };
      setAttempts((prev) => [newAttempt, ...prev]);
      await StorageService.saveAttempt(newAttempt).catch(() => {});
    }
    setEditingAttempt(undefined);
  };

  // Delete Mock
  const handleDeleteAttempt = async (id: string) => {
    setAttempts((prev) => prev.filter((a) => a.id !== id));
    await StorageService.deleteAttempt(id).catch(() => {});
  };

  // OCR Extraction apply
  const handleApplyExtractedData = (data: Partial<MockAttempt>) => {
    setEditingAttempt(data);
    setIsLogModalOpen(true);
  };

  // Candidate Name save
  const handleSaveName = (newName: string) => {
    setCandidate((prev) => ({
      ...prev,
      name: newName,
      avatarSeed: newName.slice(0, 2).toUpperCase(),
    }));
  };

  // Save target date
  const handleSaveDate = (examId: string, dateStr: string | undefined) => {
    setExamProfiles((prev) =>
      prev.map((p) => (p.id === examId ? { ...p, examDate: dateStr } : p))
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-grid-pattern text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
        {/* Offline Banner Indicator */}
        <OfflineBanner />

        {/* 1. Splash & Onboarding Screen */}
        {showSplash && (
          <SplashOnboarding onDismiss={() => setShowSplash(false)} />
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
                setIsLogModalOpen(true);
              }}
              onOpenOcrModal={() => setIsOcrModalOpen(true)}
              onNavigateTab={setActiveTab}
              onSelectAttempt={(att) => {
                setEditingAttempt(att);
                setIsLogModalOpen(true);
              }}
              onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
            />
          )}

          {(activeTab === "history" || activeTab === "log") && (
            <HistoryScreen
              attempts={attempts}
              activeExam={activeExam}
              onEditMock={(mock) => {
                setEditingAttempt(mock);
                setIsLogModalOpen(true);
              }}
              onDeleteMock={handleDeleteAttempt}
              onOpenLogModal={() => {
                setEditingAttempt(undefined);
                setIsLogModalOpen(true);
              }}
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
            />
          )}

          {activeTab === "guide" && (
            <AppGuideScreen
              candidate={candidate}
              activeExam={activeExam}
              attempts={attempts}
            />
          )}
        </main>

        {/* 3. Bottom Navigation Shell */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenLogModal={() => {
            setEditingAttempt(undefined);
            setIsLogModalOpen(true);
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
      </div>
    </LanguageProvider>
  );
}

