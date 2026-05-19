// ============================================
// F1 ANALYTICS OS — DETERMINISTIC ANALYTICS
// ============================================
// ALL computed metrics use deterministic formulas
// with REAL data inputs. No AI fabrication.
//
// Every formula is documented with:
//   FORMULA: description
//   INPUTS: list of real data sources
//   OUTPUT: what it produces

import type { ConstructorStanding, DriverStanding, RaceResult } from "./services/f1-api";
import type { YouTubeChannelStats } from "./services/youtube-api";
import type { NewsArticle } from "./services/news-api";
import type { SentimentResult } from "./services/sentiment-api";

// ============================================
// DATA SOURCE TYPES
// ============================================

export type DataType = "LIVE DATA" | "CALCULATED" | "AI SUMMARY" | "HISTORICAL";

export interface DataSource {
  name: string;
  api: string;
  dataType: DataType;
  updatedAt: string;
}

export interface SourcedMetric<T> {
  value: T;
  source: DataSource;
}

// ============================================
// CONSTRUCTOR COMMERCIAL SCORE (0-100)
// ============================================
// FORMULA: CCS = (standings_score + youtube_score + news_score + sentiment_score) / 4
// INPUTS: Jolpica standings, YouTube API, GNews/NewsData counts, HuggingFace sentiment
// OUTPUT: Composite score per constructor

export interface ConstructorCommercialProfile {
  constructorId: string;
  constructorName: string;
  // From Jolpica (LIVE DATA)
  standingsPosition: number;
  championshipPoints: number;
  wins: number;
  // From YouTube API (LIVE DATA)
  youtubeSubscribers: number;
  youtubeViews: number;
  youtubeVideos: number;
  // From News API (CALCULATED — counted from real articles)
  newsMentions: number;
  // From HuggingFace (CALCULATED)
  sentimentScore: number;
  // Deterministic composite
  commercialScore: number;
  standingsScore: number;
  youtubeScore: number;
  newsScore: number;
}

export function computeConstructorProfiles(
  constructors: ConstructorStanding[],
  ytChannels: YouTubeChannelStats[],
  news: NewsArticle[],
  sentimentResults: SentimentResult[],
): ConstructorCommercialProfile[] {
  const totalConstructors = constructors.length || 1;

  // Count news mentions per constructor
  const newsMentionCounts: Record<string, number> = {};
  for (const c of constructors) {
    const name = c.constructorName.toLowerCase();
    const count = news.filter((n) => {
      const text = (n.title + " " + n.description).toLowerCase();
      return text.includes(name) || text.includes(c.constructorId.replace("_", " "));
    }).length;
    newsMentionCounts[c.constructorId] = count;
  }

  // Compute sentiment per constructor from news
  const sentimentByConstructor: Record<string, number> = {};
  for (const c of constructors) {
    const name = c.constructorName.toLowerCase();
    const matchingSentiment = sentimentResults.filter((s) => {
      return s.text.toLowerCase().includes(name);
    });
    if (matchingSentiment.length > 0) {
      sentimentByConstructor[c.constructorId] = Math.round(
        matchingSentiment.reduce((a, s) => a + s.scores.positive * 100, 0) / matchingSentiment.length
      );
    } else {
      sentimentByConstructor[c.constructorId] = 50; // Neutral default when no data
    }
  }

  // Normalize functions
  const maxPoints = Math.max(...constructors.map((c) => c.points), 1);
  const maxYtSubs = Math.max(...ytChannels.map((c) => c.subscriberCount), 1);
  const maxMentions = Math.max(...Object.values(newsMentionCounts), 1);

  return constructors.map((c) => {
    const ytData = ytChannels.find((yt) => {
      return yt.teamKey === c.constructorId ||
        c.constructorName.toLowerCase().includes(yt.teamKey) ||
        yt.teamKey.includes(c.constructorId.split("_")[0]);
    });

    // FORMULA: standings_score = (1 - (position-1)/total) * 100
    const standingsScore = Math.round((1 - (c.position - 1) / totalConstructors) * 100);

    // FORMULA: youtube_score = (subscribers / max_subscribers) * 100
    const youtubeScore = ytData
      ? Math.round((ytData.subscriberCount / maxYtSubs) * 100)
      : 0;

    // FORMULA: news_score = (mentions / max_mentions) * 100
    const newsCount = newsMentionCounts[c.constructorId] || 0;
    const newsScore = maxMentions > 0 ? Math.round((newsCount / maxMentions) * 100) : 0;

    // Sentiment score (0-100)
    const sentimentScore = sentimentByConstructor[c.constructorId] || 50;

    // FORMULA: CCS = (standings + youtube + news + sentiment) / 4
    const commercialScore = Math.round((standingsScore + youtubeScore + newsScore + sentimentScore) / 4);

    return {
      constructorId: c.constructorId,
      constructorName: c.constructorName,
      standingsPosition: c.position,
      championshipPoints: c.points,
      wins: c.wins,
      youtubeSubscribers: ytData?.subscriberCount || 0,
      youtubeViews: ytData?.viewCount || 0,
      youtubeVideos: ytData?.videoCount || 0,
      newsMentions: newsCount,
      sentimentScore,
      commercialScore,
      standingsScore,
      youtubeScore,
      newsScore,
    };
  });
}

// ============================================
// DRIVER HYPE INDEX (0-100)
// ============================================
// FORMULA: DHI = (standings_score + news_score + youtube_team_score) / 3
// INPUTS: Jolpica driver standings, news article counts, YouTube team data
// OUTPUT: Hype index per driver

export interface DriverHypeProfile {
  driverId: string;
  driverName: string;
  driverCode: string;
  constructorName: string;
  position: number;
  points: number;
  wins: number;
  newsMentions: number;
  hypeIndex: number;
}

export function computeDriverHypeProfiles(
  drivers: DriverStanding[],
  news: NewsArticle[],
): DriverHypeProfile[] {
  const maxPoints = Math.max(...drivers.map((d) => d.points), 1);

  return drivers.map((d) => {
    const fullName = `${d.givenName} ${d.familyName}`.toLowerCase();
    const shortName = d.familyName.toLowerCase();

    // Count real news mentions
    const newsMentions = news.filter((n) => {
      const text = (n.title + " " + n.description).toLowerCase();
      return text.includes(fullName) || text.includes(shortName) || text.includes(d.driverCode.toLowerCase());
    }).length;

    const maxMentions = Math.max(newsMentions, 1);

    // FORMULA: standings_score = (points / max_points) * 100
    const standingsScore = Math.round((d.points / maxPoints) * 100);

    // FORMULA: news_score = min(100, mentions * 20) — capped
    const newsScore = Math.min(100, newsMentions * 20);

    // FORMULA: DHI = (standings_score + news_score) / 2
    const hypeIndex = Math.round((standingsScore + newsScore) / 2);

    return {
      driverId: d.driverId,
      driverName: `${d.givenName} ${d.familyName}`,
      driverCode: d.driverCode,
      constructorName: d.constructorName,
      position: d.position,
      points: d.points,
      wins: d.wins,
      newsMentions,
      hypeIndex,
    };
  });
}

// ============================================
// POINTS PROGRESSION (per race)
// ============================================
// FORMULA: cumulative points per constructor across races
// INPUTS: Jolpica race results
// OUTPUT: Race-by-race points timeline

export interface PointsProgressionEntry {
  race: string;
  round: number;
  [constructorName: string]: string | number;
}

export function computePointsProgression(results: RaceResult[], constructors: ConstructorStanding[]): PointsProgressionEntry[] {
  const cumulativePoints: Record<string, number> = {};
  for (const c of constructors) {
    cumulativePoints[c.constructorName] = 0;
  }

  return results.map((race) => {
    // Sum points per constructor in this race
    for (const result of race.results) {
      if (cumulativePoints[result.constructorName] !== undefined) {
        cumulativePoints[result.constructorName] += result.points;
      }
    }

    const entry: PointsProgressionEntry = {
      race: race.raceName.replace(" Grand Prix", " GP"),
      round: race.round,
    };

    for (const [name, pts] of Object.entries(cumulativePoints)) {
      entry[name] = pts;
    }

    return entry;
  });
}

// ============================================
// REAL KPI METRICS
// ============================================
// INPUTS: All real API data
// OUTPUT: KPI cards with source attribution

export interface RealKPI {
  id: string;
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  source: DataSource;
  change?: number;
  trend?: "up" | "down" | "flat";
}

export function computeRealKPIs(
  drivers: DriverStanding[],
  constructors: ConstructorStanding[],
  ytChannels: YouTubeChannelStats[],
  news: NewsArticle[],
  sentimentScore: number,
  racesCompleted: number,
  totalRaces: number,
): RealKPI[] {
  const now = new Date().toISOString();
  const totalYTSubs = ytChannels.reduce((a, c) => a + c.subscriberCount, 0);
  const leader = drivers[0];
  const constructorLeader = constructors[0];

  return [
    {
      id: "championship-leader",
      label: "Championship Leader",
      value: leader ? `${leader.givenName} ${leader.familyName}` : "TBD",
      suffix: leader ? ` — ${leader.points}pts` : "",
      source: { name: "Jolpica F1 API", api: "ergast", dataType: "LIVE DATA", updatedAt: now },
    },
    {
      id: "constructor-leader",
      label: "Constructor Leader",
      value: constructorLeader ? constructorLeader.constructorName : "TBD",
      suffix: constructorLeader ? ` — ${constructorLeader.points}pts` : "",
      source: { name: "Jolpica F1 API", api: "ergast", dataType: "LIVE DATA", updatedAt: now },
    },
    {
      id: "youtube-reach",
      label: "YouTube Subscribers",
      value: totalYTSubs,
      source: { name: "YouTube Data API", api: "youtube", dataType: "LIVE DATA", updatedAt: now },
    },
    {
      id: "news-volume",
      label: "News Articles (24h)",
      value: news.length,
      source: { name: "GNews + NewsData.io", api: "gnews", dataType: "LIVE DATA", updatedAt: now },
    },
    {
      id: "sentiment",
      label: "News Sentiment",
      value: sentimentScore,
      suffix: "/100",
      source: { name: "HuggingFace NLP", api: "huggingface", dataType: "CALCULATED", updatedAt: now },
    },
    {
      id: "season-progress",
      label: "Season Progress",
      value: racesCompleted,
      suffix: `/${totalRaces} races`,
      source: { name: "Jolpica F1 API", api: "ergast", dataType: "LIVE DATA", updatedAt: now },
    },
  ];
}
