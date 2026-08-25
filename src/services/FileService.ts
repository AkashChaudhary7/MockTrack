import { MockAttempt, ExamProfile } from "../types";
import { StorageService } from "./StorageService";

export interface BackupData {
  version: string;
  timestamp: string;
  mocks: MockAttempt[];
  exams: ExamProfile[];
}

export class FileService {
  static exportBackupJSON(mocks: MockAttempt[], exams: ExamProfile[]): void {
    const backup: BackupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      mocks,
      exams,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `MockTrack_Backup_${dateStr}.json`;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  static exportMocksCSV(mocks: MockAttempt[]): void {
    const headers = [
      "Date",
      "Exam",
      "Platform",
      "Mock Title",
      "Score",
      "Max Marks",
      "Percentage (%)",
      "Attempted",
      "Accuracy (%)",
      "Percentile",
      "Rank",
      "Difficulty",
      "Confidence",
      "Weak Areas",
      "Notes",
    ];

    const rows = mocks.map((m) => [
      m.date,
      `"${(m.profileId || "").replace(/"/g, '""')}"`,
      `"${m.platform.replace(/"/g, '""')}"`,
      `"${m.title.replace(/"/g, '""')}"`,
      m.score,
      m.maxMarks,
      ((m.score / m.maxMarks) * 100).toFixed(2),
      (m.correctCount || 0) + (m.incorrectCount || 0),
      m.accuracy ?? "",
      m.percentile ?? "",
      m.rank ?? "",
      m.difficulty ?? "",
      m.confidence ?? "",
      `"${(m.weakAreas || []).join(", ").replace(/"/g, '""')}"`,
      `"${(m.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `MockTrack_Export_${dateStr}.csv`;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  static parseBackupFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (!parsed.mocks || !Array.isArray(parsed.mocks)) {
            reject(new Error("Invalid backup format: missing 'mocks' array."));
            return;
          }
          resolve({
            version: parsed.version || "1.0",
            timestamp: parsed.timestamp || new Date().toISOString(),
            mocks: parsed.mocks,
            exams: parsed.exams || [],
          });
        } catch (err) {
          reject(new Error("Failed to parse JSON file."));
        }
      };
      reader.onerror = () => reject(new Error("File reading error."));
      reader.readAsText(file);
    });
  }

  static async restoreBackup(
    backup: BackupData,
    mode: "merge" | "replace",
    existingMocks: MockAttempt[],
    existingExams: ExamProfile[]
  ): Promise<{ mocks: MockAttempt[]; exams: ExamProfile[] }> {
    let finalMocks: MockAttempt[] = [];
    let finalExams: ExamProfile[] = [];

    if (mode === "replace") {
      finalMocks = backup.mocks;
      finalExams = backup.exams.length > 0 ? backup.exams : existingExams;
    } else {
      // Merge: deduplicate by id
      const mockMap = new Map<string, MockAttempt>();
      existingMocks.forEach((m) => mockMap.set(m.id, m));
      backup.mocks.forEach((m) => mockMap.set(m.id, m));
      finalMocks = Array.from(mockMap.values());

      const examMap = new Map<string, ExamProfile>();
      existingExams.forEach((e) => examMap.set(e.id, e));
      backup.exams.forEach((e) => examMap.set(e.id, e));
      finalExams = Array.from(examMap.values());
    }

    await StorageService.saveAllMocks(finalMocks);
    await StorageService.saveAllExams(finalExams);

    return { mocks: finalMocks, exams: finalExams };
  }
}
