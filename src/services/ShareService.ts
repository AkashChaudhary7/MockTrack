/**
 * ShareService: Helper for sharing result reports and parsing shared text/URLs into mock details.
 */
import { PlatformId } from "../types";
import { PLATFORMS } from "../data/platforms";

export interface ParsedShareResult {
  platform?: PlatformId;
  mockTitle?: string;
  score?: number;
  maxMarks?: number;
  url?: string;
  rawText: string;
}

export class ShareService {
  static canShare(): boolean {
    return typeof navigator !== "undefined" && typeof navigator.share === "function";
  }

  static async shareReport(title: string, text: string, url?: string): Promise<boolean> {
    if (this.canShare()) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (e) {
        console.warn("Share cancelled or failed", e);
      }
    }
    // Fallback to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(`${title}\n${text}${url ? `\n${url}` : ""}`);
      return true;
    }
    return false;
  }

  static parseShareText(input: string): ParsedShareResult {
    const rawText = input.trim();
    let score: number | undefined;
    let maxMarks: number | undefined;
    let platform: PlatformId | undefined;
    let mockTitle: number | string | undefined;
    let url: string | undefined;

    // Detect URL if present
    const urlMatch = rawText.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      url = urlMatch[0];
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes("testbook")) platform = "testbook";
      else if (lowerUrl.includes("oliveboard")) platform = "oliveboard";
      else if (lowerUrl.includes("adda247")) platform = "adda247";
      else if (lowerUrl.includes("unacademy")) platform = "unacademy";
      else if (lowerUrl.includes("allen")) platform = "allen";
      else if (lowerUrl.includes("pw") || lowerUrl.includes("physicswallah")) platform = "physicswallah";
    }

    // Attempt to extract numeric pattern e.g., "Score: 148/200" or "148.5 out of 200"
    const scoreOverTotal = rawText.match(/(\d+(?:\.\d+)?)\s*(?:\/|out of)\s*(\d+(?:\.\d+)?)/i);
    if (scoreOverTotal) {
      score = parseFloat(scoreOverTotal[1]);
      maxMarks = parseFloat(scoreOverTotal[2]);
    } else {
      const singleScore = rawText.match(/(?:score|marks|got)\s*:?\s*(\d+(?:\.\d+)?)/i);
      if (singleScore) {
        score = parseFloat(singleScore[1]);
      }
    }

    // Platform name in text
    if (!platform) {
      const lower = rawText.toLowerCase();
      for (const pKey of Object.keys(PLATFORMS)) {
        const pName = PLATFORMS[pKey as PlatformId]?.name.toLowerCase();
        if (pName && lower.includes(pName)) {
          platform = pKey as PlatformId;
          break;
        }
      }
    }

    return {
      platform,
      mockTitle: typeof mockTitle === "string" ? mockTitle : undefined,
      score,
      maxMarks,
      url,
      rawText,
    };
  }
}
