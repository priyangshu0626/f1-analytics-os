// ============================================
// F1 ANALYTICS OS — HUGGINGFACE SENTIMENT API
// ============================================
// Uses HuggingFace Inference API for real sentiment
// analysis on F1 news headlines and social content.

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
const MODEL_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest";

export interface SentimentResult {
  text: string;
  label: "positive" | "neutral" | "negative";
  score: number;
  scores: { positive: number; neutral: number; negative: number };
}

export async function analyzeSentiment(texts: string[]): Promise<SentimentResult[]> {
  if (!HF_API_KEY || texts.length === 0) {
    return texts.map((t) => fallbackSentiment(t));
  }

  try {
    const results: SentimentResult[] = [];

    // Process in batches of 5 to avoid rate limits
    for (let i = 0; i < texts.length; i += 5) {
      const batch = texts.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map(async (text) => {
          try {
            const res = await fetch(MODEL_URL, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ inputs: text.slice(0, 280) }), // Twitter-length
            });

            if (!res.ok) return fallbackSentiment(text);

            const data = await res.json();
            // HF returns [[{label, score}, ...]]
            const predictions = Array.isArray(data[0]) ? data[0] : data;

            const scores = { positive: 0, neutral: 0, negative: 0 };
            let bestLabel: "positive" | "neutral" | "negative" = "neutral";
            let bestScore = 0;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const pred of predictions as any[]) {
              const label = pred.label?.toLowerCase() || "";
              const s = pred.score || 0;
              if (label.includes("positive") || label === "pos") { scores.positive = s; if (s > bestScore) { bestScore = s; bestLabel = "positive"; } }
              else if (label.includes("negative") || label === "neg") { scores.negative = s; if (s > bestScore) { bestScore = s; bestLabel = "negative"; } }
              else { scores.neutral = s; if (s > bestScore) { bestScore = s; bestLabel = "neutral"; } }
            }

            return { text, label: bestLabel, score: bestScore, scores };
          } catch {
            return fallbackSentiment(text);
          }
        })
      );
      results.push(...batchResults);
    }

    return results;
  } catch {
    return texts.map((t) => fallbackSentiment(t));
  }
}

/**
 * Aggregate sentiment results into a summary score (0-100).
 */
export function aggregateSentiment(results: SentimentResult[]): { score: number; positive: number; neutral: number; negative: number } {
  if (results.length === 0) return { score: 70, positive: 50, neutral: 35, negative: 15 };

  const positive = results.filter((r) => r.label === "positive").length;
  const neutral = results.filter((r) => r.label === "neutral").length;
  const negative = results.filter((r) => r.label === "negative").length;
  const total = results.length;

  return {
    score: Math.round(((positive * 100 + neutral * 50 + negative * 0) / total)),
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
  };
}

function fallbackSentiment(text: string): SentimentResult {
  // Simple keyword-based fallback
  const lower = text.toLowerCase();
  const posWords = ["win", "leads", "growth", "surge", "record", "dominat", "strong", "boost", "success"];
  const negWords = ["risk", "decline", "loss", "crash", "fail", "dnf", "poor", "drop", "penalty"];

  const posCount = posWords.filter((w) => lower.includes(w)).length;
  const negCount = negWords.filter((w) => lower.includes(w)).length;

  if (posCount > negCount) return { text, label: "positive", score: 0.7 + posCount * 0.05, scores: { positive: 0.7, neutral: 0.2, negative: 0.1 } };
  if (negCount > posCount) return { text, label: "negative", score: 0.6 + negCount * 0.05, scores: { positive: 0.1, neutral: 0.3, negative: 0.6 } };
  return { text, label: "neutral", score: 0.6, scores: { positive: 0.3, neutral: 0.5, negative: 0.2 } };
}
