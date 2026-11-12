"use client";

import { useCallback, useEffect, useState } from "react";
import { CITIES, type CityBase } from "@/lib/cities";
import {
  fetchCityWeather,
  fetchManyCityWeather,
  type CityWeather,
} from "@/lib/open-meteo";

export function useCityWeatherList(cities: CityBase[] = CITIES) {
  const [data, setData] = useState<CityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchManyCityWeather(cities);
      setData(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wetter konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [cities]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useSelectedCityWeather(
  city: CityBase | null,
  fallback?: CityWeather | null,
) {
  const [data, setData] = useState<CityWeather | null>(fallback ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    // Wenn bereits geladen und gleiche Stadt: behalten
    if (fallback && fallback.id === city.id) {
      setData(fallback);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchCityWeather(city)
      .then((weather) => {
        if (!cancelled) setData(weather);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Wetter konnte nicht geladen werden",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city, fallback]);

  return { data, loading, error };
}
