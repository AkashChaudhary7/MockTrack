import { jsPDF } from "jspdf";
import { MockAttempt, ExamProfile, CandidateProfile } from "../types";
import { calculateAnalytics } from "./analytics";

export function generateBilingualReportHTML(
  candidate: CandidateProfile,
  activeExam: ExamProfile,
  attempts: MockAttempt[]
): string {
  const analytics = calculateAnalytics(attempts, activeExam);
  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MockTrack Performance Report - ${candidate.name} (${activeExam.shortCode})</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      font-size: 14px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #4f46e5;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #e0e7ff;
      color: #3730a3;
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: 600;
      font-size: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      background: #f8fafc;
    }
    .card-title {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }
    .card-sub {
      font-size: 11px;
      color: #10b981;
      font-weight: 600;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 24px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      border-left: 4px solid #4f46e5;
      padding-left: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #4f46e5;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .hindi {
      font-size: 12px;
      color: #64748b;
      display: block;
    }
    .alert-box {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
      color: #92400e;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">🎯 MockTrack <span style="font-size:14px; color:#64748b;">Exam Analytics</span></div>
      <div style="font-weight:600; color:#475569; margin-top:4px;">Candidate: ${candidate.name} | Target: ${activeExam.name}</div>
      <div class="hindi">अभ्यर्थी का नाम: ${candidate.name} | लक्ष्य परीक्षा: ${activeExam.name}</div>
    </div>
    <div style="text-align:right;">
      <span class="badge">Bilingual Report / द्विभाषी रिपोर्ट</span>
      <div style="font-size:11px; color:#64748b; margin-top:6px;">Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Attempts / कुल मॉक</div>
      <div class="card-value">${analytics.totalMocks}</div>
      <div class="hindi">कुल प्रयास किए गए मॉक</div>
    </div>
    <div class="card">
      <div class="card-title">Average Score / औसत अंक</div>
      <div class="card-value">${analytics.averageScore} <span style="font-size:12px; color:#64748b;">/ ${activeExam.totalMarks}</span></div>
      <div class="hindi">औसत प्राप्तांक</div>
    </div>
    <div class="card">
      <div class="card-title">Peak Score / उच्चतम अंक</div>
      <div class="card-value">${analytics.peakScore}</div>
      <div class="hindi">व्यक्तिगत सर्वश्रेष्ठ अंक</div>
    </div>
    <div class="card">
      <div class="card-title">Overall Accuracy / सटीकता</div>
      <div class="card-value">${analytics.overallAccuracy}%</div>
      <div class="hindi">कुल प्रश्न सटीकता प्रतिशत</div>
    </div>
  </div>

  <div class="alert-box">
    <strong>⚠️ Negative Marking Penalty Analysis / नकारात्मक अंकन विश्लेषण:</strong><br/>
    ${analytics.avoidableMarksRecommendation}
    <div class="hindi" style="margin-top:4px;">अनुचित तुक्केबाजी से बचें: ${analytics.totalNegativeMarksLost} अंक नकारात्मक अंकन में गंवाए गए।</div>
  </div>

  <div class="section-title">
    <span>Mock Attempts History / मॉक टेस्ट का इतिहास</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date / तिथि</th>
        <th>Platform / प्लेटफॉर्म</th>
        <th>Test Title / टेस्ट का नाम</th>
        <th>Score / प्राप्तांक</th>
        <th>Accuracy / सटीकता</th>
        <th>Neg. Penalty / नकारात्मक नुकसान</th>
      </tr>
    </thead>
    <tbody>
      ${examAttempts.map(a => `
        <tr>
          <td>${a.date}</td>
          <td><strong>${a.platform.toUpperCase()}</strong></td>
          <td>${a.title}</td>
          <td><strong>${a.score}</strong> / ${a.maxMarks}</td>
          <td>${a.accuracy}%</td>
          <td style="color:#dc2626;">-${a.negativePenalty}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    Report generated by MockTrack — Offline-First Exam Performance Tracker.
  </div>
</body>
</html>
  `;
}

export function downloadBilingualReportPDF(
  candidate: CandidateProfile,
  activeExam: ExamProfile,
  attempts: MockAttempt[]
): void {
  const analytics = calculateAnalytics(attempts, activeExam);
  const examAttempts = attempts.filter((a) => a.profileId === activeExam.id);

  const doc = new jsPDF();
  let y = 15;

  // Title & Header
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text("MockTrack — Performance Report", 14, y);

  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Candidate: ${candidate.name}  |  Exam: ${activeExam.name}`, 14, y);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  doc.text(`Generated: ${dateStr}`, 150, y);

  y += 6;
  doc.setLineWidth(0.5);
  doc.setDrawColor(79, 70, 229);
  doc.line(14, y, 196, y);

  y += 12;

  // Summary Metrics Cards (Row 1)
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);

  const cardWidth = 42;
  const cards = [
    { label: "Total Mocks", val: `${analytics.totalMocks}` },
    { label: "Avg Score", val: `${analytics.averageScore} / ${activeExam.totalMarks}` },
    { label: "Peak Score", val: `${analytics.peakScore}` },
    { label: "Accuracy", val: `${analytics.overallAccuracy}%` },
  ];

  cards.forEach((c, idx) => {
    const x = 14 + idx * (cardWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, 20, 3, 3, "FD");

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(c.label.toUpperCase(), x + 4, y + 6);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(c.val, x + 4, y + 15);
  });

  y += 28;

  // Key Recommendation / Analysis Box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(14, y, 182, 16, 3, 3, "FD");

  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text(`Avoidable Penalty Recommendation: ${analytics.avoidableMarksRecommendation}`, 18, y + 10);

  y += 24;

  // Section: Mock Attempts Table
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text("Mock Attempt History", 14, y);
  y += 6;

  // Table Headers
  doc.setFillColor(79, 70, 229);
  doc.rect(14, y, 182, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Date", 18, y + 5.5);
  doc.text("Platform", 45, y + 5.5);
  doc.text("Title", 85, y + 5.5);
  doc.text("Score", 140, y + 5.5);
  doc.text("Accuracy", 170, y + 5.5);

  y += 8;

  // Table Rows
  doc.setTextColor(15, 23, 42);
  examAttempts.slice(0, 12).forEach((a, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 8, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, 196, y + 8);

    doc.text(a.date, 18, y + 5.5);
    doc.text(a.platform.toUpperCase(), 45, y + 5.5);
    const titleTrunc = a.title.length > 25 ? a.title.substring(0, 23) + "..." : a.title;
    doc.text(titleTrunc, 85, y + 5.5);
    doc.text(`${a.score} / ${a.maxMarks}`, 140, y + 5.5);
    doc.text(`${a.accuracy}%`, 170, y + 5.5);

    y += 8;
  });

  y += 15;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Generated by MockTrack — Track Every Mock. Improve Every Score.", 14, 285);

  doc.save(`MockTrack_${activeExam.shortCode}_Report_${dateStr.replace(/\s+/g, "_")}.pdf`);
}

