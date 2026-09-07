import { ExamProfile, MockAttempt, CandidateProfile, ScoreCardConfig } from "../types";
import { formatPracticeTime } from "./habitUtils";

export interface ScoreCardData {
  userName: string;
  avatarSeed: string;
  avatarPhotoUrl?: string;
  avatarEmoji?: string;
  examName: string;
  totalMocks: number;
  highestScoreDisplay: string;
  averageScoreDisplay: string;
  streakDays?: number;
  longestStreakDays?: number;
  practiceTimeDisplay?: string;
  weeklyMocksDisplay?: string;
  accuracyDisplay?: string;
  milestoneTitle?: string;
}

/**
 * Extracts and prepares accurate stats for the score card
 */
export function prepareScoreCardData(
  candidate: CandidateProfile,
  activeExam: ExamProfile,
  attempts: MockAttempt[],
  config: ScoreCardConfig,
  streakDays: number,
  longestStreakDays: number,
  practiceTimeMinutes: number,
  weeklyMocksCount: number,
  weeklyGoal: number,
  milestoneTitle?: string
): ScoreCardData {
  const relevantAttempts =
    config.scope === "current_exam"
      ? attempts.filter((a) => a.profileId === activeExam.id)
      : attempts;

  // IMPORTANT: Filter ONLY "Full Mock" tests for Average and Highest Score calculations
  const fullMocks = relevantAttempts.filter(
    (a) => a.testType === "Full Mock" || (!a.testType && a.maxMarks === activeExam.totalMarks)
  );

  const highestScoreVal = fullMocks.length > 0 ? Math.max(...fullMocks.map((m) => m.score)) : 0;
  const highestScoreMock = fullMocks.find((m) => m.score === highestScoreVal);
  const highestPct = highestScoreMock && highestScoreMock.maxMarks > 0
    ? Math.round((highestScoreVal / highestScoreMock.maxMarks) * 100)
    : (activeExam.totalMarks > 0 ? Math.round((highestScoreVal / activeExam.totalMarks) * 100) : 0);

  const highestScoreDisplay = highestScoreVal > 0 ? `${highestPct}%` : "--";

  const avgScoreVal = fullMocks.length > 0
    ? fullMocks.reduce((acc, m) => acc + m.score, 0) / fullMocks.length
    : 0;
  const avgPct = activeExam.totalMarks > 0
    ? Math.round((avgScoreVal / activeExam.totalMarks) * 1000) / 10
    : Math.round(avgScoreVal * 10) / 10;
  const averageScoreDisplay = avgScoreVal > 0 ? `${avgPct}%` : "--";

  // Accuracy
  const totalCorrect = relevantAttempts.reduce((acc, m) => acc + (m.correctCount || 0), 0);
  const totalIncorrect = relevantAttempts.reduce((acc, m) => acc + (m.incorrectCount || 0), 0);
  const totalAttempted = totalCorrect + totalIncorrect;
  const accuracyPct = totalAttempted > 0
    ? `${(Math.round((totalCorrect / totalAttempted) * 1000) / 10)}%`
    : "--";

  return {
    userName: candidate.name || "Aspirant",
    avatarSeed: candidate.avatarSeed || candidate.name.slice(0, 2).toUpperCase() || "MT",
    avatarPhotoUrl: config.photoUrl || candidate.photoUrl,
    avatarEmoji: config.avatarEmoji || "🎯",
    examName: config.scope === "current_exam" ? (activeExam.shortCode || activeExam.name) : "All Mock Tests",
    totalMocks: relevantAttempts.length,
    highestScoreDisplay,
    averageScoreDisplay,
    streakDays: config.showStreak ? streakDays : undefined,
    longestStreakDays: config.showLongestStreak ? longestStreakDays : undefined,
    practiceTimeDisplay: config.showPracticeTime ? formatPracticeTime(practiceTimeMinutes) : undefined,
    weeklyMocksDisplay: config.showWeeklyMocks ? `${weeklyMocksCount} / ${weeklyGoal} Mocks` : undefined,
    accuracyDisplay: config.showAccuracy ? accuracyPct : undefined,
    milestoneTitle,
  };
}

/**
 * Draw the high-resolution score card onto a canvas and return data URL / Blob
 */
export async function generateScoreCardBlob(
  data: ScoreCardData,
  config: ScoreCardConfig
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1350; // Standard 4:5 portrait social format (crisp, high quality for Instagram, WhatsApp, Telegram, X)
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Colors based on theme
  let bgGradStart = "#090d16";
  let bgGradEnd = "#0f172a";
  let accentColor = "#6366f1"; // indigo
  let accentGradient = ["#4f46e5", "#818cf8"];
  let cardBg = "#131c2e";
  let cardBorder = "#1e293b";
  let textColor = "#f8fafc";
  let textMuted = "#94a3b8";
  let statBoxBg = "#1a243b";

  if (config.theme === "indigo") {
    bgGradStart = "#0b1026";
    bgGradEnd = "#1e1b4b";
    accentColor = "#38bdf8";
    accentGradient = ["#6366f1", "#38bdf8"];
    cardBg = "#171d3d";
    cardBorder = "#2e3867";
    statBoxBg = "#202852";
  } else if (config.theme === "emerald") {
    bgGradStart = "#031a12";
    bgGradEnd = "#064e3b";
    accentColor = "#34d399";
    accentGradient = ["#059669", "#34d399"];
    cardBg = "#0b2c21";
    cardBorder = "#134e3a";
    statBoxBg = "#113d2f";
  } else if (config.theme === "minimal") {
    bgGradStart = "#f8fafc";
    bgGradEnd = "#f1f5f9";
    accentColor = "#4f46e5";
    accentGradient = ["#4f46e5", "#6366f1"];
    cardBg = "#ffffff";
    cardBorder = "#e2e8f0";
    textColor = "#0f172a";
    textMuted = "#64748b";
    statBoxBg = "#f8fafc";
  }

  // Draw background canvas
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, bgGradStart);
  bgGrad.addColorStop(1, bgGradEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative geometric glow circles
  const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 500);
  glowGrad.addColorStop(0, config.theme === "minimal" ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.22)");
  glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // Main Card container (with rounded corners)
  const cardMargin = 50;
  const cardWidth = width - cardMargin * 2;
  const cardHeight = height - cardMargin * 2;
  const cardRadius = 40;

  ctx.save();
  drawRoundedRect(ctx, cardMargin, cardMargin, cardWidth, cardHeight, cardRadius);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = cardBorder;
  ctx.stroke();
  ctx.restore();

  // Top header: MockTrack Branding & Tagline
  ctx.fillStyle = accentColor;
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("MOCKTRACK", cardMargin + 48, cardMargin + 72);

  ctx.fillStyle = textMuted;
  ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Track. Improve. Repeat.", cardMargin + 230, cardMargin + 71);

  // Top Right: Milestone or Achievement Tag if present
  if (data.milestoneTitle) {
    const tagText = data.milestoneTitle;
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const tagWidth = ctx.measureText(tagText).width + 36;
    const tagX = width - cardMargin - 48 - tagWidth;
    const tagY = cardMargin + 48;

    ctx.save();
    drawRoundedRect(ctx, tagX, tagY, tagWidth, 38, 19);
    ctx.fillStyle = config.theme === "minimal" ? "rgba(79, 70, 229, 0.1)" : "rgba(99, 102, 241, 0.25)";
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = config.theme === "minimal" ? accentColor : "#ffffff";
    ctx.fillText(tagText, tagX + 18, tagY + 25);
    ctx.restore();
  }

  // Divider line
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardMargin + 48, cardMargin + 104);
  ctx.lineTo(width - cardMargin - 48, cardMargin + 104);
  ctx.stroke();

  // Identity Section: Avatar + Name + Exam
  const avatarX = cardMargin + 48;
  const avatarY = cardMargin + 135;
  const avatarSize = 100;

  // Draw avatar circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (config.avatarType === "photo" && data.avatarPhotoUrl) {
    try {
      const img = await loadImage(data.avatarPhotoUrl);
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
    } catch {
      drawDefaultAvatar(ctx, avatarX, avatarY, avatarSize, data.avatarSeed, accentGradient);
    }
  } else if (config.avatarType === "emoji") {
    const grad = ctx.createLinearGradient(avatarX, avatarY, avatarX + avatarSize, avatarY + avatarSize);
    grad.addColorStop(0, accentGradient[0]);
    grad.addColorStop(1, accentGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.fillStyle = "#ffffff";
    ctx.font = "46px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.avatarEmoji || "🎯", avatarX + avatarSize / 2, avatarY + avatarSize / 2);
  } else {
    drawDefaultAvatar(ctx, avatarX, avatarY, avatarSize, data.avatarSeed, accentGradient);
  }
  ctx.restore();

  // Avatar border
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // User Name & Exam title
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = textColor;
  ctx.font = "900 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(data.userName.toUpperCase(), avatarX + avatarSize + 28, avatarY + 44);

  // Exam Badge
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const examText = data.examName;
  const examWidth = ctx.measureText(examText).width + 30;
  const examBadgeX = avatarX + avatarSize + 28;
  const examBadgeY = avatarY + 60;

  ctx.save();
  drawRoundedRect(ctx, examBadgeX, examBadgeY, examWidth, 36, 12);
  ctx.fillStyle = config.theme === "minimal" ? "#eef2ff" : "rgba(255, 255, 255, 0.08)";
  ctx.fill();
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = config.theme === "minimal" ? "#4338ca" : "#cbd5e1";
  ctx.fillText(examText, examBadgeX + 15, examBadgeY + 25);
  ctx.restore();

  // -------------------------------------------------------------
  // CORE STATS SECTION (Total Mocks, Highest Score, Average Score)
  // -------------------------------------------------------------
  const statCardY = cardMargin + 280;
  const statCardWidth = (cardWidth - 96 - 36) / 3;
  const statCardHeight = 220;

  const coreStats = [
    { label: "MOCKS LOGGED", value: String(data.totalMocks), sub: "Tests Completed", color: accentColor },
    { label: "HIGHEST SCORE", value: data.highestScoreDisplay, sub: "Personal Best", color: "#f59e0b" },
    { label: "AVERAGE SCORE", value: data.averageScoreDisplay, sub: "Full Mocks", color: "#10b981" },
  ];

  coreStats.forEach((st, i) => {
    const x = cardMargin + 48 + i * (statCardWidth + 18);
    ctx.save();
    drawRoundedRect(ctx, x, statCardY, statCardWidth, statCardHeight, 24);
    ctx.fillStyle = statBoxBg;
    ctx.fill();
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value
    ctx.fillStyle = st.color;
    ctx.font = "900 58px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(st.value, x + statCardWidth / 2, statCardY + 95);

    // Label
    ctx.fillStyle = textColor;
    ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(st.label, x + statCardWidth / 2, statCardY + 140);

    // Subtitle
    ctx.fillStyle = textMuted;
    ctx.font = "500 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(st.sub, x + statCardWidth / 2, statCardY + 175);

    ctx.restore();
  });

  // -------------------------------------------------------------
  // OPTIONAL STATS SECTION (Streak, Longest, Time, Accuracy, Weekly)
  // -------------------------------------------------------------
  const optionalItems: { label: string; value: string; icon: string }[] = [];
  if (data.streakDays !== undefined && data.streakDays > 0) {
    optionalItems.push({ label: "Current Streak", value: `${data.streakDays} Days`, icon: "🔥" });
  }
  if (data.longestStreakDays !== undefined && data.longestStreakDays > 0) {
    optionalItems.push({ label: "Longest Streak", value: `${data.longestStreakDays} Days`, icon: "⭐" });
  }
  if (data.practiceTimeDisplay) {
    optionalItems.push({ label: "Practice Time", value: data.practiceTimeDisplay, icon: "⏱" });
  }
  if (data.accuracyDisplay && data.accuracyDisplay !== "--") {
    optionalItems.push({ label: "Accuracy", value: data.accuracyDisplay, icon: "🎯" });
  }
  if (data.weeklyMocksDisplay) {
    optionalItems.push({ label: "Weekly Goal", value: data.weeklyMocksDisplay, icon: "📅" });
  }

  if (optionalItems.length > 0) {
    const optY = statCardY + statCardHeight + 36;
    const optColumns = Math.min(optionalItems.length, 3);
    const optWidth = (cardWidth - 96 - (optColumns - 1) * 16) / optColumns;

    optionalItems.slice(0, 3).forEach((item, idx) => {
      const optX = cardMargin + 48 + idx * (optWidth + 16);
      ctx.save();
      drawRoundedRect(ctx, optX, optY, optWidth, 120, 20);
      ctx.fillStyle = statBoxBg;
      ctx.fill();
      ctx.strokeStyle = cardBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = textMuted;
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`${item.icon} ${item.label.toUpperCase()}`, optX + optWidth / 2, optY + 45);

      ctx.fillStyle = textColor;
      ctx.font = "800 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(item.value, optX + optWidth / 2, optY + 88);
      ctx.restore();
    });
  }

  // -------------------------------------------------------------
  // FOOTER: Clean, subtle branding + date
  // -------------------------------------------------------------
  const footerY = height - cardMargin - 80;
  ctx.save();
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardMargin + 48, footerY);
  ctx.lineTo(width - cardMargin - 48, footerY);
  ctx.stroke();

  // Subtle "Made with MockTrack"
  ctx.textAlign = "left";
  ctx.fillStyle = textMuted;
  ctx.font = "600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Made with MockTrack", cardMargin + 48, footerY + 48);

  ctx.textAlign = "right";
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  ctx.fillText(dateStr, width - cardMargin - 48, footerY + 48);
  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas blob conversion failed"));
    }, "image/png");
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawDefaultAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seed: string,
  gradientColors: string[]
) {
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, gradientColors[0]);
  grad.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, size, size);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(size * 0.42)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(seed.slice(0, 2).toUpperCase(), x + size / 2, y + size / 2);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
