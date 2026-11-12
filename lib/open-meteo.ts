import type { CityBase } from "@/lib/cities";
import {
  resolveTimeOfDay,
  weatherCodeToCondition,
  weatherCodeToLabel,
} from "@/lib/weather-codes";
import type {
  TimeOfDay,
  WeatherCondition,
} from "@/components/weather-background";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export type HourlyTemp = {
  hour: number;
  label: string;
  temp: number;
  isNow: boolean;
  weatherCode: number;
  isDay: boolean;
};

export type DailyForecast = {
  date: string;
  day: string;
  high: number;
  low: number;
  label: string;
  weatherCode: number;
  windMax: number;
  precipitationSum: number;
  precipitationProbability: number;
};

export type CityWeather = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  conditionLabel: string;
  timeOfDay: TimeOfDay;
  weatherCode: number;
  humidity: number;
  wind: number;
  high: number;
  low: number;
  summary: string;
  sunrise: string;
  sunset: string;
  isDay: boolean;
  hourly: HourlyTemp[];
  forecast: DailyForecast[];
  image: string;
  scene: CityBase["scene"];
};

export type GeocodeResult = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
};

type ForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
};

type GeocodeResponse = {
  results?: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    country_code?: string;
    admin1?: string;
  }[];
};

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function localHourFromIso(iso: string): number {
  // "2026-11-12T14:00" → 14 (already local thanks to timezone=auto)
  const match = iso.match(/T(\d{2})/);
  return match ? Number(match[1]) : 0;
}

function weekdayFromDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return WEEKDAYS[d.getDay()] ?? dateStr;
}

function buildSummary(
  name: string,
  label: string,
  temp: number,
  wind: number,
  precipProb: number,
): string {
  const parts = [
    `${label} in ${name}.`,
    `Aktuell ${Math.round(temp)}°C`,
    `bei Wind um ${Math.round(wind)} km/h.`,
  ];
  if (precipProb >= 40) {
    parts.push(`Regenwahrscheinlichkeit heute bis ${precipProb}%.`);
  }
  return parts.join(" ");
}

export async function fetchCityWeather(city: CityBase): Promise<CityWeather> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    hourly: ["temperature_2m", "weather_code", "is_day"].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "kmh",
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Open-Meteo Forecast fehlgeschlagen (${res.status})`);
  }

  const data = (await res.json()) as ForecastResponse;
  const { current, hourly, daily } = data;

  const currentHour = localHourFromIso(current.time);
  let from = hourly.time.indexOf(current.time);
  if (from < 0) {
    from = hourly.time.findIndex((t) => t.startsWith(current.time.slice(0, 13)));
  }
  if (from < 0) from = 0;

  const hourlyFinal: HourlyTemp[] = hourly.time
    .slice(from, from + 24)
    .map((time, i) => {
      const idx = from + i;
      const hour = localHourFromIso(time);
      return {
        hour,
        label: `${String(hour).padStart(2, "0")} Uhr`,
        temp: Math.round(hourly.temperature_2m[idx] ?? 0),
        isNow: i === 0,
        weatherCode: hourly.weather_code[idx] ?? current.weather_code,
        isDay: (hourly.is_day[idx] ?? current.is_day) === 1,
      };
    });

  const forecast: DailyForecast[] = daily.time.map((date, i) => ({
    date,
    day: weekdayFromDate(date),
    high: Math.round(daily.temperature_2m_max[i] ?? 0),
    low: Math.round(daily.temperature_2m_min[i] ?? 0),
    label: weatherCodeToLabel(daily.weather_code[i] ?? 0),
    weatherCode: daily.weather_code[i] ?? 0,
    windMax: Math.round(daily.wind_speed_10m_max[i] ?? 0),
    precipitationSum: Number((daily.precipitation_sum[i] ?? 0).toFixed(1)),
    precipitationProbability: Math.round(
      daily.precipitation_probability_max[i] ?? 0,
    ),
  }));

  const isDay = current.is_day === 1;
  const sunset = daily.sunset[0] ?? current.time;
  const sunrise = daily.sunrise[0] ?? current.time;
  const condition = weatherCodeToCondition(current.weather_code);
  const conditionLabel = weatherCodeToLabel(current.weather_code);
  const timeOfDay = resolveTimeOfDay(isDay, sunset);

  return {
    id: city.id,
    name: city.name,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    condition,
    conditionLabel,
    timeOfDay,
    weatherCode: current.weather_code,
    humidity: Math.round(current.relative_humidity_2m),
    wind: Math.round(current.wind_speed_10m),
    high: Math.round(daily.temperature_2m_max[0] ?? current.temperature_2m),
    low: Math.round(daily.temperature_2m_min[0] ?? current.temperature_2m),
    summary: buildSummary(
      city.name,
      conditionLabel,
      current.temperature_2m,
      current.wind_speed_10m,
      daily.precipitation_probability_max[0] ?? 0,
    ),
    sunrise,
    sunset,
    isDay,
    hourly: hourlyFinal,
    forecast,
    image: city.image,
    scene: city.scene,
  };
}

export async function fetchManyCityWeather(
  cities: CityBase[],
): Promise<CityWeather[]> {
  return Promise.all(cities.map((c) => fetchCityWeather(c)));
}

export async function searchLocations(
  query: string,
  count = 6,
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    name: q,
    count: String(count),
    language: "de",
    format: "json",
  });

  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Open-Meteo Geocoding fehlgeschlagen (${res.status})`);
  }

  const data = (await res.json()) as GeocodeResponse;
  return (data.results ?? []).map((r) => ({
    id: `geo-${r.id}`,
    name: r.name,
    country: r.country ?? r.country_code ?? "",
    latitude: r.latitude,
    longitude: r.longitude,
    admin1: r.admin1,
  }));
}

export function geocodeToCityBase(result: GeocodeResult): CityBase {
  return {
    id: result.id,
    name: result.name,
    country: result.admin1
      ? `${result.admin1}, ${result.country}`
      : result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    image:
      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=800&q=80",
    scene: "city",
  };
}
