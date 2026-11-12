"use client";

import { useEffect, useId, useState } from "react";
import type { CityWeather, HourlyTemp } from "@/lib/city-weather";
import type { WeatherCondition } from "@/components/weather-background";

type TemperatureChartProps = {
  city: CityWeather;
  className?: string;
};

function catmullRomPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function HourIcon({
  hour,
  isDay,
  condition,
  weatherCode,
}: {
  hour: number;
  isDay: boolean;
  condition: WeatherCondition;
  weatherCode: number;
}) {
  if (!isDay || hour >= 21 || hour < 6) return <span aria-hidden>🌙</span>;
  if (weatherCode >= 95) return <span aria-hidden>⛈️</span>;
  if (condition === "rain") return <span aria-hidden>🌧️</span>;
  if (condition === "cloudy") return <span aria-hidden>☁️</span>;
  if (hour >= 18) return <span aria-hidden>🌅</span>;
  return <span aria-hidden>☀️</span>;
}

export default function TemperatureChart({
  city,
  className = "",
}: TemperatureChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const glowId = useId().replace(/:/g, "");
  const hours: HourlyTemp[] = city.hourly;
  const nowIndex = Math.max(
    0,
    hours.findIndex((h) => h.isNow),
  );
  const [active, setActive] = useState(nowIndex);

  useEffect(() => {
    setActive(Math.max(0, hours.findIndex((h) => h.isNow)));
  }, [city.id, hours]);

  if (hours.length === 0) {
    return (
      <section
        className={`rounded-3xl border border-white/25 bg-black/40 p-5 text-white backdrop-blur-xl ${className}`}
      >
        <p className="text-white/70">Keine Stundendaten verfügbar.</p>
      </section>
    );
  }

  const width = 960;
  const height = 168;
  const padX = 24;
  const padTop = 36;
  const padBottom = 28;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  const temps = hours.map((h) => h.temp);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const range = Math.max(maxT - minT, 1);

  const points = hours.map((h, i) => ({
    x: padX + (i / Math.max(hours.length - 1, 1)) * chartW,
    y: padTop + (1 - (h.temp - minT) / range) * chartH,
  }));

  const linePath = catmullRomPath(points);
  const areaPath = `${linePath} L ${points.at(-1)!.x} ${height - 8} L ${points[0]!.x} ${height - 8} Z`;
  const activePoint = points[active];
  const activeHour = hours[active];

  return (
    <section
      className={`rounded-3xl border border-white/25 bg-black/40 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5 ${className}`}
      aria-label={`Temperaturverlauf für ${city.name}`}
    >
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/60">
            Temperaturverlauf · Live
          </p>
          <h3 className="text-lg font-semibold tracking-tight">
            24 Stunden in {city.name}
          </h3>
        </div>
        {activeHour && (
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">
              {activeHour.temp}°
            </p>
            <p className="text-xs text-white/65">
              {activeHour.isNow ? "Jetzt" : activeHour.label}
            </p>
          </div>
        )}
      </div>

      <div className="-mx-1 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[190px] w-full min-w-[720px]"
          role="img"
        >
          <defs>
            <linearGradient id={`fill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity="0" />
            </linearGradient>
            <filter id={`glow-${glowId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <line
            x1={padX}
            y1={height - 10}
            x2={width - padX}
            y2={height - 10}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />

          <path d={areaPath} fill={`url(#fill-${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${glowId})`}
          />

          {activePoint && (
            <>
              <line
                x1={activePoint.x}
                y1={padTop - 8}
                x2={activePoint.x}
                y2={height - 10}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5.5"
                fill="white"
                stroke="rgba(15,23,42,0.35)"
                strokeWidth="2"
              />
            </>
          )}

          {hours.map((hour, i) => {
            const p = points[i]!;
            const showLabel = hour.isNow || i === active || i % 3 === 0;
            return (
              <g key={`${hour.hour}-${i}`}>
                <rect
                  x={p.x - chartW / hours.length / 2}
                  y={0}
                  width={chartW / hours.length}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                />
                {showLabel && (
                  <text
                    x={p.x}
                    y={p.y - 14}
                    textAnchor="middle"
                    style={{ fontSize: 11, fontWeight: 600, fill: "white" }}
                  >
                    {hour.temp}°
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-1 flex gap-0.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hours.map((hour, i) => (
          <button
            key={`${hour.hour}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={`flex min-w-[2.6rem] shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition ${
              active === i ? "bg-white/15" : "hover:bg-white/10"
            }`}
          >
            <span className="text-[10px] font-medium text-white/70">
              {hour.isNow ? "Jetzt" : `${hour.hour}`}
            </span>
            <HourIcon
              hour={hour.hour}
              isDay={hour.isDay}
              condition={city.condition}
              weatherCode={hour.weatherCode}
            />
            <span className="text-xs font-semibold tabular-nums">
              {hour.temp}°
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
