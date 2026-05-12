// ============================================
// F1 ANALYTICS OS — SYNTHETIC ENTERPRISE DATA
// ============================================

export interface KPIMetric {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: number;
  trend: "up" | "down" | "flat";
  sparkline: number[];
  color: string;
  icon: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "Title" | "Major" | "Official" | "Regional";
  industry: string;
  contractValue: number;
  roi: number;
  impressions: number;
  emv: number;
  cpm: number;
  riskScore: number;
  visibilityIndex: number;
  status: "active" | "expiring" | "at-risk";
  logo?: string;
}

export interface SocialMetric {
  platform: string;
  followers: number;
  growth: number;
  engagement: number;
  sentiment: number;
  posts: number;
}

export interface MerchProduct {
  id: string;
  name: string;
  team: string;
  category: string;
  revenue: number;
  units: number;
  avgPrice: number;
  growth: number;
  region: string;
}

export interface RaceEvent {
  id: string;
  name: string;
  country: string;
  date: string;
  attendance: number;
  tvViewers: number;
  socialImpressions: number;
  merchSpike: number;
  sponsorExposure: number;
}

export interface SimulationResult {
  metric: string;
  baseline: number;
  simulated: number;
  delta: number;
  confidence: number;
  distribution: number[];
}

// ============================================
// EXECUTIVE KPIs
// ============================================

export const kpiMetrics: KPIMetric[] = [
  { id: "revenue", label: "Total Revenue", value: 847_200_000, prefix: "$", change: 12.4, trend: "up", sparkline: [42,48,52,55,58,54,62,68,72,76,80,85], color: "#10b981", icon: "DollarSign" },
  { id: "sponsor-roi", label: "Avg Sponsor ROI", value: 342, suffix: "%", change: 8.2, trend: "up", sparkline: [50,55,52,58,60,65,62,70,68,74,78,82], color: "#0ea5e9", icon: "TrendingUp" },
  { id: "fan-base", label: "Global Fan Base", value: 87_400_000, change: 15.7, trend: "up", sparkline: [35,40,42,48,52,56,60,64,68,72,78,84], color: "#a855f7", icon: "Users" },
  { id: "merch-rev", label: "Merchandise Rev.", value: 124_800_000, prefix: "$", change: 6.3, trend: "up", sparkline: [45,42,48,52,56,58,55,62,66,70,74,78], color: "#f59e0b", icon: "ShoppingBag" },
  { id: "engagement", label: "Engagement Rate", value: 4.82, suffix: "%", change: -0.3, trend: "down", sparkline: [78,75,72,74,70,68,65,62,60,58,56,54], color: "#f43f5e", icon: "Activity" },
  { id: "ai-score", label: "AI Health Score", value: 94.7, suffix: "/100", change: 2.1, trend: "up", sparkline: [60,62,65,68,70,72,75,78,82,86,90,94], color: "#06b6d4", icon: "Brain" },
];

// ============================================
// SPONSORS
// ============================================

export const sponsors: Sponsor[] = [
  { id: "s1", name: "Oracle", tier: "Title", industry: "Technology", contractValue: 75_000_000, roi: 412, impressions: 2_800_000_000, emv: 156_000_000, cpm: 4.2, riskScore: 12, visibilityIndex: 94, status: "active" },
  { id: "s2", name: "Petronas", tier: "Title", industry: "Energy", contractValue: 60_000_000, roi: 385, impressions: 2_100_000_000, emv: 132_000_000, cpm: 3.8, riskScore: 18, visibilityIndex: 91, status: "active" },
  { id: "s3", name: "Shell", tier: "Major", industry: "Energy", contractValue: 45_000_000, roi: 298, impressions: 1_600_000_000, emv: 98_000_000, cpm: 5.1, riskScore: 22, visibilityIndex: 86, status: "active" },
  { id: "s4", name: "AWS", tier: "Major", industry: "Technology", contractValue: 40_000_000, roi: 356, impressions: 1_900_000_000, emv: 88_000_000, cpm: 3.5, riskScore: 8, visibilityIndex: 89, status: "active" },
  { id: "s5", name: "Pirelli", tier: "Official", industry: "Automotive", contractValue: 35_000_000, roi: 274, impressions: 3_200_000_000, emv: 102_000_000, cpm: 2.9, riskScore: 15, visibilityIndex: 95, status: "active" },
  { id: "s6", name: "Crypto.com", tier: "Major", industry: "Fintech", contractValue: 50_000_000, roi: 189, impressions: 980_000_000, emv: 64_000_000, cpm: 6.8, riskScore: 45, visibilityIndex: 72, status: "at-risk" },
  { id: "s7", name: "Salesforce", tier: "Official", industry: "Technology", contractValue: 30_000_000, roi: 312, impressions: 1_200_000_000, emv: 78_000_000, cpm: 4.0, riskScore: 10, visibilityIndex: 84, status: "active" },
  { id: "s8", name: "Hilton", tier: "Official", industry: "Hospitality", contractValue: 25_000_000, roi: 245, impressions: 890_000_000, emv: 52_000_000, cpm: 4.8, riskScore: 20, visibilityIndex: 78, status: "expiring" },
  { id: "s9", name: "Tommy Hilfiger", tier: "Regional", industry: "Fashion", contractValue: 18_000_000, roi: 198, impressions: 540_000_000, emv: 36_000_000, cpm: 5.5, riskScore: 28, visibilityIndex: 68, status: "active" },
  { id: "s10", name: "Snap", tier: "Regional", industry: "Social Media", contractValue: 12_000_000, roi: 167, impressions: 420_000_000, emv: 24_000_000, cpm: 7.2, riskScore: 52, visibilityIndex: 58, status: "at-risk" },
];

// ============================================
// REVENUE TIMELINE
// ============================================

export const revenueTimeline = [
  { month: "Jan", sponsorship: 42, merchandise: 8, broadcast: 28, hospitality: 12, digital: 6 },
  { month: "Feb", sponsorship: 44, merchandise: 9, broadcast: 30, hospitality: 14, digital: 7 },
  { month: "Mar", sponsorship: 52, merchandise: 14, broadcast: 48, hospitality: 22, digital: 11 },
  { month: "Apr", sponsorship: 56, merchandise: 16, broadcast: 52, hospitality: 26, digital: 13 },
  { month: "May", sponsorship: 58, merchandise: 18, broadcast: 56, hospitality: 28, digital: 14 },
  { month: "Jun", sponsorship: 62, merchandise: 22, broadcast: 62, hospitality: 32, digital: 16 },
  { month: "Jul", sponsorship: 68, merchandise: 26, broadcast: 68, hospitality: 36, digital: 18 },
  { month: "Aug", sponsorship: 64, merchandise: 20, broadcast: 58, hospitality: 30, digital: 15 },
  { month: "Sep", sponsorship: 60, merchandise: 18, broadcast: 54, hospitality: 28, digital: 14 },
  { month: "Oct", sponsorship: 66, merchandise: 24, broadcast: 64, hospitality: 34, digital: 17 },
  { month: "Nov", sponsorship: 70, merchandise: 28, broadcast: 70, hospitality: 38, digital: 19 },
  { month: "Dec", sponsorship: 58, merchandise: 32, broadcast: 42, hospitality: 20, digital: 12 },
];

// ============================================
// SOCIAL METRICS BY TEAM
// ============================================

export const teamSocialData = [
  { team: "Red Bull", instagram: 18_200_000, tiktok: 12_400_000, twitter: 8_900_000, youtube: 6_700_000, engRate: 5.2, sentiment: 78, growth: 14.2 },
  { team: "Ferrari", instagram: 22_100_000, tiktok: 9_800_000, twitter: 11_200_000, youtube: 4_800_000, engRate: 6.1, sentiment: 82, growth: 11.8 },
  { team: "Mercedes", instagram: 19_800_000, tiktok: 11_600_000, twitter: 9_400_000, youtube: 5_900_000, engRate: 4.8, sentiment: 75, growth: 8.6 },
  { team: "McLaren", instagram: 14_600_000, tiktok: 15_200_000, twitter: 7_800_000, youtube: 5_200_000, engRate: 7.4, sentiment: 88, growth: 22.1 },
  { team: "Aston Martin", instagram: 8_400_000, tiktok: 6_200_000, twitter: 4_600_000, youtube: 2_800_000, engRate: 4.2, sentiment: 72, growth: 9.4 },
  { team: "Alpine", instagram: 5_800_000, tiktok: 4_100_000, twitter: 3_200_000, youtube: 1_900_000, engRate: 3.8, sentiment: 68, growth: 6.2 },
  { team: "Williams", instagram: 4_200_000, tiktok: 5_800_000, twitter: 2_800_000, youtube: 1_600_000, engRate: 5.6, sentiment: 74, growth: 18.4 },
  { team: "RB", instagram: 3_600_000, tiktok: 3_200_000, twitter: 2_100_000, youtube: 1_200_000, engRate: 4.1, sentiment: 70, growth: 7.8 },
  { team: "Kick Sauber", instagram: 2_800_000, tiktok: 2_400_000, twitter: 1_800_000, youtube: 980_000, engRate: 3.4, sentiment: 62, growth: 5.1 },
  { team: "Haas", instagram: 3_100_000, tiktok: 2_900_000, twitter: 2_200_000, youtube: 1_100_000, engRate: 3.9, sentiment: 65, growth: 8.2 },
];

// ============================================
// MERCHANDISE
// ============================================

export const merchProducts: MerchProduct[] = [
  { id: "m1", name: "Team Cap 2026", team: "Red Bull", category: "Headwear", revenue: 12_400_000, units: 890_000, avgPrice: 13.93, growth: 18.2, region: "Europe" },
  { id: "m2", name: "Replica Jersey", team: "Ferrari", category: "Apparel", revenue: 28_600_000, units: 420_000, avgPrice: 68.10, growth: 24.5, region: "Global" },
  { id: "m3", name: "Team Hoodie", team: "McLaren", category: "Apparel", revenue: 15_200_000, units: 380_000, avgPrice: 40.00, growth: 32.1, region: "Americas" },
  { id: "m4", name: "Scale Model 1:18", team: "Mercedes", category: "Collectibles", revenue: 8_900_000, units: 120_000, avgPrice: 74.17, growth: 12.8, region: "Asia" },
  { id: "m5", name: "Backpack Pro", team: "Red Bull", category: "Accessories", revenue: 6_200_000, units: 210_000, avgPrice: 29.52, growth: 15.6, region: "Europe" },
  { id: "m6", name: "Team Polo", team: "Aston Martin", category: "Apparel", revenue: 4_800_000, units: 160_000, avgPrice: 30.00, growth: 8.4, region: "Europe" },
  { id: "m7", name: "Driver Helmet Mini", team: "Ferrari", category: "Collectibles", revenue: 9_100_000, units: 280_000, avgPrice: 32.50, growth: 28.9, region: "Global" },
  { id: "m8", name: "Team Jacket", team: "McLaren", category: "Apparel", revenue: 18_400_000, units: 220_000, avgPrice: 83.64, growth: 36.2, region: "Americas" },
];

// ============================================
// RACE EVENTS
// ============================================

export const raceEvents: RaceEvent[] = [
  { id: "r1", name: "Bahrain GP", country: "BH", date: "2026-03-02", attendance: 98_000, tvViewers: 92_000_000, socialImpressions: 1_200_000_000, merchSpike: 14, sponsorExposure: 89 },
  { id: "r2", name: "Saudi Arabian GP", country: "SA", date: "2026-03-09", attendance: 85_000, tvViewers: 88_000_000, socialImpressions: 980_000_000, merchSpike: 8, sponsorExposure: 84 },
  { id: "r3", name: "Australian GP", country: "AU", date: "2026-03-23", attendance: 118_000, tvViewers: 102_000_000, socialImpressions: 1_400_000_000, merchSpike: 22, sponsorExposure: 92 },
  { id: "r4", name: "Japanese GP", country: "JP", date: "2026-04-06", attendance: 104_000, tvViewers: 95_000_000, socialImpressions: 1_100_000_000, merchSpike: 18, sponsorExposure: 88 },
  { id: "r5", name: "Chinese GP", country: "CN", date: "2026-04-20", attendance: 92_000, tvViewers: 110_000_000, socialImpressions: 1_600_000_000, merchSpike: 12, sponsorExposure: 86 },
  { id: "r6", name: "Monaco GP", country: "MC", date: "2026-05-25", attendance: 78_000, tvViewers: 142_000_000, socialImpressions: 2_400_000_000, merchSpike: 35, sponsorExposure: 98 },
  { id: "r7", name: "Spanish GP", country: "ES", date: "2026-06-01", attendance: 112_000, tvViewers: 86_000_000, socialImpressions: 920_000_000, merchSpike: 10, sponsorExposure: 82 },
  { id: "r8", name: "British GP", country: "GB", date: "2026-07-06", attendance: 142_000, tvViewers: 128_000_000, socialImpressions: 1_800_000_000, merchSpike: 28, sponsorExposure: 96 },
];

// ============================================
// AI INSIGHTS
// ============================================

export const aiInsights = [
  { id: "i1", type: "opportunity" as const, severity: "high" as const, title: "McLaren Sponsorship Gap Detected", summary: "McLaren's digital engagement exceeds sponsor allocation by 34%. Recommend targeting tech sponsors for $15-20M deals.", module: "sponsorship", timestamp: "2 hours ago" },
  { id: "i2", type: "anomaly" as const, severity: "medium" as const, title: "Ferrari Merch Spike in Asia-Pacific", summary: "Unusual 48% merchandise sales increase in Japan/Korea markets following Leclerc's podium streak. Potential supply chain pressure.", module: "merchandise", timestamp: "4 hours ago" },
  { id: "i3", type: "risk" as const, severity: "high" as const, title: "Crypto.com ROI Below Threshold", summary: "Sponsor ROI has declined 23% over 3 months. Contract renewal risk elevated. Recommend activation strategy review.", module: "sponsorship", timestamp: "6 hours ago" },
  { id: "i4", type: "growth" as const, severity: "low" as const, title: "Williams TikTok Growth Accelerating", summary: "28.4% follower growth rate — fastest in paddock. Content strategy around team culture resonating with Gen Z.", module: "fans", timestamp: "8 hours ago" },
  { id: "i5", type: "prediction" as const, severity: "medium" as const, title: "Monaco GP Revenue Forecast", summary: "Projected $48M total commercial revenue from Monaco GP weekend, 12% above 2025. Hospitality packages driving growth.", module: "simulator", timestamp: "12 hours ago" },
];

// ============================================
// COPILOT SUGGESTIONS
// ============================================

export const copilotSuggestions = [
  "Which sponsor has the highest ROI this season?",
  "Predict Red Bull's fan growth for Q3 2026",
  "Compare merchandise performance: Ferrari vs McLaren",
  "What drives engagement spikes after race weekends?",
  "Identify underperforming sponsors by visibility index",
  "Generate a board report summary for May 2026",
  "Which market should we prioritize for expansion?",
  "Analyze the correlation between podium finishes and merch sales",
];

// ============================================
// EXPOSURE HEATMAP DATA
// ============================================

// Seeded pseudo-random for deterministic data
function seeded(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export const exposureHeatmap = sponsors.slice(0, 8).map((s, si) => ({
  sponsor: s.name,
  races: raceEvents.map((r, ri) => ({
    race: r.name.replace(" GP", ""),
    value: Math.round(40 + seeded(si * 100 + ri) * 60),
  })),
}));

// ============================================
// SENTIMENT TIMELINE
// ============================================

export const sentimentTimeline = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  positive: Math.round(55 + seeded(i * 3 + 1) * 25),
  neutral: Math.round(15 + seeded(i * 3 + 2) * 15),
  negative: Math.round(5 + seeded(i * 3 + 3) * 15),
}));

// ============================================
// GEOGRAPHIC FAN DATA
// ============================================

export const fanGeography = [
  { country: "United Kingdom", fans: 14_200_000, growth: 8.4, lat: 51.5, lng: -0.12 },
  { country: "United States", fans: 12_800_000, growth: 28.6, lat: 37.1, lng: -95.7 },
  { country: "Brazil", fans: 8_600_000, growth: 12.1, lat: -14.2, lng: -51.9 },
  { country: "Germany", fans: 7_200_000, growth: 6.8, lat: 51.2, lng: 10.4 },
  { country: "Italy", fans: 9_400_000, growth: 5.2, lat: 41.9, lng: 12.6 },
  { country: "Netherlands", fans: 6_800_000, growth: 18.4, lat: 52.1, lng: 5.3 },
  { country: "Japan", fans: 5_400_000, growth: 14.2, lat: 36.2, lng: 138.3 },
  { country: "Australia", fans: 4_200_000, growth: 16.8, lat: -25.3, lng: 133.8 },
  { country: "Mexico", fans: 3_800_000, growth: 22.4, lat: 23.6, lng: -102.6 },
  { country: "India", fans: 5_600_000, growth: 42.1, lat: 20.6, lng: 79.0 },
  { country: "China", fans: 4_800_000, growth: 35.2, lat: 35.9, lng: 104.2 },
  { country: "Spain", fans: 4_600_000, growth: 7.6, lat: 40.5, lng: -3.7 },
  { country: "France", fans: 5_200_000, growth: 9.4, lat: 46.2, lng: 2.2 },
  { country: "Canada", fans: 3_200_000, growth: 19.8, lat: 56.1, lng: -106.3 },
  { country: "Saudi Arabia", fans: 2_800_000, growth: 48.6, lat: 23.9, lng: 45.1 },
];
