// ============================================
// F1 ANALYTICS OS — TYPE DEFINITIONS & FALLBACKS
// ============================================
// This file contains ONLY:
// 1. Type interfaces
// 2. Team/constant lists
// 3. Copilot suggestions (not data)
// 4. Empty fallback arrays for graceful degradation
//
// ALL numerical data comes from real APIs.
// NO fake metrics, revenue, or follower counts.

export const TEAMS = [
  "All Teams",
  "Mercedes",
  "Ferrari",
  "Red Bull",
  "McLaren",
  "Alpine",
  "Aston Martin",
  "Williams",
  "RB",
  "Haas",
  "Audi",
  "Cadillac",
];

// ============================================
// COPILOT SUGGESTIONS (prompts, not data)
// ============================================

export const copilotSuggestions = [
  "Summarize the current championship standings",
  "Which constructor has the most YouTube subscribers?",
  "Analyze the news sentiment for the top 3 teams",
  "What are the weather conditions for the next race?",
  "Compare constructor commercial scores",
  "Explain the points progression this season",
  "Which driver has the highest hype index and why?",
  "What does the current exchange rate mean for European markets?",
];

// ============================================
// AI INSIGHT TYPE (for strategic alerts)
// ============================================

export interface AIInsight {
  id: string;
  type: "opportunity" | "anomaly" | "risk" | "growth" | "prediction";
  severity: "high" | "medium" | "low";
  title: string;
  summary: string;
  module: string;
  timestamp: string;
}

// Fallback alerts — used ONLY when Gemini API is unavailable
export const fallbackAlerts: AIInsight[] = [
  { id: "i1", type: "growth", severity: "medium", title: "Awaiting AI Analysis", summary: "Strategic alerts will appear here once the data pipeline completes its first refresh.", module: "commercial", timestamp: "Pending" },
];
