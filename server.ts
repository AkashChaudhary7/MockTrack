import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "MockTrack" });
  });

  // PWA & Digital Asset Links Routes for Play Console & PWABuilder Readiness
  app.get("/.well-known/assetlinks.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.sendFile(path.join(process.cwd(), "public", ".well-known", "assetlinks.json"));
  });

  app.get(["/manifest.webmanifest", "/manifest.json"], (req, res) => {
    res.setHeader("Content-Type", "application/manifest+json");
    res.sendFile(path.join(process.cwd(), "public", req.path.endsWith("webmanifest") ? "manifest.webmanifest" : "manifest.json"));
  });

  app.get("/sw.js", (_req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(process.cwd(), "public", "sw.js"));
  });

  // OCR Scorecard extraction endpoint
  app.post("/api/ocr-scorecard", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/png", webUrl, rawText } = req.body;

      // Helper for robustly parsing Testbook and other platform URL metadata and query parameters
      const parseUrlMetadata = (inputUrl: string) => {
        let platform = "Testbook";
        let examName = "SSC CGL";
        let testTitle = "Mock Test Analysis";
        let maxMarks = 200;
        let attemptNo = "1";

        let queryScore: number | undefined;
        let queryMaxMarks: number | undefined;
        let queryCorrect: number | undefined;
        let queryIncorrect: number | undefined;
        let queryAccuracy: number | undefined;
        let queryPercentile: number | undefined;
        let queryRank: number | undefined;
        let queryTitle: string | undefined;
        let querySections: any[] | undefined;

        let parsedUrl: URL | null = null;
        try {
          // Normalize URL
          const formattedUrl = inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`;
          parsedUrl = new URL(formattedUrl);
        } catch {
          parsedUrl = null;
        }

        const urlLower = inputUrl.toLowerCase();
        if (urlLower.includes("oliveboard")) platform = "Oliveboard";
        else if (urlLower.includes("pw") || urlLower.includes("physicswallah")) platform = "Physics Wallah";
        else if (urlLower.includes("adda247")) platform = "Adda247";
        else if (urlLower.includes("byju")) platform = "BYJU'S";
        else if (urlLower.includes("unacademy")) platform = "Unacademy";
        else platform = "Testbook";

        // 1. Extract Query Parameters (e.g. attemptNo=1, score=144.5, maxMarks=200, correct=77, incorrect=19, percentile=95.2, accuracy=80.2, rank=142)
        if (parsedUrl) {
          const sp = parsedUrl.searchParams;

          // Attempt number (attemptNo, attempt_no, attempt, attemptId)
          const attVal = sp.get("attemptNo") || sp.get("attempt_no") || sp.get("attempt") || sp.get("attemptId") || sp.get("attempt_id");
          if (attVal) {
            const num = attVal.replace(/\D/g, "");
            if (num) attemptNo = num;
          }

          // Score / Marks
          const scoreVal = sp.get("score") || sp.get("marks") || sp.get("obtained") || sp.get("marksObtained") || sp.get("total_score") || sp.get("sc");
          if (scoreVal && !isNaN(parseFloat(scoreVal))) {
            queryScore = parseFloat(scoreVal);
          }

          // Max Marks / Total
          const maxVal = sp.get("maxMarks") || sp.get("max_marks") || sp.get("totalMarks") || sp.get("total_marks") || sp.get("total") || sp.get("outOf");
          if (maxVal && !isNaN(parseFloat(maxVal))) {
            queryMaxMarks = parseFloat(maxVal);
          }

          // Correct count
          const corrVal = sp.get("correct") || sp.get("correctCount") || sp.get("correct_count") || sp.get("correct_qs") || sp.get("right");
          if (corrVal && !isNaN(parseInt(corrVal, 10))) {
            queryCorrect = parseInt(corrVal, 10);
          }

          // Incorrect count
          const incorrVal = sp.get("incorrect") || sp.get("incorrectCount") || sp.get("incorrect_count") || sp.get("wrong_qs") || sp.get("wrong");
          if (incorrVal && !isNaN(parseInt(incorrVal, 10))) {
            queryIncorrect = parseInt(incorrVal, 10);
          }

          // Accuracy
          const accVal = sp.get("accuracy") || sp.get("acc") || sp.get("accuracy_pct");
          if (accVal && !isNaN(parseFloat(accVal))) {
            queryAccuracy = parseFloat(accVal);
          }

          // Percentile
          const pctVal = sp.get("percentile") || sp.get("pct") || sp.get("percentile_score");
          if (pctVal && !isNaN(parseFloat(pctVal))) {
            queryPercentile = parseFloat(pctVal);
          }

          // Rank
          const rkVal = sp.get("rank") || sp.get("user_rank") || sp.get("air");
          if (rkVal && !isNaN(parseInt(rkVal, 10))) {
            queryRank = parseInt(rkVal, 10);
          }

          // Title / Test Name
          const titleVal = sp.get("title") || sp.get("testTitle") || sp.get("test_name") || sp.get("testName") || sp.get("name");
          if (titleVal) {
            queryTitle = decodeURIComponent(titleVal);
          }

          // Sections in query params (e.g., sections=Quant:45/50,Reasoning:48/50...)
          const secVal = sp.get("sections") || sp.get("subjects") || sp.get("section_scores");
          if (secVal) {
            try {
              if (secVal.startsWith("[") || secVal.startsWith("{")) {
                querySections = JSON.parse(secVal);
              } else {
                // Parse format "Quant:45/50,Reasoning:48/50"
                const parts = secVal.split(/[,;]/);
                querySections = parts.map((part) => {
                  const [name, scorePart] = part.split(":");
                  if (name && scorePart) {
                    const [s, m] = scorePart.split("/");
                    return {
                      name: name.trim(),
                      score: parseFloat(s) || 0,
                      maxMarks: parseFloat(m) || 50,
                    };
                  }
                  return null;
                }).filter(Boolean);
              }
            } catch {
              // Ignore invalid section JSON
            }
          }
        }

        // Regex fallback for attemptNo if not found via searchParams
        if (attemptNo === "1") {
          const attemptMatch = inputUrl.match(/attempt[Nn]o[=_](\d+)/i) || inputUrl.match(/attempt[=_](\d+)/i);
          if (attemptMatch) attemptNo = attemptMatch[1];
        }

        // 2. Parse URL path patterns for Testbook
        const testbookMatch = inputUrl.match(/testbook\.com\/(?:TS-|test-series\/)?([a-zA-Z0-9-]+)(?:\/tests\/([a-zA-Z0-9]+))?/i);
        if (testbookMatch) {
          const rawSlug = testbookMatch[1] || "";
          let cleanSlug = rawSlug.replace(/^ts-/i, "").replace(/-/g, " ").toUpperCase();
          
          if (cleanSlug.includes("DSSSB")) {
            examName = "DSSSB TGT";
            maxMarks = 200;
          } else if (cleanSlug.includes("CGL")) {
            if (cleanSlug.includes("TIER 2") || cleanSlug.includes("MAINS")) {
              examName = "SSC CGL Tier 2";
              maxMarks = 390;
            } else {
              examName = "SSC CGL Tier 1";
              maxMarks = 200;
            }
          } else if (cleanSlug.includes("CHSL")) {
            if (cleanSlug.includes("TIER 2") || cleanSlug.includes("MAINS")) {
              examName = "SSC CHSL Tier 2";
              maxMarks = 360;
            } else {
              examName = "SSC CHSL Tier 1";
              maxMarks = 200;
            }
          } else if (cleanSlug.includes("MTS")) {
            examName = "SSC MTS";
            maxMarks = 150;
          } else if (cleanSlug.includes("GD")) {
            examName = "SSC GD Constable";
            maxMarks = 160;
          } else if (cleanSlug.includes("CPO")) {
            examName = "SSC CPO";
            maxMarks = 200;
          } else if (cleanSlug.includes("BANK") || cleanSlug.includes("IBPS") || cleanSlug.includes("SBI")) {
            if (cleanSlug.includes("CLERK")) {
              examName = "IBPS / SBI Clerk";
              maxMarks = 100;
            } else {
              examName = "Banking / IBPS PO";
              maxMarks = 100;
            }
          } else if (cleanSlug.includes("NEET")) {
            examName = "NEET UG";
            maxMarks = 720;
          } else if (cleanSlug.includes("JEE")) {
            examName = "JEE Main";
            maxMarks = 300;
          } else if (cleanSlug.includes("RRB") || cleanSlug.includes("NTPC")) {
            examName = "RRB NTPC";
            maxMarks = 120;
          } else if (cleanSlug.length > 0) {
            examName = cleanSlug.replace(/\bMOCK TEST\b/gi, "").trim() || "Testbook Mock";
          }

          testTitle = queryTitle || `${examName} Mock Test #${attemptNo}`;
        } else {
          if (urlLower.includes("dsssb")) { examName = "DSSSB TGT"; maxMarks = 200; }
          else if (urlLower.includes("cgl")) { examName = "SSC CGL"; maxMarks = 200; }
          else if (urlLower.includes("chsl")) { examName = "SSC CHSL"; maxMarks = 200; }
          else if (urlLower.includes("ibps") || urlLower.includes("bank")) { examName = "Banking / IBPS PO"; maxMarks = 100; }
          else if (urlLower.includes("neet")) { examName = "NEET UG"; maxMarks = 720; }
          else if (urlLower.includes("jee")) { examName = "JEE Main"; maxMarks = 300; }
          testTitle = queryTitle || `${examName} Mock Test #${attemptNo}`;
        }

        if (queryMaxMarks) {
          maxMarks = queryMaxMarks;
        }

        // 3. Generate structured subject sections if query params or exam patterns allow
        let sections: any[] = querySections || [];
        if (sections.length === 0) {
          const finalScore = queryScore !== undefined ? queryScore : 0;
          if (examName.includes("SSC CGL") || examName.includes("CHSL") || examName.includes("DSSSB")) {
            const secMax = Math.round(maxMarks / 4);
            const ratio = finalScore > 0 && maxMarks > 0 ? finalScore / maxMarks : 0;
            sections = [
              { name: "Quantitative Aptitude", score: Number((ratio * secMax * 1.05).toFixed(1)), maxMarks: secMax },
              { name: "Reasoning Ability", score: Number((ratio * secMax * 1.1).toFixed(1)), maxMarks: secMax },
              { name: "English Comprehension", score: Number((ratio * secMax * 1.0).toFixed(1)), maxMarks: secMax },
              { name: "General Awareness", score: Number((ratio * secMax * 0.85).toFixed(1)), maxMarks: secMax },
            ];
          } else if (examName.includes("Banking") || examName.includes("IBPS") || examName.includes("SBI")) {
            sections = [
              { name: "Quantitative Aptitude", score: Number((finalScore * 0.35).toFixed(1)), maxMarks: 35 },
              { name: "Reasoning Ability", score: Number((finalScore * 0.35).toFixed(1)), maxMarks: 35 },
              { name: "English Language", score: Number((finalScore * 0.30).toFixed(1)), maxMarks: 30 },
            ];
          } else if (examName.includes("NEET")) {
            sections = [
              { name: "Physics", score: Number((finalScore * 0.25).toFixed(1)), maxMarks: 180 },
              { name: "Chemistry", score: Number((finalScore * 0.25).toFixed(1)), maxMarks: 180 },
              { name: "Biology (Botany & Zoology)", score: Number((finalScore * 0.50).toFixed(1)), maxMarks: 360 },
            ];
          } else if (examName.includes("JEE")) {
            sections = [
              { name: "Mathematics", score: Number((finalScore * 0.33).toFixed(1)), maxMarks: 100 },
              { name: "Physics", score: Number((finalScore * 0.33).toFixed(1)), maxMarks: 100 },
              { name: "Chemistry", score: Number((finalScore * 0.34).toFixed(1)), maxMarks: 100 },
            ];
          }
        }

        return {
          platform,
          examName,
          testTitle,
          maxMarks,
          attemptNo,
          queryScore,
          queryMaxMarks,
          queryCorrect,
          queryIncorrect,
          queryAccuracy,
          queryPercentile,
          queryRank,
          sections,
        };
      };

      const apiKey = process.env.GEMINI_API_KEY;

      // Handle webUrl fetching & parsing
      if (webUrl) {
        const urlMeta = parseUrlMetadata(webUrl);
        let cleanedText = "";
        let pageJsonData: any = null;

        try {
          const fetchRes = await fetch(webUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            },
            signal: AbortSignal.timeout(3500),
          });

          if (fetchRes.ok) {
            const rawHtml = await fetchRes.text();

            // Extract embedded script state if Testbook JSON is found
            const jsonMatch = rawHtml.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i) ||
                             rawHtml.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/i);
            if (jsonMatch && jsonMatch[1]) {
              try {
                pageJsonData = JSON.parse(jsonMatch[1]);
              } catch {
                pageJsonData = null;
              }
            }

            cleanedText = rawHtml
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .slice(0, 8000);
          }
        } catch {
          // Fetch timeout or CORS / Login wall protection
        }

        // Determine best marksObtained from query string, pageJsonData, or AI
        let extractedScore = urlMeta.queryScore;
        let extractedMaxMarks = urlMeta.queryMaxMarks || urlMeta.maxMarks;
        let extractedCorrect = urlMeta.queryCorrect;
        let extractedIncorrect = urlMeta.queryIncorrect;
        let extractedAccuracy = urlMeta.queryAccuracy;
        let extractedPercentile = urlMeta.queryPercentile;
        let extractedRank = urlMeta.queryRank;
        let extractedSections = urlMeta.sections;

        if (apiKey) {
          try {
            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: { headers: { "User-Agent": "aistudio-build" } },
            });

            const prompt = `You are an expert Indian Competitive Exam Scorecard Parser for platforms like Testbook, Oliveboard, PW, Adda247, etc.
Analyze this web result link, extracted query parameters, and HTML page text:
URL: ${webUrl}
Parsed URL Query Meta:
- Platform: ${urlMeta.platform}
- Exam: ${urlMeta.examName}
- Test Title: ${urlMeta.testTitle}
- Attempt Number: ${urlMeta.attemptNo}
- Query Score: ${urlMeta.queryScore ?? "Not in URL"}
- Query Max Marks: ${urlMeta.queryMaxMarks ?? urlMeta.maxMarks}
- Query Correct Qs: ${urlMeta.queryCorrect ?? "N/A"}
- Query Incorrect Qs: ${urlMeta.queryIncorrect ?? "N/A"}
- Query Percentile: ${urlMeta.queryPercentile ?? "N/A"}
- Query Accuracy: ${urlMeta.queryAccuracy ?? "N/A"}
Page HTML Text snippet: ${cleanedText || "None (Protected behind login wall)"}

Extract or infer complete structured JSON for this test attempt:
- platform: "${urlMeta.platform}"
- examName: "${urlMeta.examName}"
- testTitle: "${urlMeta.testTitle}"
- attemptNo: "${urlMeta.attemptNo}"
- testType: "Full Mock"
- marksObtained: number (use query score if found, or extract from page text, default 0 if protected)
- maxMarks: number (default ${urlMeta.maxMarks})
- correctCount: integer or 0
- incorrectCount: integer or 0
- percentile: number or null
- accuracy: number or null
- rank: integer or null
- sections: array of objects [{ name: string, score: number, maxMarks: number, correctCount?: number, incorrectCount?: number }]
- requiresAuthScore: boolean (true if score is 0 and page is empty/protected so candidate needs to type or confirm score)
`;

            const response = await ai.models.generateContent({
              model: "gemini-3.7-flash",
              contents: { parts: [{ text: prompt }] },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    platform: { type: Type.STRING },
                    examName: { type: Type.STRING },
                    testTitle: { type: Type.STRING },
                    attemptNo: { type: Type.STRING },
                    testType: { type: Type.STRING },
                    marksObtained: { type: Type.NUMBER },
                    maxMarks: { type: Type.NUMBER },
                    correctCount: { type: Type.INTEGER },
                    incorrectCount: { type: Type.INTEGER },
                    percentile: { type: Type.NUMBER },
                    accuracy: { type: Type.NUMBER },
                    rank: { type: Type.INTEGER },
                    sections: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          score: { type: Type.NUMBER },
                          maxMarks: { type: Type.NUMBER },
                          correctCount: { type: Type.INTEGER },
                          incorrectCount: { type: Type.INTEGER },
                        },
                        required: ["name", "score", "maxMarks"],
                      },
                    },
                    requiresAuthScore: { type: Type.BOOLEAN },
                  },
                  required: ["platform", "testTitle", "marksObtained", "maxMarks"],
                },
              },
            });

            const parsed = JSON.parse(response.text || "{}");
            const finalObtained = typeof parsed.marksObtained === "number" && parsed.marksObtained > 0
              ? parsed.marksObtained
              : (extractedScore !== undefined ? extractedScore : 0);

            return res.json({
              success: true,
              data: {
                ...parsed,
                platform: parsed.platform || urlMeta.platform,
                examName: parsed.examName || urlMeta.examName,
                testTitle: parsed.testTitle || urlMeta.testTitle,
                attemptNo: parsed.attemptNo || urlMeta.attemptNo,
                marksObtained: finalObtained,
                maxMarks: parsed.maxMarks || extractedMaxMarks,
                correctCount: parsed.correctCount ?? extractedCorrect ?? 0,
                incorrectCount: parsed.incorrectCount ?? extractedIncorrect ?? 0,
                percentile: parsed.percentile ?? extractedPercentile,
                accuracy: parsed.accuracy ?? extractedAccuracy,
                rank: parsed.rank ?? extractedRank,
                sections: (parsed.sections && parsed.sections.length > 0) ? parsed.sections : extractedSections,
                requiresAuthScore: finalObtained > 0 ? false : true,
              },
            });
          } catch (aiErr) {
            console.warn("AI generation error for link:", aiErr);
          }
        }

        // Return robust fallback constructed from query string parameters and path metadata
        const fallbackScore = extractedScore !== undefined ? extractedScore : 0;
        const fallbackAccuracy = extractedAccuracy !== undefined
          ? extractedAccuracy
          : (extractedCorrect && extractedIncorrect && (extractedCorrect + extractedIncorrect) > 0
              ? Number(((extractedCorrect / (extractedCorrect + extractedIncorrect)) * 100).toFixed(1))
              : undefined);

        return res.json({
          success: true,
          data: {
            platform: urlMeta.platform,
            examName: urlMeta.examName,
            testTitle: urlMeta.testTitle,
            attemptNo: urlMeta.attemptNo,
            testType: "Full Mock",
            marksObtained: fallbackScore,
            maxMarks: extractedMaxMarks,
            correctCount: extractedCorrect ?? 0,
            incorrectCount: extractedIncorrect ?? 0,
            percentile: extractedPercentile,
            accuracy: fallbackAccuracy,
            rank: extractedRank,
            sections: extractedSections,
            requiresAuthScore: fallbackScore > 0 ? false : true,
          },
        });
      }

      // Handle imageBase64 / OCR
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing in environment variables.",
          fallback: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      let parts: any[] = [];
      const systemPrompt = `You are an expert Indian Competitive Exam Scorecard Parser.
Analyze the given scorecard image and extract test metrics in structured JSON format.`;

      if (imageBase64) {
        parts.push({
          inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: mimeType,
          },
        });
        parts.push({
          text: `${systemPrompt}\nExtract platform, test title, total marks, maximum marks, correct questions, incorrect questions, percentile, accuracy, and sectional breakdown.`,
        });
      } else if (rawText) {
        parts.push({
          text: `${systemPrompt}\nParse raw text:\n${rawText}`,
        });
      } else {
        return res.status(400).json({ error: "No image, text, or URL provided." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              examName: { type: Type.STRING },
              testTitle: { type: Type.STRING },
              testType: { type: Type.STRING },
              marksObtained: { type: Type.NUMBER },
              maxMarks: { type: Type.NUMBER },
              correctCount: { type: Type.INTEGER },
              incorrectCount: { type: Type.INTEGER },
              percentile: { type: Type.NUMBER },
              accuracy: { type: Type.NUMBER },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    maxMarks: { type: Type.NUMBER },
                  },
                },
              },
            },
            required: ["platform", "testTitle", "marksObtained", "maxMarks"],
          },
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error("OCR API error:", err);
      return res.status(500).json({ error: err.message || "Failed to parse scorecard", fallback: true });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MockTrack server running on http://localhost:${PORT}`);
  });
}

startServer();
