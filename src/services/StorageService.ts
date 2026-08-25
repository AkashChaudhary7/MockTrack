import { openDB, DBSchema, IDBPDatabase } from "idb";
import { MockAttempt, ExamProfile, PlatformInfo } from "../types";

interface MockTrackDB extends DBSchema {
  mocks: {
    key: string;
    value: MockAttempt;
    indexes: {
      "by-profile": string;
      "by-date": string;
      "by-platform": string;
    };
  };
  exams: {
    key: string;
    value: ExamProfile;
  };
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = "mocktrack_db_v1";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MockTrackDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MockTrackDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MockTrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("mocks")) {
          const mockStore = db.createObjectStore("mocks", { keyPath: "id" });
          mockStore.createIndex("by-profile", "profileId");
          mockStore.createIndex("by-date", "date");
          mockStore.createIndex("by-platform", "platform");
        }
        if (!db.objectStoreNames.contains("exams")) {
          db.createObjectStore("exams", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }
  return dbPromise;
}

export class StorageService {
  // MOCKS
  static async getAllMocks(): Promise<MockAttempt[]> {
    try {
      const db = await getDB();
      const mocks = await db.getAll("mocks");
      return mocks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.warn("IndexedDB read error, falling back to localStorage", e);
      const raw = localStorage.getItem("mocktrack_attempts");
      return raw ? JSON.parse(raw) : [];
    }
  }

  static async getAttempts(): Promise<MockAttempt[]> {
    return this.getAllMocks();
  }

  static async getMocksByProfile(profileId: string): Promise<MockAttempt[]> {
    const all = await this.getAllMocks();
    return all.filter((m) => m.profileId === profileId);
  }

  static async saveMock(mock: MockAttempt): Promise<void> {
    try {
      const db = await getDB();
      await db.put("mocks", mock);
    } catch (e) {
      console.error("IndexedDB save error", e);
    } finally {
      const current = await this.getAllMocks();
      localStorage.setItem("mocktrack_attempts", JSON.stringify(current));
    }
  }

  static async saveAttempt(mock: MockAttempt): Promise<void> {
    return this.saveMock(mock);
  }

  static async saveAllMocks(mocks: MockAttempt[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction("mocks", "readwrite");
      await tx.store.clear();
      for (const m of mocks) {
        await tx.store.put(m);
      }
      await tx.done;
    } catch (e) {
      console.error("IndexedDB saveAll error", e);
    } finally {
      localStorage.setItem("mocktrack_attempts", JSON.stringify(mocks));
    }
  }

  static async saveAttempts(mocks: MockAttempt[]): Promise<void> {
    return this.saveAllMocks(mocks);
  }

  static async deleteMock(id: string): Promise<void> {
    try {
      const db = await getDB();
      await db.delete("mocks", id);
    } catch (e) {
      console.error("IndexedDB delete error", e);
    } finally {
      const remaining = await this.getAllMocks();
      localStorage.setItem("mocktrack_attempts", JSON.stringify(remaining));
    }
  }

  static async deleteAttempt(id: string): Promise<void> {
    return this.deleteMock(id);
  }

  // EXAMS
  static async getAllExams(): Promise<ExamProfile[]> {
    try {
      const db = await getDB();
      return await db.getAll("exams");
    } catch (e) {
      const raw = localStorage.getItem("mocktrack_exams");
      return raw ? JSON.parse(raw) : [];
    }
  }

  static async saveExam(exam: ExamProfile): Promise<void> {
    try {
      const db = await getDB();
      await db.put("exams", exam);
    } catch (e) {
      console.error("IndexedDB saveExam error", e);
    } finally {
      const all = await this.getAllExams();
      localStorage.setItem("mocktrack_exams", JSON.stringify(all));
    }
  }

  static async saveAllExams(exams: ExamProfile[]): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction("exams", "readwrite");
      await tx.store.clear();
      for (const ex of exams) {
        await tx.store.put(ex);
      }
      await tx.done;
    } catch (e) {
      console.error("IndexedDB saveAllExams error", e);
    } finally {
      localStorage.setItem("mocktrack_exams", JSON.stringify(exams));
    }
  }

  static async saveExamProfiles(exams: ExamProfile[]): Promise<void> {
    return this.saveAllExams(exams);
  }

  // CLEAR ALL DATA
  static async clearAllData(): Promise<void> {
    try {
      const db = await getDB();
      const tx = db.transaction(["mocks", "exams", "settings"], "readwrite");
      await tx.objectStore("mocks").clear();
      await tx.objectStore("exams").clear();
      await tx.objectStore("settings").clear();
      await tx.done;
    } catch (e) {
      console.error("IndexedDB clear error", e);
    } finally {
      localStorage.clear();
    }
  }

  static async clearAll(): Promise<void> {
    return this.clearAllData();
  }
}

