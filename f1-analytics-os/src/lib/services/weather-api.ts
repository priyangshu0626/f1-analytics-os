// ============================================
// F1 ANALYTICS OS — OPEN METEO WEATHER API
// ============================================
// Free, no API key. Fetches race-weekend weather
// forecasts for upcoming circuit locations.

// Circuit coordinates for 2026 F1 calendar
const CIRCUIT_COORDS: Record<string, { lat: number; lon: number; city: string }> = {
  "Albert Park Grand Prix Circuit": { lat: -37.8497, lon: 144.968, city: "Melbourne" },
  "Shanghai International Circuit": { lat: 31.3389, lon: 121.2198, city: "Shanghai" },
  "Suzuka Circuit": { lat: 34.8431, lon: 136.5407, city: "Suzuka" },
  "Bahrain International Circuit": { lat: 26.0325, lon: 50.5106, city: "Sakhir" },
  "Jeddah Corniche Circuit": { lat: 21.6319, lon: 39.1044, city: "Jeddah" },
  "Miami International Autodrome": { lat: 25.9581, lon: -80.2389, city: "Miami" },
  "Circuit de Monaco": { lat: 43.7347, lon: 7.4206, city: "Monte Carlo" },
  "Circuit de Barcelona-Catalunya": { lat: 41.57, lon: 2.2611, city: "Barcelona" },
  "Circuit Gilles Villeneuve": { lat: 45.5, lon: -73.5228, city: "Montreal" },
  "Red Bull Ring": { lat: 47.2197, lon: 14.7647, city: "Spielberg" },
  "Silverstone Circuit": { lat: 52.0786, lon: -1.0169, city: "Silverstone" },
  "Hungaroring": { lat: 47.5789, lon: 19.2486, city: "Budapest" },
  "Circuit de Spa-Francorchamps": { lat: 50.4372, lon: 5.9714, city: "Spa" },
  "Circuit Zandvoort": { lat: 52.3888, lon: 4.5409, city: "Zandvoort" },
  "Autodromo Nazionale di Monza": { lat: 45.6156, lon: 9.2811, city: "Monza" },
  "Baku City Circuit": { lat: 40.3725, lon: 49.8533, city: "Baku" },
  "Marina Bay Street Circuit": { lat: 1.2914, lon: 103.8640, city: "Singapore" },
  "Circuit of the Americas": { lat: 30.1328, lon: -97.6411, city: "Austin" },
  "Autódromo Hermanos Rodríguez": { lat: 19.4042, lon: -99.0907, city: "Mexico City" },
  "Interlagos": { lat: -23.7036, lon: -46.6997, city: "São Paulo" },
  "Las Vegas Strip Circuit": { lat: 36.1147, lon: -115.1728, city: "Las Vegas" },
  "Losail International Circuit": { lat: 25.49, lon: 51.4542, city: "Lusail" },
  "Yas Marina Circuit": { lat: 24.4672, lon: 54.6031, city: "Abu Dhabi" },
};

export interface RaceWeather {
  circuitName: string;
  city: string;
  date: string;
  temperature: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
}

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Foggy", 48: "Rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
  55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

export async function fetchRaceWeather(circuitName: string, raceDate: string): Promise<RaceWeather | null> {
  const coords = Object.entries(CIRCUIT_COORDS).find(([name]) =>
    circuitName.toLowerCase().includes(name.toLowerCase().split(" ")[0]) ||
    name.toLowerCase().includes(circuitName.toLowerCase().split(" ")[0])
  );

  if (!coords) return null;
  const [, { lat, lon, city }] = coords;

  try {
    // Open Meteo forecast (up to 16 days) or historical
    const today = new Date();
    const race = new Date(raceDate);
    const daysAhead = Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let url: string;
    if (daysAhead > 0 && daysAhead <= 16) {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto&start_date=${raceDate}&end_date=${raceDate}`;
    } else if (daysAhead <= 0) {
      // Historical weather
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto&start_date=${raceDate}&end_date=${raceDate}`;
    } else {
      // Too far ahead — use climate normals via current conditions
      url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,windspeed_10m,weathercode&timezone=auto`;
    }

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();

    if (data.daily) {
      const code = data.daily.weathercode?.[0] ?? 0;
      return {
        circuitName,
        city,
        date: raceDate,
        temperature: Math.round(((data.daily.temperature_2m_max?.[0] || 25) + (data.daily.temperature_2m_min?.[0] || 15)) / 2),
        temperatureMax: data.daily.temperature_2m_max?.[0] || 25,
        temperatureMin: data.daily.temperature_2m_min?.[0] || 15,
        precipitation: data.daily.precipitation_sum?.[0] || 0,
        windSpeed: data.daily.windspeed_10m_max?.[0] || 10,
        weatherCode: code,
        weatherDescription: WEATHER_CODES[code] || "Unknown",
      };
    }

    if (data.current) {
      return {
        circuitName,
        city,
        date: raceDate,
        temperature: Math.round(data.current.temperature_2m || 22),
        temperatureMax: Math.round((data.current.temperature_2m || 22) + 4),
        temperatureMin: Math.round((data.current.temperature_2m || 22) - 4),
        precipitation: 0,
        windSpeed: data.current.windspeed_10m || 10,
        weatherCode: data.current.weathercode || 0,
        weatherDescription: WEATHER_CODES[data.current.weathercode] || "Unknown",
      };
    }

    return null;
  } catch (err) {
    console.error("Open Meteo error:", err);
    return null;
  }
}

/**
 * Fetch weather for all upcoming races in the schedule.
 */
export async function fetchAllRaceWeather(
  schedule: Array<{ circuitName: string; date: string }>
): Promise<RaceWeather[]> {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = schedule.filter((r) => r.date >= today).slice(0, 5);

  const results = await Promise.all(
    upcoming.map((r) => fetchRaceWeather(r.circuitName, r.date))
  );

  return results.filter((r): r is RaceWeather => r !== null);
}
