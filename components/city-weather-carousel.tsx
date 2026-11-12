"use client";

import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";
import CarouselCards, {
  type RailItem,
} from "@/components/kokonutui/carousel-cards";
import {
  findCityWeather,
  toRailItems,
  type CityWeather,
} from "@/lib/city-weather";

type CityWeatherCarouselProps = {
  cities: CityWeather[];
  selectedId?: string;
  loading?: boolean;
  onSelectCity: (city: CityWeather) => void;
};

function WeatherReport({ city }: { city: CityWeather }) {
  const week = city.forecast.slice(0, 7);

  return (
    <div className="rounded-3xl border border-white/25 bg-black/40 p-5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/70">{city.country}</p>
          <h3 className="text-3xl font-bold tracking-tight">{city.name}</h3>
          <p className="mt-1 text-white/85">{city.conditionLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-semibold tabular-nums">{city.temp}°</p>
          <p className="text-sm text-white/70">
            Gefühlt {city.feelsLike}° · H {city.high}° / T {city.low}°
          </p>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85">
        {city.summary}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-white/65">
            <Thermometer className="size-3.5" />
            Temperatur
          </div>
          <p className="font-semibold tabular-nums">{city.temp}°C</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-white/65">
            <Droplets className="size-3.5" />
            Luftfeuchte
          </div>
          <p className="font-semibold tabular-nums">{city.humidity}%</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-white/65">
            <Wind className="size-3.5" />
            Wind
          </div>
          <p className="font-semibold tabular-nums">{city.wind} km/h</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/60">
          7-Tage-Ausblick
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {week.map((day) => (
            <div
              key={day.date}
              className="rounded-2xl bg-white/10 px-2 py-3 text-center"
            >
              <p className="text-xs text-white/65">{day.day}</p>
              <p className="mt-1 text-sm font-semibold leading-tight">
                {day.label}
              </p>
              <p className="mt-1 text-xs tabular-nums text-white/80">
                {day.high}° / {day.low}°
              </p>
              <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-white/65">
                <Wind className="size-3" />
                {day.windMax}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white/65">
                <CloudRain className="size-3" />
                {day.precipitationSum} mm
              </p>
              <p className="mt-0.5 text-[10px] text-sky-200/80">
                {day.precipitationProbability}% Regen
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CityWeatherCarousel({
  cities,
  selectedId,
  loading,
  onSelectCity,
}: CityWeatherCarouselProps) {
  const items = toRailItems(cities);
  const selected = selectedId
    ? findCityWeather(cities, selectedId)
    : undefined;

  const handleSelect = (item: RailItem) => {
    const city = findCityWeather(cities, item.id);
    if (city) onSelectCity(city);
  };

  return (
    <div className="city-weather-rail">
      {loading && cities.length === 0 ? (
        <div className="rounded-3xl border border-white/20 bg-black/30 px-4 py-10 text-center text-white/75 backdrop-blur-md">
          Live-Wetter wird geladen…
        </div>
      ) : (
        <CarouselCards
          items={items}
          title="Wetter vor Ort"
          eyebrow="Live via Open-Meteo"
          defaultFavorites={["freiburg"]}
          onSelect={handleSelect}
          className="px-0"
        />
      )}

      {selected && (
        <div className="mt-2 px-1">
          <WeatherReport city={selected} />
        </div>
      )}
    </div>
  );
}
