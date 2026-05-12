const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are the AI Strategy Copilot for the F1 Analytics Operating System — an enterprise business intelligence platform used by Formula 1 commercial strategy departments.

You are an expert in:
- F1 sponsorship valuation and ROI analysis
- Fan engagement analytics and social intelligence
- Merchandise revenue optimization
- Race weekend commercial impact modeling
- Sports business strategy consulting

Respond with executive-level business insights. Be data-driven, concise, and actionable.
Use specific numbers and percentages when possible.
Format responses with clear sections, bullet points, and bold key metrics.
Think like a McKinsey consultant advising an F1 team's commercial director.`;

export async function queryGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return generateMockResponse(prompt);
  }

  try {
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser Query: " + prompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return generateMockResponse(prompt);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateMockResponse(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    return generateMockResponse(prompt);
  }
}

export async function* streamGemini(prompt: string): AsyncGenerator<string> {
  if (!GEMINI_API_KEY) {
    const mock = generateMockResponse(prompt);
    for (const char of mock) {
      yield char;
      await new Promise(r => setTimeout(r, 8));
    }
    return;
  }

  try {
    const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
    const response = await fetch(streamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nUser Query: " + prompt }] }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok || !response.body) {
      const mock = generateMockResponse(prompt);
      for (const char of mock) { yield char; await new Promise(r => setTimeout(r, 8)); }
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") return;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) yield text;
          } catch { /* skip malformed */ }
        }
      }
    }
  } catch (error) {
    console.error("Stream error:", error);
    const mock = generateMockResponse(prompt);
    for (const char of mock) { yield char; await new Promise(r => setTimeout(r, 8)); }
  }
}

function generateMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("sponsor") && (lower.includes("roi") || lower.includes("underperform"))) {
    return `## Sponsorship ROI Analysis

**Key Finding:** Crypto.com shows the most concerning ROI trajectory, currently at **189%** — well below the portfolio average of **342%**.

### Underperformers (Below 250% ROI Threshold)
- **Crypto.com** — ROI: 189% ↓23% QoQ | Risk Score: 45/100 | CPM: $6.80
- **Snap** — ROI: 167% ↓18% QoQ | Risk Score: 52/100 | CPM: $7.20

### Contributing Factors
- Declining crypto market sentiment affecting brand perception
- Lower digital activation rates (-34% vs. planned)
- Audience quality score below benchmark (62 vs. 78 avg)

### Recommended Actions
1. **Immediate:** Schedule contract review meeting with Crypto.com
2. **Short-term:** Propose enhanced digital activation package (+$2M investment for +45% exposure)
3. **Strategic:** Begin prospecting replacement sponsors in fintech space — Revolut and Stripe show high brand-F1 alignment scores`;
  }

  if (lower.includes("fan") && lower.includes("growth")) {
    return `## Fan Growth Forecast

**Projection Period:** Q3-Q4 2026

### Top Growth Markets
| Market | Current Base | Projected Growth | Confidence |
|--------|-------------|------------------|------------|
| 🇺🇸 United States | 12.8M | +28.6% | High |
| 🇮🇳 India | 5.6M | +42.1% | Medium |
| 🇸🇦 Saudi Arabia | 2.8M | +48.6% | Medium |
| 🇧🇷 Brazil | 8.6M | +12.1% | High |

### Key Growth Drivers
- **Netflix Drive to Survive S7** — Projected +8-12% global awareness lift
- **US expansion** — Las Vegas & Miami GPs driving 3x engagement vs. traditional races
- **TikTok strategy** — Short-form content generating 4.2x higher virality coefficient

### Risk Factors
- Competitive pressure from MotoGP in Southeast Asia
- Content saturation risk on Instagram (-2.3% engagement trend)`;
  }

  if (lower.includes("merch") || lower.includes("merchandise")) {
    return `## Merchandise Intelligence Report

**Period:** YTD 2026 | Total Revenue: **$124.8M** (+6.3% YoY)

### Top Performers
1. 🏆 **Ferrari Replica Jersey** — $28.6M (+24.5%) — Premium pricing power remains strong
2. 🥈 **McLaren Team Jacket** — $18.4M (+36.2%) — Fastest growing SKU
3. 🥉 **McLaren Team Hoodie** — $15.2M (+32.1%) — Gen Z appeal driving volume

### Strategic Insights
- **McLaren** is the breakout brand — 34% revenue growth driven by Norris fandom
- **Collectibles** category growing 2.3x faster than apparel
- **Asia-Pacific** emerging as highest-margin region (+18% premium willingness)

### AI Recommendation
Increase McLaren inventory allocation by 25% ahead of British GP. Historical data shows 28% merchandise spike at home races.`;
  }

  return `## Strategic Analysis

Based on the F1 Analytics OS data, here are the key insights:

### Current Performance Summary
- **Total Portfolio Revenue:** $847.2M (+12.4% YoY)
- **Sponsor ROI Average:** 342% (above 300% target)
- **Global Fan Base:** 87.4M (+15.7% growth)
- **AI Health Score:** 94.7/100

### Key Opportunities
1. **Market Expansion** — US and India showing 28-42% growth rates
2. **Digital Monetization** — Fan engagement converting at 3.2x industry average
3. **Sponsor Upsell** — 4 sponsors have headroom for tier upgrades

### Strategic Recommendations
- Prioritize US market investment ($5M incremental)
- Launch NFT/digital collectibles program (projected $12M revenue)
- Negotiate Crypto.com contract restructure before Q4 renewal

*Analysis generated by F1 Analytics AI Engine — Confidence: High*`;
}
