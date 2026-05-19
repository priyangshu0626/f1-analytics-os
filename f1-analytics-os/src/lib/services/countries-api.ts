// ============================================
// F1 ANALYTICS OS — REST COUNTRIES API
// ============================================
// Free, no API key. Enriches fan geography with
// real country data: flags, population, region.

const BASE_URL = "https://restcountries.com/v3.1";

export interface CountryData {
  name: string;
  code: string;
  flag: string;
  flagEmoji: string;
  population: number;
  region: string;
  subregion: string;
  capital: string;
  currencies: string[];
  languages: string[];
}

// Countries with significant F1 fan bases
const F1_COUNTRIES = [
  "United Kingdom", "Italy", "Germany", "France", "Spain",
  "Netherlands", "Brazil", "United States", "Japan", "Australia",
  "Mexico", "Canada", "India", "China", "Saudi Arabia",
  "United Arab Emirates", "Singapore", "Austria", "Belgium",
  "Hungary", "Monaco", "Qatar", "Bahrain", "Argentina",
];

export async function fetchF1CountryData(): Promise<CountryData[]> {
  try {
    const codes = F1_COUNTRIES.map(encodeURIComponent).join(",");
    // Fetch by country name — batch request
    const url = `${BASE_URL}/all?fields=name,cca2,flags,flag,population,region,subregion,capital,currencies,languages`;
    const res = await fetch(url, { next: { revalidate: 604800 } }); // Cache 7 days

    if (!res.ok) {
      console.error(`REST Countries API error: ${res.status}`);
      return getFallbackCountries();
    }

    const data = await res.json();

    // Filter to F1-relevant countries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allCountries: CountryData[] = (data || []).map((c: any) => ({
      name: c.name?.common || "",
      code: c.cca2 || "",
      flag: c.flags?.svg || c.flags?.png || "",
      flagEmoji: c.flag || "",
      population: c.population || 0,
      region: c.region || "",
      subregion: c.subregion || "",
      capital: Array.isArray(c.capital) ? c.capital[0] || "" : "",
      currencies: Object.keys(c.currencies || {}),
      languages: Object.values(c.languages || {}) as string[],
    }));

    return allCountries.filter((c) =>
      F1_COUNTRIES.some((fc) => c.name.toLowerCase() === fc.toLowerCase())
    );
  } catch (err) {
    console.error("REST Countries error:", err);
    return getFallbackCountries();
  }
}

/**
 * Get a single country by name.
 */
export async function fetchCountryByName(name: string): Promise<CountryData | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/name/${encodeURIComponent(name)}?fields=name,cca2,flags,flag,population,region,subregion,capital,currencies,languages`,
      { next: { revalidate: 604800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;

    const c = data[0];
    return {
      name: c.name?.common || name,
      code: c.cca2 || "",
      flag: c.flags?.svg || c.flags?.png || "",
      flagEmoji: c.flag || "",
      population: c.population || 0,
      region: c.region || "",
      subregion: c.subregion || "",
      capital: Array.isArray(c.capital) ? c.capital[0] || "" : "",
      currencies: Object.keys(c.currencies || {}),
      languages: Object.values(c.languages || {}) as string[],
    };
  } catch {
    return null;
  }
}

/**
 * Enrich fan geography data with real country info.
 */
export function enrichFanGeography(
  countries: CountryData[],
  fanGeo: Array<{ country: string; fans: number; growth: number }>
): Array<{ country: string; fans: number; growth: number; flag: string; population: number; region: string; fanPenetration: number }> {
  return fanGeo.map((fg) => {
    const countryData = countries.find((c) =>
      c.name.toLowerCase() === fg.country.toLowerCase() ||
      c.code.toLowerCase() === fg.country.toLowerCase()
    );
    const population = countryData?.population || 50_000_000;
    return {
      ...fg,
      flag: countryData?.flagEmoji || "🏁",
      population,
      region: countryData?.region || "Unknown",
      fanPenetration: parseFloat(((fg.fans / population) * 100).toFixed(3)),
    };
  });
}

function getFallbackCountries(): CountryData[] {
  return [
    { name: "United Kingdom", code: "GB", flag: "", flagEmoji: "🇬🇧", population: 67_886_011, region: "Europe", subregion: "Northern Europe", capital: "London", currencies: ["GBP"], languages: ["English"] },
    { name: "Italy", code: "IT", flag: "", flagEmoji: "🇮🇹", population: 60_461_826, region: "Europe", subregion: "Southern Europe", capital: "Rome", currencies: ["EUR"], languages: ["Italian"] },
    { name: "United States", code: "US", flag: "", flagEmoji: "🇺🇸", population: 331_002_651, region: "Americas", subregion: "North America", capital: "Washington, D.C.", currencies: ["USD"], languages: ["English"] },
    { name: "Brazil", code: "BR", flag: "", flagEmoji: "🇧🇷", population: 212_559_417, region: "Americas", subregion: "South America", capital: "Brasília", currencies: ["BRL"], languages: ["Portuguese"] },
    { name: "Japan", code: "JP", flag: "", flagEmoji: "🇯🇵", population: 126_476_461, region: "Asia", subregion: "Eastern Asia", capital: "Tokyo", currencies: ["JPY"], languages: ["Japanese"] },
    { name: "India", code: "IN", flag: "", flagEmoji: "🇮🇳", population: 1_380_004_385, region: "Asia", subregion: "Southern Asia", capital: "New Delhi", currencies: ["INR"], languages: ["Hindi", "English"] },
    { name: "Australia", code: "AU", flag: "", flagEmoji: "🇦🇺", population: 25_499_884, region: "Oceania", subregion: "Australia and New Zealand", capital: "Canberra", currencies: ["AUD"], languages: ["English"] },
    { name: "Netherlands", code: "NL", flag: "", flagEmoji: "🇳🇱", population: 17_134_872, region: "Europe", subregion: "Western Europe", capital: "Amsterdam", currencies: ["EUR"], languages: ["Dutch"] },
    { name: "Mexico", code: "MX", flag: "", flagEmoji: "🇲🇽", population: 128_932_753, region: "Americas", subregion: "North America", capital: "Mexico City", currencies: ["MXN"], languages: ["Spanish"] },
    { name: "Germany", code: "DE", flag: "", flagEmoji: "🇩🇪", population: 83_783_942, region: "Europe", subregion: "Western Europe", capital: "Berlin", currencies: ["EUR"], languages: ["German"] },
  ];
}
