import type { RailItem } from "@/components/kokonutui/carousel-cards";
import type { CityWeather } from "@/lib/open-meteo";

export type { CityWeather } from "@/lib/open-meteo";
export type { HourlyTemp, DailyForecast } from "@/lib/open-meteo";

export function toRailItems(cities: CityWeather[]): RailItem[] {
  return cities.map((city) => ({
    id: city.id,
    title: city.name,
    location: city.country,
    image: city.image,
    imageAlt: city.name,
    scene: city.scene,
    badge: city.conditionLabel,
    dates: `Wind ${city.wind} km/h`,
    price: city.temp,
    currency: "",
    priceLabel: "°C",
  }));
}

export function findCityWeather(
  cities: CityWeather[],
  id: string,
): CityWeather | undefined {
  return cities.find((city) => city.id === id);
}
