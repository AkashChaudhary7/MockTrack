import confetti from "canvas-confetti";

/**
 * Fires a celebratory confetti animation for personal best scores and milestones
 */
export function firePersonalBestConfetti() {
  try {
    // 1. Initial burst from center
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
      disableForReducedMotion: true,
    });

    // 2. Left cannon burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
        disableForReducedMotion: true,
      });
    }, 150);

    // 3. Right cannon burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa"],
        disableForReducedMotion: true,
      });
    }, 300);

    // 4. Star shapes cascade
    setTimeout(() => {
      confetti({
        particleCount: 25,
        spread: 90,
        origin: { y: 0.5 },
        shapes: ["star"],
        colors: ["#fbbf24", "#f59e0b", "#fde047"],
        disableForReducedMotion: true,
      });
    }, 450);
  } catch (e) {
    console.warn("Confetti animation failed:", e);
  }
}
