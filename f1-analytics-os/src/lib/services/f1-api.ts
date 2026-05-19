// ============================================
// F1 ANALYTICS OS — JOLPICA F1 API CLIENT
// ============================================
// Free, open-source replacement for the deprecated Ergast API.
// Provides real 2026 F1 data: standings, schedule, results.
// Rate limit: 4 req/s, 500 req/hr (be courteous).

const BASE_URL = "https://api.jolpi.ca/ergast/f1";
const SEASON = "2026";

// ---- Types ----

export interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driverId: string;
  driverCode: string;
  givenName: string;
  familyName: string;
  nationality: string;
  constructorId: string;
  constructorName: string;
}

export interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructorId: string;
  constructorName: string;
  nationality: string;
}

export interface RaceScheduleItem {
  round: number;
  raceName: string;
  circuitName: string;
  country: string;
  date: string;
  time?: string;
}

export interface RaceResult {
  round: number;
  raceName: string;
  date: string;
  results: Array<{
    position: number;
    driverCode: string;
    driverName: string;
    constructorName: string;
    status: string;
    points: number;
    grid: number;
    laps: number;
    time?: string;
  }>;
}

// ---- Fetch Helpers ----

async function fetchJSON(url: string): Promise<unknown> {
  const res = await fetch(url, {
    next: { revalidate: 86400 }, // 24h ISR cache
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`Jolpica API ${res.status}: ${url}`);
  return res.json();
}

// ---- Public API ----

export async function fetchDriverStandings(): Promise<DriverStanding[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await fetchJSON(`${BASE_URL}/${SEASON}/driverStandings.json`);
  const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return list.map((d: any) => ({
    position: parseInt(d.position),
    points: parseFloat(d.points),
    wins: parseInt(d.wins),
    driverId: d.Driver.driverId,
    driverCode: d.Driver.code || d.Driver.driverId.slice(0, 3).toUpperCase(),
    givenName: d.Driver.givenName,
    familyName: d.Driver.familyName,
    nationality: d.Driver.nationality,
    constructorId: d.Constructors[0]?.constructorId || "",
    constructorName: d.Constructors[0]?.name || "",
  }));
}

export async function fetchConstructorStandings(): Promise<ConstructorStanding[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await fetchJSON(`${BASE_URL}/${SEASON}/constructorStandings.json`);
  const list = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return list.map((c: any) => ({
    position: parseInt(c.position),
    points: parseFloat(c.points),
    wins: parseInt(c.wins),
    constructorId: c.Constructor.constructorId,
    constructorName: c.Constructor.name,
    nationality: c.Constructor.nationality,
  }));
}

export async function fetchRaceSchedule(): Promise<RaceScheduleItem[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await fetchJSON(`${BASE_URL}/${SEASON}.json?limit=30`);
  const races = json?.MRData?.RaceTable?.Races || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return races.map((r: any) => ({
    round: parseInt(r.round),
    raceName: r.raceName,
    circuitName: r.Circuit?.circuitName || "",
    country: r.Circuit?.Location?.country || "",
    date: r.date,
    time: r.time,
  }));
}

export async function fetchRaceResults(): Promise<RaceResult[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await fetchJSON(`${BASE_URL}/${SEASON}/results.json?limit=200`);
  const races = json?.MRData?.RaceTable?.Races || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return races.map((r: any) => ({
    round: parseInt(r.round),
    raceName: r.raceName,
    date: r.date,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: (r.Results || []).map((res: any) => ({
      position: parseInt(res.position),
      driverCode: res.Driver?.code || "",
      driverName: `${res.Driver?.givenName} ${res.Driver?.familyName}`,
      constructorName: res.Constructor?.name || "",
      status: res.status,
      points: parseFloat(res.points),
      grid: parseInt(res.grid),
      laps: parseInt(res.laps || "0"),
      time: res.Time?.time,
    })),
  }));
}

export async function fetchNextRace(): Promise<RaceScheduleItem | null> {
  const schedule = await fetchRaceSchedule();
  const today = new Date().toISOString().split("T")[0];
  return schedule.find((r) => r.date >= today) || null;
}

// Constructor ID → display name mapping (handles API variations)
export const CONSTRUCTOR_DISPLAY_NAMES: Record<string, string> = {
  mercedes: "Mercedes",
  ferrari: "Ferrari",
  mclaren: "McLaren",
  red_bull: "Red Bull",
  alpine: "Alpine",
  haas: "Haas",
  rb: "RB",
  williams: "Williams",
  audi: "Audi",
  aston_martin: "Aston Martin",
  cadillac: "Cadillac",
  kick_sauber: "Kick Sauber",
};

export function getTeamDisplayName(constructorId: string): string {
  return CONSTRUCTOR_DISPLAY_NAMES[constructorId] || constructorId;
}
