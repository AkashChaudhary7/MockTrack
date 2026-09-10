import { ExamProfile, MockAttempt, CandidateProfile, ScoreCardConfig } from "../types";
import { formatPracticeTime } from "./habitUtils";

export interface ScoreCardData {
  userName: string;
  userInitials: string;
  examName: string;
  totalMocks: number;
  highestScoreDisplay: string;
  highestScoreRaw?: number;
  highestScoreMax?: number;
  highestScorePct?: number;
  averageScoreDisplay: string;
  averageScoreRaw?: number;
  averageScoreMax?: number;
  streakDays?: number;
  longestStreakDays?: number;
  practiceTimeDisplay?: string;
  weeklyMocksDisplay?: string;
  accuracyDisplay?: string;
  milestoneTitle?: string;
  targetScore?: number;
  targetScoreDisplay?: string;
  targetMet?: boolean;
  targetDeltaDisplay?: string;
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return "AS";
  const cleaned = name.trim().replace(/[^a-zA-Z\s]/g, "");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0][0].toUpperCase() + "T";
  }
  return "AS";
}

/**
 * Extracts and prepares accurate stats for the score card
 */
export function prepareScoreCardData(
  candidate: CandidateProfile,
  activeExam: ExamProfile,
  attempts: MockAttempt[],
  config?: Partial<ScoreCardConfig>,
  streakDays: number = 0,
  longestStreakDays: number = 0,
  practiceTimeMinutes: number = 0,
  weeklyMocksCount: number = 0,
  weeklyGoal: number = 7,
  milestoneTitle?: string
): ScoreCardData {
  const isCurrentExamOnly = config?.scope !== "all_exams";
  const relevantAttempts = isCurrentExamOnly
    ? attempts.filter((a) => a.profileId === activeExam.id)
    : attempts;

  // IMPORTANT: Filter ONLY "Full Mock" tests for Average and Highest Score calculations
  const fullMocks = relevantAttempts.filter(
    (a) => a.testType === "Full Mock" || (!a.testType && a.maxMarks === activeExam.totalMarks)
  );

  const highestScoreVal = fullMocks.length > 0 ? Math.max(...fullMocks.map((m) => m.score)) : 0;
  const highestScoreMock = fullMocks.find((m) => m.score === highestScoreVal);
  const highestMax = highestScoreMock && highestScoreMock.maxMarks > 0
    ? highestScoreMock.maxMarks
    : (activeExam.totalMarks > 0 ? activeExam.totalMarks : 200);
  const highestPct = highestMax > 0 ? Math.round((highestScoreVal / highestMax) * 100) : 0;

  const highestScoreDisplay = highestScoreVal > 0 ? `${highestScoreVal}/${highestMax} (${highestPct}%)` : "--";

  const avgScoreVal = fullMocks.length > 0
    ? fullMocks.reduce((acc, m) => acc + m.score, 0) / fullMocks.length
    : 0;
  const avgRounded = Math.round(avgScoreVal * 10) / 10;
  const avgMax = activeExam.totalMarks > 0 ? activeExam.totalMarks : 200;
  const avgPct = avgMax > 0 ? Math.round((avgScoreVal / avgMax) * 100) : 0;
  const averageScoreDisplay = avgScoreVal > 0 ? `${avgRounded}/${avgMax} (${avgPct}%)` : "--";

  // Accuracy
  const totalCorrect = relevantAttempts.reduce((acc, m) => acc + (m.correctCount || 0), 0);
  const totalIncorrect = relevantAttempts.reduce((acc, m) => acc + (m.incorrectCount || 0), 0);
  const totalAttempted = totalCorrect + totalIncorrect;
  const accuracyPct = totalAttempted > 0
    ? `${(Math.round((totalCorrect / totalAttempted) * 1000) / 10)}%`
    : "--";

  // Target Status
  const targetVal = activeExam.targetScore || Math.round(activeExam.totalMarks * 0.75);
  const targetMet = (highestScoreVal >= targetVal) || (avgScoreVal >= targetVal);
  const bestDiff = highestScoreVal > 0 ? Math.round((highestScoreVal - targetVal) * 10) / 10 : 0;
  const targetDeltaDisplay = targetMet
    ? `+${bestDiff} pts Target Met`
    : `${Math.abs(bestDiff)} pts to Target (${targetVal})`;

  return {
    userName: candidate.name || "Aspirant",
    userInitials: getInitials(candidate.name),
    examName: isCurrentExamOnly ? (activeExam.shortCode || activeExam.name) : "All Mock Tests",
    totalMocks: relevantAttempts.length,
    highestScoreDisplay,
    highestScoreRaw: highestScoreVal,
    highestScoreMax: highestMax,
    highestScorePct: highestPct,
    averageScoreDisplay,
    averageScoreRaw: avgRounded,
    averageScoreMax: avgMax,
    streakDays: streakDays > 0 ? streakDays : undefined,
    longestStreakDays: longestStreakDays > 0 ? longestStreakDays : undefined,
    practiceTimeDisplay: practiceTimeMinutes > 0 ? formatPracticeTime(practiceTimeMinutes) : undefined,
    weeklyMocksDisplay: weeklyMocksCount > 0 ? `${weeklyMocksCount}/${weeklyGoal} Goal` : undefined,
    accuracyDisplay: accuracyPct !== "--" ? accuracyPct : undefined,
    milestoneTitle,
    targetScore: targetVal,
    targetScoreDisplay: `${targetVal}/${activeExam.totalMarks}`,
    targetMet,
    targetDeltaDisplay,
  };
}

/**
 * Draw the high-resolution score card onto a canvas in Ivory White with Doodles & High-Visibility Typography
 */
export async function generateScoreCardBlob(
  data: ScoreCardData,
  config?: ScoreCardConfig
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1350; // Standard 4:5 portrait social format
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // 1. BASE BACKGROUND: Ivory White with Subtle Warm Lighting
  const ivoryBg = ctx.createLinearGradient(0, 0, width, height);
  ivoryBg.addColorStop(0, "#FAF8F5"); // Ivory white
  ivoryBg.addColorStop(0.5, "#FCFBF9"); // Bright ivory
  ivoryBg.addColorStop(1, "#F6F1EA"); // Soft warm ivory cream
  ctx.fillStyle = ivoryBg;
  ctx.fillRect(0, 0, width, height);

  // Soft subtle warm ambient radial glow
  const centerGlow = ctx.createRadialGradient(width / 2, height * 0.35, 80, width / 2, height * 0.35, 600);
  centerGlow.addColorStop(0, "rgba(255, 255, 255, 0.9)");
  centerGlow.addColorStop(1, "rgba(246, 241, 234, 0)");
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, width, height);

  // 2. BACKGROUND DOODLES (Handcrafted vector doodles across the ivory white canvas)
  drawBackgroundDoodles(ctx, width, height);

  // 3. MAIN CARD CONTAINER (Ivory card with double crisp border and gentle shadow)
  const cardMargin = 44;
  const cardWidth = width - cardMargin * 2;
  const cardHeight = height - cardMargin * 2;
  const cardRadius = 36;

  ctx.save();
  // Outer subtle shadow
  ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;

  drawRoundedRect(ctx, cardMargin, cardMargin, cardWidth, cardHeight, cardRadius);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#E2D9CF";
  ctx.stroke();

  // Inner decorative dashed/dotted border line for notebook craft feel
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
  ctx.setLineDash([6, 6]);
  drawRoundedRect(ctx, cardMargin + 10, cardMargin + 10, cardWidth - 20, cardHeight - 20, cardRadius - 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 4. HEADER SECTION: Branding + Performance Scorecard Pill
  const contentX = cardMargin + 48;
  const headerY = cardMargin + 56;

  // App Brand Logo & Name
  ctx.save();
  // Small brand mark container
  drawRoundedRect(ctx, contentX, headerY, 44, 44, 12);
  ctx.fillStyle = "#4338CA";
  ctx.fill();

  // Draw 2 target rings inside brand mark
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(contentX + 22, headerY + 22, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(contentX + 22, headerY + 22, 5, 0, Math.PI * 2);
  ctx.fill();

  // Brand Name & Tagline (High contrast)
  ctx.textAlign = "left";
  ctx.fillStyle = "#1E1B4B";
  ctx.font = "900 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("MOCKTRACK", contentX + 56, headerY + 28);

  ctx.fillStyle = "#64748B";
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("OFFICIAL MOCK TEST PERFORMANCE SCORECARD", contentX + 56, headerY + 44);
  ctx.restore();

  // Right Header: Target or Milestone Pill
  const rightPillText = data.milestoneTitle || (data.targetMet ? "TARGET MET 🎯" : "ON TRACK 🚀");
  ctx.font = "900 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const pillW = ctx.measureText(rightPillText).width + 36;
  const pillX = width - cardMargin - 48 - pillW;
  const pillY = headerY + 4;

  ctx.save();
  drawRoundedRect(ctx, pillX, pillY, pillW, 38, 19);
  ctx.fillStyle = data.targetMet ? "#ECFDF5" : "#EEF2FF";
  ctx.fill();
  ctx.strokeStyle = data.targetMet ? "#10B981" : "#6366F1";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = data.targetMet ? "#065F46" : "#3730A3";
  ctx.textAlign = "center";
  ctx.fillText(rightPillText, pillX + pillW / 2, pillY + 25);
  ctx.restore();

  // Divider Line
  ctx.strokeStyle = "#E8E2D9";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, headerY + 70);
  ctx.lineTo(width - cardMargin - 48, headerY + 70);
  ctx.stroke();

  // 5. ASPIRANT IDENTITY ROW (Initials ONLY Avatar + Name + Exam)
  const identityY = headerY + 95;
  const avatarSize = 96;

  // Draw Initials-Only Avatar Badge
  ctx.save();
  drawRoundedRect(ctx, contentX, identityY, avatarSize, avatarSize, 28);
  const avatarGrad = ctx.createLinearGradient(contentX, identityY, contentX + avatarSize, identityY + avatarSize);
  avatarGrad.addColorStop(0, "#312E81");
  avatarGrad.addColorStop(1, "#4338CA");
  ctx.fillStyle = avatarGrad;
  ctx.fill();

  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "#C7D2FE";
  ctx.stroke();

  // Initials Text (Centered & Bold White)
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(data.userInitials, contentX + avatarSize / 2, identityY + avatarSize / 2);
  ctx.restore();

  // Name & Exam Badges (High Contrast)
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Name
  ctx.fillStyle = "#0F172A";
  ctx.font = "900 40px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(data.userName.toUpperCase(), contentX + avatarSize + 24, identityY + 44);

  // Exam Name Tag + Target Delta
  const examTagText = `📚 ${data.examName}`;
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const examTagWidth = ctx.measureText(examTagText).width + 24;
  const examTagX = contentX + avatarSize + 24;
  const examTagY = identityY + 58;

  drawRoundedRect(ctx, examTagX, examTagY, examTagWidth, 34, 10);
  ctx.fillStyle = "#F1F5F9";
  ctx.fill();
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#1E293B";
  ctx.fillText(examTagText, examTagX + 12, examTagY + 24);

  // Target Status Tag
  if (data.targetDeltaDisplay) {
    const targetTagX = examTagX + examTagWidth + 12;
    const targetTagText = `🎯 ${data.targetDeltaDisplay}`;
    const targetTagW = ctx.measureText(targetTagText).width + 24;

    drawRoundedRect(ctx, targetTagX, examTagY, targetTagW, 34, 10);
    ctx.fillStyle = data.targetMet ? "#ECFDF5" : "#FFFBEB";
    ctx.fill();
    ctx.strokeStyle = data.targetMet ? "#6EE7B7" : "#FDE68A";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = data.targetMet ? "#047857" : "#B45309";
    ctx.fillText(targetTagText, targetTagX + 12, examTagY + 24);
  }
  ctx.restore();

  // 6. CORE 3 HERO STAT PILLARS (High Visibility on Ivory)
  const pillarsY = identityY + 130;
  const totalW = width - cardMargin * 2 - 96;
  const pillarGap = 20;
  const pillarW = (totalW - pillarGap * 2) / 3;
  const pillarH = 220;

  const corePillars = [
    {
      label: "MOCKS LOGGED",
      val: String(data.totalMocks),
      unit: "Tests",
      sub: "Completed Attempts",
      color: "#3730A3", // Deep Indigo
      bg: "#EEF2FF",
      border: "#C7D2FE",
      icon: "📋",
    },
    {
      label: "HIGHEST SCORE",
      val: data.highestScoreRaw ? String(data.highestScoreRaw) : "--",
      unit: data.highestScoreMax ? `/${data.highestScoreMax}` : "",
      sub: data.highestScorePct ? `Personal Best • ${data.highestScorePct}%` : "Best Full Mock",
      color: "#B45309", // Deep Amber
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "🏆",
    },
    {
      label: "AVERAGE SCORE",
      val: data.averageScoreRaw ? String(data.averageScoreRaw) : "--",
      unit: data.averageScoreMax ? `/${data.averageScoreMax}` : "",
      sub: data.averageScoreDisplay.includes("%") ? `Full Mocks • ${data.averageScoreDisplay.split("(")[1]?.replace(")", "") || ""}` : "Overall Benchmark",
      color: "#047857", // Deep Emerald
      bg: "#ECFDF5",
      border: "#A7F3D0",
      icon: "📈",
    },
  ];

  corePillars.forEach((p, idx) => {
    const px = contentX + idx * (pillarW + pillarGap);

    ctx.save();
    // Card box with shadow
    drawRoundedRect(ctx, px, pillarsY, pillarW, pillarH, 24);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = p.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top icon pill
    drawRoundedRect(ctx, px + 20, pillarsY + 20, 36, 36, 10);
    ctx.fillStyle = p.bg;
    ctx.fill();
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.icon, px + 38, pillarsY + 38);

    // Label
    ctx.textAlign = "left";
    ctx.fillStyle = "#475569";
    ctx.font = "900 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(p.label, px + 68, pillarsY + 39);

    // Big Hero Value
    ctx.fillStyle = p.color;
    ctx.font = "900 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(p.val, px + 20, pillarsY + 124);

    // Unit if present
    if (p.unit) {
      const valWidth = ctx.measureText(p.val).width;
      ctx.fillStyle = "#64748B";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(p.unit, px + 24 + valWidth, pillarsY + 120);
    }

    // Subtitle note
    ctx.fillStyle = "#334155";
    ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(p.sub, px + 20, pillarsY + 172);

    ctx.restore();
  });

  // 7. SECONDARY COOL STATS ROW (Accuracy, Streak, Practice Time, Target)
  const secondaryY = pillarsY + pillarH + 28;
  const secondaryItems: Array<{ icon: string; label: string; val: string; color: string; bg: string; border: string }> = [];

  if (data.accuracyDisplay) {
    secondaryItems.push({
      icon: "🎯",
      label: "ACCURACY RATE",
      val: data.accuracyDisplay,
      color: "#0369A1",
      bg: "#F0F9FF",
      border: "#BAE6FD",
    });
  }
  if (data.streakDays) {
    secondaryItems.push({
      icon: "🔥",
      label: "ACTIVE STREAK",
      val: `${data.streakDays} Days`,
      color: "#C2410C",
      bg: "#FFF7ED",
      border: "#FFEDD5",
    });
  }
  if (data.practiceTimeDisplay) {
    secondaryItems.push({
      icon: "⏱️",
      label: "PRACTICE TIME",
      val: data.practiceTimeDisplay,
      color: "#6D28D9",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    });
  }
  if (data.weeklyMocksDisplay) {
    secondaryItems.push({
      icon: "📅",
      label: "WEEKLY GOAL",
      val: data.weeklyMocksDisplay,
      color: "#0F766E",
      bg: "#F0FDFA",
      border: "#CCFBF1",
    });
  } else {
    secondaryItems.push({
      icon: "⚡",
      label: "CONSISTENCY",
      val: "Top Tier",
      color: "#4338CA",
      bg: "#EEF2FF",
      border: "#C7D2FE",
    });
  }

  const secCount = Math.min(secondaryItems.length, 4);
  const secGap = 16;
  const secW = (totalW - secGap * (secCount - 1)) / secCount;
  const secH = 104;

  secondaryItems.slice(0, 4).forEach((item, i) => {
    const sx = contentX + i * (secW + secGap);

    ctx.save();
    drawRoundedRect(ctx, sx, secondaryY, secW, secH, 20);
    ctx.fillStyle = item.bg;
    ctx.fill();
    ctx.strokeStyle = item.border;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#475569";
    ctx.font = "900 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(`${item.icon} ${item.label}`, sx + 18, secondaryY + 34);

    ctx.fillStyle = item.color;
    ctx.font = "900 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(item.val, sx + 18, secondaryY + 76);
    ctx.restore();
  });

  // 8. COOL MOTIVATIONAL BANNER
  const bannerY = secondaryY + secH + 28;
  const bannerH = 58;

  ctx.save();
  drawRoundedRect(ctx, contentX, bannerY, totalW, bannerH, 16);
  ctx.fillStyle = "#F8FAFC";
  ctx.fill();
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1E293B";
  ctx.font = "900 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("⚡ CONSISTENCY BEATS TALENT • TRACK. IMPROVE. REPEAT. ⚡", contentX + totalW / 2, bannerY + bannerH / 2);
  ctx.restore();

  // 9. GOOGLE PLAY STORE BADGING SECTION (AT THE BOTTOM OF THE CARD)
  const footerAreaY = bannerY + bannerH + 32;

  ctx.save();
  // Bottom divider
  ctx.strokeStyle = "#E8E2D9";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, footerAreaY);
  ctx.lineTo(width - cardMargin - 48, footerAreaY);
  ctx.stroke();

  // Google Play Badge Container
  const playBadgeW = 340;
  const playBadgeH = 80;
  const playBadgeX = (width - playBadgeW) / 2;
  const playBadgeY = footerAreaY + 32;

  drawRoundedRect(ctx, playBadgeX, playBadgeY, playBadgeW, playBadgeH, 20);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Google Play Colored Logo
  const logoX = playBadgeX + 22;
  const logoY = playBadgeY + 16;
  const logoW = 44;
  const logoH = 48;

  // 1. Cyan Left Polygon
  ctx.fillStyle = "#00D2FF";
  ctx.beginPath();
  ctx.moveTo(logoX, logoY);
  ctx.lineTo(logoX + logoW * 0.58, logoY + logoH * 0.5);
  ctx.lineTo(logoX, logoY + logoH);
  ctx.closePath();
  ctx.fill();

  // 2. Green Top Polygon
  ctx.fillStyle = "#00E676";
  ctx.beginPath();
  ctx.moveTo(logoX, logoY);
  ctx.lineTo(logoX + logoW * 0.76, logoY + logoH * 0.34);
  ctx.lineTo(logoX + logoW * 0.58, logoY + logoH * 0.5);
  ctx.closePath();
  ctx.fill();

  // 3. Red Bottom Polygon
  ctx.fillStyle = "#FF334B";
  ctx.beginPath();
  ctx.moveTo(logoX, logoY + logoH);
  ctx.lineTo(logoX + logoW * 0.76, logoY + logoH * 0.66);
  ctx.lineTo(logoX + logoW * 0.58, logoY + logoH * 0.5);
  ctx.closePath();
  ctx.fill();

  // 4. Yellow Right Polygon
  ctx.fillStyle = "#FFCB00";
  ctx.beginPath();
  ctx.moveTo(logoX + logoW * 0.58, logoY + logoH * 0.5);
  ctx.lineTo(logoX + logoW * 0.76, logoY + logoH * 0.34);
  ctx.lineTo(logoX + logoW, logoY + logoH * 0.5);
  ctx.lineTo(logoX + logoW * 0.76, logoY + logoH * 0.66);
  ctx.closePath();
  ctx.fill();

  // Badge Text
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("GET IT ON", playBadgeX + 78, playBadgeY + 34);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Google Play", playBadgeX + 78, playBadgeY + 62);

  // App download callout banner text directly above/below
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A";
  ctx.font = "900 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("Download MockTrack : Mock Score Tracker from Google Play Store", width / 2, playBadgeY + playBadgeH + 34);

  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas blob conversion failed"));
    }, "image/png");
  });
}

/**
 * Draw handcrafted subtle vector doodles across the ivory white background
 */
function drawBackgroundDoodles(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const doodleSlate = "rgba(71, 85, 105, 0.18)";
  const doodleIndigo = "rgba(79, 70, 229, 0.22)";
  const doodleAmber = "rgba(217, 119, 6, 0.24)";
  const doodleEmerald = "rgba(5, 150, 105, 0.20)";

  // 1. Target Bullseye (Top-Right Margin)
  drawBullseyeDoodle(ctx, width - 90, 80, 28, doodleIndigo);

  // 2. Star Sparkles (Top-Left & Middle)
  drawSparkleDoodle(ctx, 80, 85, 20, doodleAmber);
  drawSparkleDoodle(ctx, width - 110, 220, 16, doodleAmber);
  drawSparkleDoodle(ctx, 75, 420, 22, doodleIndigo);
  drawSparkleDoodle(ctx, width - 75, 680, 24, doodleAmber);
  drawSparkleDoodle(ctx, 85, 940, 18, doodleEmerald);
  drawSparkleDoodle(ctx, width - 85, 1060, 22, doodleIndigo);

  // 3. Trophy Doodle (Left margin, near mid)
  drawTrophyDoodle(ctx, 55, 600, 36, doodleAmber);

  // 4. Graduation Cap (Right margin, upper)
  drawMortarboardDoodle(ctx, width - 105, 480, 42, doodleSlate);

  // 5. Fire Flame Doodle (Left margin, lower)
  drawFlameDoodle(ctx, 60, 780, 34, doodleAmber);

  // 6. Stopwatch Doodle (Right margin, near bottom)
  drawStopwatchDoodle(ctx, width - 95, 870, 32, doodleIndigo);

  // 7. Upward Growth Arrow (Bottom-Left margin)
  drawTrendArrowDoodle(ctx, 55, 1120, 46, 32, doodleEmerald);

  // 8. Math symbols (% and 100 and +)
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = doodleIndigo;
  ctx.fillText("%", width - 80, 380);

  ctx.font = "900 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = doodleEmerald;
  ctx.fillText("100", 55, 260);

  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = doodleAmber;
  ctx.fillText("★", width - 75, 590);

  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = doodleSlate;
  ctx.fillText("+", 65, 1040);

  // 9. Tiny confetti dots scattered gracefully
  const dots = [
    { x: 100, y: 180 }, { x: width - 60, y: 140 }, { x: 60, y: 350 },
    { x: width - 90, y: 760 }, { x: 80, y: 880 }, { x: width - 60, y: 990 },
    { x: 110, y: 1240 }, { x: width - 80, y: 1220 }
  ];
  dots.forEach(d => {
    ctx.fillStyle = doodleSlate;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawBullseyeDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Arrow shaft
  ctx.beginPath();
  ctx.moveTo(cx + r * 1.2, cy - r * 1.2);
  ctx.lineTo(cx, cy);
  ctx.stroke();

  // Arrow feathers
  ctx.beginPath();
  ctx.moveTo(cx + r * 1.2, cy - r * 1.2);
  ctx.lineTo(cx + r * 1.2 - 6, cy - r * 1.2);
  ctx.moveTo(cx + r * 1.2, cy - r * 1.2);
  ctx.lineTo(cx + r * 1.2, cy - r * 1.2 + 6);
  ctx.stroke();
}

function drawSparkleDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.stroke();
}

function drawTrophyDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  const half = size / 2;

  // Cup body
  ctx.beginPath();
  ctx.moveTo(cx - half * 0.7, cy - half);
  ctx.lineTo(cx + half * 0.7, cy - half);
  ctx.quadraticCurveTo(cx + half * 0.7, cy + half * 0.2, cx, cy + half * 0.35);
  ctx.quadraticCurveTo(cx - half * 0.7, cy + half * 0.2, cx - half * 0.7, cy - half);
  ctx.stroke();

  // Stem & Base
  ctx.beginPath();
  ctx.moveTo(cx, cy + half * 0.35);
  ctx.lineTo(cx, cy + half * 0.75);
  ctx.moveTo(cx - half * 0.6, cy + half * 0.75);
  ctx.lineTo(cx + half * 0.6, cy + half * 0.75);
  ctx.stroke();

  // Handles
  ctx.beginPath();
  ctx.arc(cx - half * 0.7, cy - half * 0.3, half * 0.35, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + half * 0.7, cy - half * 0.3, half * 0.35, Math.PI * 1.5, Math.PI * 0.5, false);
  ctx.stroke();
}

function drawMortarboardDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  const half = size / 2;

  // Diamond Cap
  ctx.beginPath();
  ctx.moveTo(cx, cy - half * 0.5);
  ctx.lineTo(cx + half, cy);
  ctx.lineTo(cx, cy + half * 0.5);
  ctx.lineTo(cx - half, cy);
  ctx.closePath();
  ctx.stroke();

  // Skull Cap
  ctx.beginPath();
  ctx.moveTo(cx - half * 0.5, cy + half * 0.25);
  ctx.quadraticCurveTo(cx, cy + half * 0.8, cx + half * 0.5, cy + half * 0.25);
  ctx.stroke();

  // Tassel
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + half * 0.8, cy + half * 0.6);
  ctx.stroke();
}

function drawFlameDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  const half = size / 2;

  ctx.beginPath();
  ctx.moveTo(cx, cy + half);
  ctx.bezierCurveTo(cx + half, cy + half * 0.5, cx + half * 0.8, cy - half * 0.2, cx, cy - half);
  ctx.bezierCurveTo(cx - half * 0.3, cy - half * 0.2, cx - half * 0.3, cy + half * 0.2, cx, cy + half);
  ctx.stroke();
}

function drawStopwatchDoodle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  const r = size * 0.42;

  // Dial
  ctx.beginPath();
  ctx.arc(cx, cy + 4, r, 0, Math.PI * 2);
  ctx.stroke();

  // Top button
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4 - r);
  ctx.lineTo(cx, cy + 4 - r - 6);
  ctx.moveTo(cx - 5, cy + 4 - r - 6);
  ctx.lineTo(cx + 5, cy + 4 - r - 6);
  ctx.stroke();

  // Clock hands
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4);
  ctx.lineTo(cx, cy + 4 - r * 0.55);
  ctx.moveTo(cx, cy + 4);
  ctx.lineTo(cx + r * 0.4, cy + 4);
  ctx.stroke();
}

function drawTrendArrowDoodle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;

  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w * 0.35, y + h * 0.6);
  ctx.lineTo(x + w * 0.6, y + h * 0.8);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w - 10, y + 2);
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w - 2, y + 10);
  ctx.stroke();
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
