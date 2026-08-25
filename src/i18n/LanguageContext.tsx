import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "hi" | "system";

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  
  // Dashboard & CTA
  logTodaysMock: string;
  recordIn10Sec: string;
  currentPerformance: string;
  averageScore: string;
  bestScore: string;
  latestScore: string;
  overallAccuracy: string;
  last7Days: string;
  scoreTrendChart: string;
  yourCurrentState: string;
  performanceZone: string;
  aboveBaseline: string;
  nearBaseline: string;
  belowBaseline: string;
  weakArea: string;
  nextAction: string;
  recentMocks: string;
  viewAll: string;
  yourReport: string;
  viewReport: string;
  downloadReport: string;
  
  // Quick Entry Modal
  chooseLoggingMethod: string;
  scanScreenshot: string;
  scanResultDesc: string;
  shareResultLink: string;
  importLinkDesc: string;
  quickEntry: string;
  manualScoreDesc: string;
  
  // Quick Entry Form
  examProfile: string;
  platform: string;
  mockName: string;
  mockNamePlaceholder: string;
  scoreRequired: string;
  scorePlaceholder: string;
  totalMarks: string;
  testDate: string;
  testType: string;
  saveMock: string;
  saving: string;
  cancel: string;
  
  // Post Save Modal
  mockSavedSuccess: string;
  addMoreDetails: string;
  done: string;
  addDetails: string;
  logAnotherMock: string;
  personalBest: string;
  previousBest: string;
  yourProgress: string;
  previous: string;
  current: string;
  difference: string;
  todaysPerformance: string;
  todayMocksLogged: string;
  todayAvg: string;
  todayBest: string;
  marksGainToday: string;
  
  // Optional Details Form
  attemptedQuestions: string;
  correctAnswers: string;
  wrongAnswers: string;
  accuracyPercentage: string;
  percentile: string;
  rankInTest: string;
  totalCandidates: string;
  timeSpentMin: string;
  difficultyRating: string;
  easy: string;
  moderate: string;
  hard: string;
  veryHard: string;
  confidenceLevel: string;
  veryConfident: string;
  confident: string;
  average: string;
  difficult: string;
  veryDifficult: string;
  whyMarksLost: string;
  conceptGap: string;
  sillyMistake: string;
  timePressure: string;
  calculationError: string;
  guessing: string;
  misreadQuestion: string;
  didntKnow: string;
  weakAreasHeader: string;
  addCustomWeakArea: string;
  quickNotes: string;
  ranOutOfTime: string;
  tooManyMistakes: string;
  difficultPaper: string;
  goodPerformance: string;
  needRevision: string;
  needSpeed: string;
  freeTextNote: string;
  
  // Smart Analytics
  personalBaseline: string;
  recentAverage: string;
  consistencyScore: string;
  typicalScoreRange: string;
  mockPersonality: string;
  recoveryInsight: string;
  recoveryDesc: string;
  performanceDipInsight: string;
  performanceDipDesc: string;
  avoidableLossTitle: string;
  basedOnLoggedMistakes: string;
  consistencyExplanationTitle: string;
  consistencyExplanationText: string;
  
  // Navigation & Screens
  dashboardTab: string;
  mockLogTab: string;
  reviewTab: string;
  insightsTab: string;
  profileTab: string;
  appGuideTab: string;
  
  // Settings & Profile
  settingsTitle: string;
  languageSetting: string;
  english: string;
  hindi: string;
  systemDefault: string;
  candidateProfile: string;
  candidateName: string;
  activeExam: string;
  appearance: string;
  lightMode: string;
  darkMode: string;
  dataManagement: string;
  exportData: string;
  importData: string;
  clearData: string;
  aboutMockTrack: string;
  version: string;
  
  // Ad & Download
  sponsored: string;
  adText: string;
  watchAdToUnlock: string;
  unlockPdfDownload: string;
  watchVideoAd: string;
  reportUnlocked: string;
  
  // Report
  performanceSummaryReport: string;
  generatedFor: string;
  generatedOn: string;
  disclaimerNote: string;
}

export const ENGLISH_TRANSLATIONS: TranslationDictionary = {
  appName: "MockTrack",
  tagline: "Simple to use. Powerful in the background.",
  goodMorning: "Good morning",
  goodAfternoon: "Good afternoon",
  goodEvening: "Good evening",
  
  logTodaysMock: "+ LOG TODAY'S MOCK",
  recordIn10Sec: "Record in 10 seconds",
  currentPerformance: "CURRENT PERFORMANCE",
  averageScore: "Average",
  bestScore: "Best",
  latestScore: "Latest",
  overallAccuracy: "Accuracy",
  last7Days: "LAST 7 DAYS",
  scoreTrendChart: "SCORE TREND CHART",
  yourCurrentState: "CURRENT STATUS",
  performanceZone: "Performance Zone",
  aboveBaseline: "Above Baseline",
  nearBaseline: "Near Baseline",
  belowBaseline: "Below Baseline",
  weakArea: "Weak Area",
  nextAction: "Next Action",
  recentMocks: "RECENT MOCKS",
  viewAll: "View All",
  yourReport: "YOUR REPORT",
  viewReport: "View Report",
  downloadReport: "Download Report",
  
  chooseLoggingMethod: "How would you like to log your mock?",
  scanScreenshot: "📸 Screenshot",
  scanResultDesc: "Scan result image / OCR",
  shareResultLink: "🔗 Share Result",
  importLinkDesc: "Import result scorecard link",
  quickEntry: "✍️ Quick Entry",
  manualScoreDesc: "Enter score manually in 10 sec",
  
  examProfile: "Exam Profile",
  platform: "Test Platform",
  mockName: "Mock Name (Optional)",
  mockNamePlaceholder: "e.g. Full Mock #14",
  scoreRequired: "Score (Required)",
  scorePlaceholder: "e.g. 148 or 148/200",
  totalMarks: "Total Marks",
  testDate: "Test Date",
  testType: "Test Type",
  saveMock: "SAVE MOCK",
  saving: "Saving...",
  cancel: "Cancel",
  
  mockSavedSuccess: "Mock Saved ✓",
  addMoreDetails: "Add more details?",
  done: "Done",
  addDetails: "Add Details",
  logAnotherMock: "Log Another Mock",
  personalBest: "🏆 New Personal Best!",
  previousBest: "Previous best",
  yourProgress: "Your Progress",
  previous: "Previous",
  current: "Current",
  difference: "Difference",
  todaysPerformance: "Today's Performance",
  todayMocksLogged: "Mocks Logged Today",
  todayAvg: "Today's Avg",
  todayBest: "Today's Best",
  marksGainToday: "marks gained today",
  
  attemptedQuestions: "Attempted Questions",
  correctAnswers: "Correct Answers",
  wrongAnswers: "Wrong / Incorrect",
  accuracyPercentage: "Accuracy (%)",
  percentile: "Percentile (%)",
  rankInTest: "Rank in Test",
  totalCandidates: "Total Candidates",
  timeSpentMin: "Time Spent (minutes)",
  difficultyRating: "How difficult was this mock?",
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  veryHard: "Very Hard",
  confidenceLevel: "How did the mock feel?",
  veryConfident: "Very Confident",
  confident: "Confident",
  average: "Average",
  difficult: "Difficult",
  veryDifficult: "Very Difficult",
  whyMarksLost: "Why did you lose marks?",
  conceptGap: "Concept gap",
  sillyMistake: "Silly mistake",
  timePressure: "Time pressure",
  calculationError: "Calculation error",
  guessing: "Guessing",
  misreadQuestion: "Misread question",
  didntKnow: "Didn't know",
  weakAreasHeader: "What felt weak in this mock?",
  addCustomWeakArea: "+ Add Custom Topic",
  quickNotes: "Quick Notes",
  ranOutOfTime: "Ran out of time",
  tooManyMistakes: "Too many mistakes",
  difficultPaper: "Difficult paper",
  goodPerformance: "Good performance",
  needRevision: "Need revision",
  needSpeed: "Need speed",
  freeTextNote: "Add custom note...",
  
  personalBaseline: "Your Baseline",
  recentAverage: "Recent Average",
  consistencyScore: "Consistency",
  typicalScoreRange: "Typical Score Range",
  mockPersonality: "Mock Personality",
  recoveryInsight: "📈 Strong Recovery",
  recoveryDesc: "Your recent scores are moving consistently upward!",
  performanceDipInsight: "⚠️ Performance Dip",
  performanceDipDesc: "Your recent average is below your baseline. Focus on accuracy & weak areas.",
  avoidableLossTitle: "Potentially Avoidable Loss",
  basedOnLoggedMistakes: "Based on the mistake categories you logged.",
  consistencyExplanationTitle: "About Consistency Index",
  consistencyExplanationText: "Consistency measures how stable your scores remain across test attempts on a scale of 0 to 100. Higher values signify predictable performance.",
  
  dashboardTab: "Dashboard",
  mockLogTab: "Mock Log",
  reviewTab: "Review",
  insightsTab: "Insights",
  profileTab: "Settings",
  appGuideTab: "Guide",
  
  settingsTitle: "Settings & Profile",
  languageSetting: "Language Preference",
  english: "English",
  hindi: "हिंदी",
  systemDefault: "System Default",
  candidateProfile: "Candidate Profile",
  candidateName: "Candidate Name",
  activeExam: "Active Exam Target",
  appearance: "Appearance Theme",
  lightMode: "Light Theme",
  darkMode: "Dark Theme",
  dataManagement: "Data Backup & Storage",
  exportData: "Export JSON Data",
  importData: "Import JSON Data",
  clearData: "Reset All App Data",
  aboutMockTrack: "About MockTrack",
  version: "Version 1.5.0",
  
  sponsored: "SPONSORED",
  adText: "Advertisement",
  watchAdToUnlock: "Watch a short ad to unlock full PDF download",
  unlockPdfDownload: "Unlock PDF Download",
  watchVideoAd: "Watch Short Ad",
  reportUnlocked: "PDF Download Unlocked!",
  
  performanceSummaryReport: "Mock Performance Summary Report",
  generatedFor: "Generated for",
  generatedOn: "Generated on",
  disclaimerNote: "MockTrack Analytics • For self-analysis purposes only."
};

export const HINDI_TRANSLATIONS: TranslationDictionary = {
  appName: "MockTrack",
  tagline: "सरल उपयोग। पृष्ठभूमि में शक्तिशाली।",
  goodMorning: "शुभ प्रभात",
  goodAfternoon: "शुभ दोपहर",
  goodEvening: "शुभ संध्या",
  
  logTodaysMock: "+ आज का मॉक दर्ज करें",
  recordIn10Sec: "10 सेकंड में रिकॉर्ड करें",
  currentPerformance: "वर्तमान प्रदर्शन",
  averageScore: "औसत अंक",
  bestScore: "सर्वश्रेष्ठ",
  latestScore: "नवीनतम",
  overallAccuracy: "सटीकता",
  last7Days: "पिछले 7 दिन",
  scoreTrendChart: "अंक रुझान चार्ट",
  yourCurrentState: "CURRENT STATUS (वर्तमान स्थिति)",
  performanceZone: "प्रदर्शन क्षेत्र",
  aboveBaseline: "बेसलाइन से ऊपर",
  nearBaseline: "बेसलाइन के पास",
  belowBaseline: "बेसलाइन से नीचे",
  weakArea: "कमजोर क्षेत्र",
  nextAction: "अगला कदम",
  recentMocks: "हाल के मॉक टेस्ट",
  viewAll: "सभी देखें",
  yourReport: "आपकी रिपोर्ट",
  viewReport: "रिपोर्ट देखें",
  downloadReport: "रिपोर्ट डाउनलोड करें",
  
  chooseLoggingMethod: "आप अपना मॉक कैसे दर्ज करना चाहते हैं?",
  scanScreenshot: "📸 स्क्रीनशॉट",
  scanResultDesc: "परिणाम छवि / OCR स्कैन करें",
  shareResultLink: "🔗 लिंक साझा करें",
  importLinkDesc: "स्कोरकार्ड लिंक इम्पोर्ट करें",
  quickEntry: "✍️ त्वरित प्रविष्टि",
  manualScoreDesc: "10 सेकंड में मैन्युअल अंक दर्ज करें",
  
  examProfile: "परीक्षा प्रोफ़ाइल",
  platform: "टेस्ट प्लेटफॉर्म",
  mockName: "मॉक का नाम (वैकल्पिक)",
  mockNamePlaceholder: "जैसे: फुल मॉक #14",
  scoreRequired: "प्राप्त अंक (अनिवार्य)",
  scorePlaceholder: "जैसे: 148 या 148/200",
  totalMarks: "कुल अंक",
  testDate: "परीक्षण तिथि",
  testType: "परीक्षण प्रकार",
  saveMock: "मॉक सहेजें",
  saving: "सहेजा जा रहा है...",
  cancel: "रद्द करें",
  
  mockSavedSuccess: "मॉक सहेजा गया ✓",
  addMoreDetails: "अधिक विवरण जोड़ें?",
  done: "हो गया",
  addDetails: "विवरण जोड़ें",
  logAnotherMock: "एक और मॉक दर्ज करें",
  personalBest: "🏆 नया व्यक्तिगत सर्वश्रेष्ठ!",
  previousBest: "पिछला सर्वश्रेष्ठ",
  yourProgress: "आपकी प्रगति",
  previous: "पिछला",
  current: "वर्तमान",
  difference: "अंतर",
  todaysPerformance: "आज का प्रदर्शन",
  todayMocksLogged: "आज दर्ज मॉक",
  todayAvg: "आज का औसत",
  todayBest: "आज का सर्वश्रेष्ठ",
  marksGainToday: "अंक आज अर्जित किए",
  
  attemptedQuestions: "प्रयास किए गए प्रश्न",
  correctAnswers: "सही उत्तर",
  wrongAnswers: "गलत उत्तर",
  accuracyPercentage: "सटीकता (%)",
  percentile: "पर्सेंटाइल (%)",
  rankInTest: "टेस्ट में रैंक",
  totalCandidates: "कुल उम्मीदवार",
  timeSpentMin: "समय (मिनट)",
  difficultyRating: "यह मॉक कितना कठिन था?",
  easy: "आसान",
  moderate: "मध्यम",
  hard: "कठिन",
  veryHard: "अत्यधिक कठिन",
  confidenceLevel: "मॉक के दौरान कैसा महसूस हुआ?",
  veryConfident: "पूर्ण आश्वस्त",
  confident: "आश्वस्त",
  average: "सामान्य",
  difficult: "कठिन",
  veryDifficult: "अत्यधिक कठिन",
  whyMarksLost: "अंक क्यों कटे?",
  conceptGap: "अवधारणा की कमी",
  sillyMistake: "सिल्ली मिस्टेक",
  timePressure: "समय का दबाव",
  calculationError: "गणना की गलती",
  guessing: "तुक्का मारना",
  misreadQuestion: "प्रश्न गलत पढ़ा",
  didntKnow: "ज्ञान का अभाव",
  weakAreasHeader: "इस मॉक में कौन सा विषय कमजोर लगा?",
  addCustomWeakArea: "+ नया विषय जोड़ें",
  quickNotes: "त्वरित टिप्पणियाँ",
  ranOutOfTime: "समय समाप्त हो गया",
  tooManyMistakes: "बहुत अधिक गलतियाँ",
  difficultPaper: "कठिन प्रश्नपत्र",
  goodPerformance: "अच्छा प्रदर्शन",
  needRevision: "पुनरीक्षण की आवश्यकता",
  needSpeed: "गति सुधार आवश्यक",
  freeTextNote: "अपनी टिप्पणी दर्ज करें...",
  
  personalBaseline: "आपकी बेसलाइन",
  recentAverage: "हाल का औसत",
  consistencyScore: "निरंतरता",
  typicalScoreRange: "सामान्य स्कोर सीमा",
  mockPersonality: "मॉक व्यक्तित्व",
  recoveryInsight: "📈 मजबूत सुधार",
  recoveryDesc: "आपके हाल के अंकों में लगातार वृद्धि हो रही है!",
  performanceDipInsight: "⚠️ प्रदर्शन में गिरावट",
  performanceDipDesc: "आपका हाल का औसत आपकी बेसलाइन से कम है। सटीकता पर ध्यान दें।",
  avoidableLossTitle: "संभावित रोके जाने योग्य नुकसान",
  basedOnLoggedMistakes: "आपके द्वारा दर्ज की गई गलतियों की श्रेणियों पर आधारित।",
  consistencyExplanationTitle: "निरंतरता सूचकांक के बारे में",
  consistencyExplanationText: "निरंतरता मापती है कि 0 से 100 के पैमाने पर विभिन्न टेस्टों में आपका स्कोर कितना स्थिर रहता है। उच्च मान अधिक विश्वसनीय प्रदर्शन दर्शाते हैं।",
  
  dashboardTab: "डैशबोर्ड",
  mockLogTab: "मॉक लॉग",
  reviewTab: "समीक्षा",
  insightsTab: "विश्लेषण",
  profileTab: "सेटिंग्स",
  appGuideTab: "गाइड",
  
  settingsTitle: "सेटिंग्स और प्रोफ़ाइल",
  languageSetting: "भाषा प्राथमिकता",
  english: "English",
  hindi: "हिंदी",
  systemDefault: "सिस्टम डिफ़ॉल्ट",
  candidateProfile: "उम्मीदवार प्रोफ़ाइल",
  candidateName: "उम्मीदवार का नाम",
  activeExam: "सक्रिय परीक्षा लक्ष्य",
  appearance: "थीम",
  lightMode: "लाइट थीम",
  darkMode: "डार्क थीम",
  dataManagement: "डेटा बैकअप",
  exportData: "डेटा एक्सपोर्ट (JSON)",
  importData: "डेटा इम्पोर्ट (JSON)",
  clearData: "सभी डेटा रीसेट करें",
  aboutMockTrack: "MockTrack के बारे में",
  version: "संस्करण 1.5.0",
  
  sponsored: "प्रायोजित",
  adText: "विज्ञापन",
  watchAdToUnlock: "पूर्ण PDF डाउनलोड अनलॉक करने के लिए छोटा विज्ञापन देखें",
  unlockPdfDownload: "PDF डाउनलोड अनलॉक करें",
  watchVideoAd: "छोटा विज्ञापन देखें",
  reportUnlocked: "PDF डाउनलोड अनलॉक हो गया!",
  
  performanceSummaryReport: "मॉक प्रदर्शन सारांश रिपोर्ट",
  generatedFor: "उम्मीदवार:",
  generatedOn: "दिनांक:",
  disclaimerNote: "MockTrack Analytics • केवल स्व-विश्लेषण उद्देश्यों के लिए।"
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  effectiveLang: "en" | "hi";
}

const LanguageContext = createContext<LanguageContextType>({
  language: "system",
  setLanguage: () => {},
  t: ENGLISH_TRANSLATIONS,
  effectiveLang: "en",
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: LanguageCode;
}> = ({ children, initialLanguage = "system" }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("mocktrack_language");
    return (saved as LanguageCode) || initialLanguage;
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("mocktrack_language", lang);
  };

  // Determine effective language (en vs hi)
  let effectiveLang: "en" | "hi" = "en";
  if (language === "hi") {
    effectiveLang = "hi";
  } else if (language === "system") {
    const navLang = navigator.language || "";
    if (navLang.startsWith("hi")) {
      effectiveLang = "hi";
    }
  }

  const t = effectiveLang === "hi" ? HINDI_TRANSLATIONS : ENGLISH_TRANSLATIONS;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, effectiveLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
