"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { WeatherBackground } from "@/components/weather-background";
import GlassActionSearchBar from "@/components/glass-action-search-bar";
import CityWeatherCarousel from "@/components/city-weather-carousel";
import TemperatureChart from "@/components/temperature-chart";
import type { CommandItem } from "@/components/kokonutui/action-search-bar";
import { CITIES, findCityBase, type CityBase } from "@/lib/cities";
import {
  fetchCityWeather,
  geocodeToCityBase,
  searchLocations,
  type CityWeather,
  type GeocodeResult,
} from "@/lib/open-meteo";
import { useCityWeatherList } from "@/hooks/use-city-weather";

const ICON = "size-4";

function cityToCommand(city: CityBase | CityWeather): CommandItem {
  return {
    id: city.id,
    label: city.name,
    icon: <MapPin className={ICON} />,
    group: "Städte",
    keywords: [city.country.toLowerCase()],
  };
}

function geoToCommand(result: GeocodeResult): CommandItem {
  const place = result.admin1
    ? `${result.name} · ${result.admin1}`
    : `${result.name} · ${result.country}`;
  return {
    id: result.id,
    label: place,
    icon: <MapPin className={ICON} />,
    group: "Suche",
    keywords: [
      result.name.toLowerCase(),
      result.country.toLowerCase(),
      (result.admin1 ?? "").toLowerCase(),
    ],
  };
}

export default function Home() {
  const { data: presetWeather, loading, error } = useCityWeatherList(CITIES);
  const [selectedId, setSelectedId] = useState("freiburg");
  const [extraCities, setExtraCities] = useState<CityWeather[]>([]);
  const [geoResults, setGeoResults] = useState<GeocodeResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [query, setQuery] = useState("");

  const allCities = useMemo(() => {
    const map = new Map<string, CityWeather>();
    for (const c of presetWeather) map.set(c.id, c);
    for (const c of extraCities) map.set(c.id, c);
    return [...map.values()];
  }, [presetWeather, extraCities]);

  const selectedCity =
    allCities.find((c) => c.id === selectedId) ?? allCities[0] ?? null;

  const searchItems = useMemo<CommandItem[]>(() => {
    const presets = CITIES.map(cityToCommand);
    const geos = geoResults.map(geoToCommand);
    return [...presets, ...geos];
  }, [geoResults]);

  useEffect(() => {
    if (!selectedCity && presetWeather[0]) {
      setSelectedId(presetWeather[0].id);
    }
  }, [presetWeather, selectedCity]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setGeoResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const t = window.setTimeout(() => {
      void searchLocations(q)
        .then((results) => setGeoResults(results))
        .catch(() => setGeoResults([]))
        .finally(() => setSearchLoading(false));
    }, 280);
    return () => window.clearTimeout(t);
  }, [query]);

  const selectCity = useCallback((city: CityWeather) => {
    setSelectedId(city.id);
    setExtraCities((prev) => {
      if (prev.some((c) => c.id === city.id)) return prev;
      if (CITIES.some((c) => c.id === city.id)) return prev;
      return [...prev, city];
    });
  }, []);

  const handleSearchSelect = useCallback(
    async (item: CommandItem) => {
      const existing = allCities.find((c) => c.id === item.id);
      if (existing) {
        selectCity(existing);
        return;
      }

      const preset = findCityBase(item.id);
      if (preset) {
        selectCity(await fetchCityWeather(preset));
        return;
      }

      const geo = geoResults.find((g) => g.id === item.id);
      if (geo) {
        selectCity(await fetchCityWeather(geocodeToCityBase(geo)));
      }
    },
    [allCities, geoResults, selectCity],
  );

  return (
    <WeatherBackground
      weather={selectedCity?.condition ?? "clear"}
      timeOfDay={selectedCity?.timeOfDay ?? "day"}
    >
      <main className="mx-auto max-w-5xl px-4 py-8 text-white sm:px-8">
        <div className="mb-6">
          <GlassActionSearchBar
            items={searchItems}
            defaultRecent={["freiburg", "berlin", "new-york"]}
            label="Stadt suchen"
            placeholder={
              searchLoading ? "Suche Orte…" : "Stadt suchen (Open-Meteo)…"
            }
            shortcut
            onQueryChange={setQuery}
            onSelect={handleSearchSelect}
          />
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-red-300/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        )}

        <CityWeatherCarousel
          cities={allCities}
          selectedId={selectedCity?.id}
          loading={loading}
          onSelectCity={selectCity}
        />

        {selectedCity && (
          <div className="mt-6">
            <TemperatureChart city={selectedCity} />
          </div>
        )}
      </main>
    </WeatherBackground>
  );
}
