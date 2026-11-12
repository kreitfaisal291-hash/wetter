import type { RailScene } from "@/components/kokonutui/carousel-cards";

export type CityBase = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  image: string;
  scene: RailScene;
};

/** Feste Städte mit Koordinaten + Kartenbild */
export const CITIES: CityBase[] = [
  {
    id: "freiburg",
    name: "Freiburg",
    country: "Deutschland",
    latitude: 47.999,
    longitude: 7.8421,
    image: "/weather/freiburg-muenster.jpg",
    scene: "terraces",
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Deutschland",
    latitude: 52.52,
    longitude: 13.405,
    image:
      "https://images.unsplash.com/photo-1560930950-5cc20e5be3d0?auto=format&fit=crop&w=800&q=80",
    scene: "city",
  },
  {
    id: "new-york",
    name: "New York",
    country: "USA",
    latitude: 40.7128,
    longitude: -74.006,
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    scene: "skyline",
  },
  {
    id: "miami",
    name: "Miami",
    country: "USA",
    latitude: 25.7617,
    longitude: -80.1918,
    image:
      "https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?auto=format&fit=crop&w=800&q=80",
    scene: "coast",
  },
  {
    id: "muenchen",
    name: "München",
    country: "Deutschland",
    latitude: 48.1374,
    longitude: 11.5755,
    image: "/weather/muenchen-frauenkirche.jpg",
    scene: "city",
  },
];

export function findCityBase(id: string): CityBase | undefined {
  return CITIES.find((c) => c.id === id);
}
