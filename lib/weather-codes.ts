import type {
  TimeOfDay,
  WeatherCondition,
} from "@/components/weather-background";

/** WMO weather_code → App-Zustand */
export function weatherCodeToCondition(code: number): WeatherCondition {
  if (code === 0 || code === 1) return "clear";
  if (
    code === 2 ||
    code === 3 ||
    code === 45 ||
    code === 48 ||
    (code >= 71 && code <= 77)
  ) {
    return "cloudy";
  }
  // Niesel, Regen, Schauer, Gewitter
  return "rain";
}

export function weatherCodeToLabel(code: number): string {
  if (code === 0) return "Klar";
  if (code === 1) return "Überwiegend klar";
  if (code === 2) return "Teilweise bewölkt";
  if (code === 3) return "Bedeckt";
  if (code === 45 || code === 48) return "Nebel";
  if (code >= 51 && code <= 57) return "Nieselregen";
  if (code >= 61 && code <= 67) return "Regen";
  if (code >= 71 && code <= 77) return "Schnee";
  if (code >= 80 && code <= 82) return "Regenschauer";
  if (code >= 85 && code <= 86) return "Schneeschauer";
  if (code >= 95) return "Gewitter";
  return "Wechselhaft";
}

/**
 * Tageszeit aus is_day + Sonnenuntergang (Ortszeit der Stadt).
 * Sunset-Fenster: 60 Minuten vor bis 20 Minuten nach Sonnenuntergang.
 */
export function resolveTimeOfDay(
  isDay: boolean,
  sunsetIso: string,
  localNow: Date = new Date(),
): TimeOfDay {
  if (!isDay) return "night";

  const sunset = new Date(sunsetIso);
  if (Number.isNaN(sunset.getTime())) return "day";

  const diffMin = (sunset.getTime() - localNow.getTime()) / 60_000;
  if (diffMin <= 60 && diffMin >= -20) return "sunset";
  return "day";
}
