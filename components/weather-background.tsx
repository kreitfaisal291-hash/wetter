"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

export type WeatherCondition = "clear" | "cloudy" | "rain";
export type TimeOfDay = "day" | "sunset" | "night";

type WeatherBackgroundProps = {
  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  children: ReactNode;
};

type SkyLook = {
  filter: string;
  overlay: string;
};

/**
 * Ein Foto (Sonnenuntergang) wird per Filter + Overlay
 * an Tageszeit und Wetter angepasst.
 */
const looks: Record<TimeOfDay, Record<WeatherCondition, SkyLook>> = {
  day: {
    clear: {
      filter: "brightness(1.45) contrast(1.08) saturate(0.55)",
      overlay:
        "bg-gradient-to-b from-[#4aa3e8]/75 via-[#7ec8f5]/55 to-[#d6eefc]/45",
    },
    cloudy: {
      filter: "brightness(1.1) contrast(0.95) saturate(0.25)",
      overlay: "bg-gradient-to-b from-slate-500/70 via-slate-400/55 to-slate-300/45",
    },
    rain: {
      filter: "brightness(0.8) contrast(0.9) saturate(0.2) grayscale(0.25)",
      overlay: "bg-gradient-to-b from-slate-700/70 via-slate-600/55 to-slate-500/45",
    },
  },
  sunset: {
    clear: {
      filter: "brightness(1.02) contrast(1.05) saturate(1.08)",
      overlay: "bg-transparent",
    },
    cloudy: {
      filter: "brightness(0.85) contrast(0.95) saturate(0.7)",
      overlay: "bg-slate-800/40",
    },
    rain: {
      filter: "brightness(0.65) contrast(0.9) saturate(0.45) grayscale(0.15)",
      overlay: "bg-slate-950/50",
    },
  },
  night: {
    clear: {
      filter: "brightness(0.18) contrast(1.25) saturate(0.3)",
      overlay: "bg-gradient-to-b from-[#020617]/85 via-[#0f172a]/75 to-[#1e1b4b]/55",
    },
    cloudy: {
      filter: "brightness(0.15) contrast(1.15) saturate(0.2)",
      overlay: "bg-[#020617]/85",
    },
    rain: {
      filter: "brightness(0.12) contrast(1.1) saturate(0.15) grayscale(0.35)",
      overlay: "bg-black/88",
    },
  },
};

const STAR_POSITIONS = [
  [8, 10], [18, 22], [28, 8], [38, 30], [48, 14],
  [58, 26], [68, 9], [78, 20], [88, 12], [12, 36],
  [42, 40], [72, 38], [92, 32], [22, 48], [55, 6],
] as const;

type Drop = {
  x: number;
  y: number;
  len: number;
  speed: number;
  thickness: number;
  opacity: number;
  splash: number;
};

function Stars() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden>
      {STAR_POSITIONS.map(([x, y], i) => (
        <span
          key={i}
          className="weather-star absolute rounded-full bg-white shadow-[0_0_5px_1px_rgba(255,255,255,0.5)]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: i % 5 === 0 ? 2.5 : 1.5,
            height: i % 5 === 0 ? 2.5 : 1.5,
            animationDelay: `${(i * 0.4) % 4}s`,
          }}
        />
      ))}
    </div>
  );
}

function Rain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let running = true;
    const drops: Drop[] = [];
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const makeDrop = (w: number, h: number, randomY: boolean): Drop => ({
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -Math.random() * 40,
      len: 12 + Math.random() * 18,
      speed: 10 + Math.random() * 14,
      thickness: 1 + Math.random() * 1.4,
      opacity: 0.3 + Math.random() * 0.45,
      splash: 0,
    });

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((width * height) / 8500);
      drops.length = 0;
      for (let i = 0; i < count; i++) drops.push(makeDrop(width, height, true));
    };

    const drawDrop = (d: Drop) => {
      const tipX = d.x + 1.2;
      const tipY = d.y + d.len;
      const grad = ctx.createLinearGradient(d.x, d.y, tipX, tipY);
      grad.addColorStop(0, "rgba(210, 230, 255, 0)");
      grad.addColorStop(0.4, `rgba(200, 225, 255, ${d.opacity * 0.5})`);
      grad.addColorStop(1, `rgba(235, 245, 255, ${d.opacity})`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = d.thickness;
      ctx.lineCap = "round";
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = `rgba(235, 245, 255, ${d.opacity * 0.85})`;
      ctx.ellipse(
        tipX,
        tipY,
        d.thickness * 0.9,
        d.thickness * 1.4,
        0.15,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    };

    const drawSplash = (d: Drop, groundY: number) => {
      const progress = 1 - d.splash;
      const radius = 4 + progress * 10;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(200, 225, 255, ${d.opacity * d.splash * 0.7})`;
      ctx.lineWidth = 1;
      ctx.ellipse(d.x, groundY, radius, radius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    };

    const tick = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (!reduceMotion) {
        for (const d of drops) {
          if (d.splash > 0) {
            drawSplash(d, h - 4);
            d.splash -= 0.08;
            if (d.splash <= 0) Object.assign(d, makeDrop(w, h, false));
            continue;
          }
          d.y += d.speed;
          d.x += 0.35;
          drawDrop(d);
          if (d.y > h - 8) d.splash = 1;
          else if (d.x > w + 20) Object.assign(d, makeDrop(w, h, false));
        }
      } else {
        for (const d of drops) drawDrop(d);
      }

      frame = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[3]"
      aria-hidden
    />
  );
}

export function WeatherBackground({
  weather,
  timeOfDay,
  children,
}: WeatherBackgroundProps) {
  const look = looks[timeOfDay][weather];

  const objectPosition =
    timeOfDay === "day"
      ? "center 15%"
      : timeOfDay === "sunset"
        ? "center 75%"
        : "center 35%";

  const skyStyle: CSSProperties = {
    filter: look.filter,
    objectPosition,
    transition: "filter 700ms ease, object-position 700ms ease",
  };

  const showStars = timeOfDay === "night" && weather === "clear";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/weather/sky-base.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover"
        style={skyStyle}
        draggable={false}
      />

      <div
        className={`pointer-events-none absolute inset-0 z-[1] transition-colors duration-700 ${look.overlay}`}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.28)_100%)]"
        aria-hidden
      />

      {showStars && <Stars />}
      {weather === "rain" && <Rain />}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
