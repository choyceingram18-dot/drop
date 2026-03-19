import { mockForecast, mockStores, mockWeather } from './mockData';
import { BeautyStore, DayForecast, WeatherSnapshot } from '../types';

const weatherKey = import.meta.env.OPENWEATHER_API_KEY as string | undefined;
const mapsKey = import.meta.env.GOOGLE_MAPS_API_KEY as string | undefined;

function normalizeStoreResult(results: Array<Record<string, unknown>>): BeautyStore[] {
  return results.slice(0, 10).map((place, index) => ({
    id: String(place.place_id ?? index),
    name: String(place.name ?? 'Beauty Supply Store'),
    distanceKm: Number((0.7 + index * 0.5).toFixed(1)),
    rating: Number(place.rating ?? 4.2),
    openNow: Boolean((place.opening_hours as { open_now?: boolean } | undefined)?.open_now),
    address: String(place.formatted_address ?? place.vicinity ?? 'Address unavailable'),
    blackOwned: mockStores.some((store) => store.name.toLowerCase() === String(place.name ?? '').toLowerCase()),
  }));
}

export async function fetchWeather(city: string): Promise<{ current: WeatherSnapshot; forecast: DayForecast[] }> {
  if (!weatherKey) {
    return { current: mockWeather, forecast: mockForecast };
  }

  try {
    const [currentResp, forecastResp] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${weatherKey}`,
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=imperial&appid=${weatherKey}`,
      ),
    ]);

    if (!currentResp.ok || !forecastResp.ok) {
      throw new Error('Weather request failed');
    }

    const currentData = await currentResp.json();
    const forecastData = await forecastResp.json();

    const current: WeatherSnapshot = {
      city: currentData.name,
      temp: Math.round(currentData.main.temp),
      humidity: currentData.main.humidity,
      rainChance: Math.round((currentData.rain?.['1h'] ?? 0) * 20),
      windSpeed: Math.round(currentData.wind.speed),
      description: currentData.weather?.[0]?.description ?? 'Current conditions',
    };

    const grouped = new Map<string, DayForecast>();
    for (const item of forecastData.list as Array<Record<string, unknown>>) {
      const dateText = String(item.dt_txt);
      const day = new Date(dateText).toLocaleDateString('en-US', { weekday: 'long' });
      if (grouped.has(day)) {
        continue;
      }

      const main = item.main as { temp: number; humidity: number };
      const wind = item.wind as { speed: number };
      const weather = (item.weather as Array<{ description: string }>) ?? [];
      const pop = item.pop as number | undefined;

      grouped.set(day, {
        date: day,
        temp: Math.round(main.temp),
        humidity: main.humidity,
        rainChance: Math.round((pop ?? 0) * 100),
        windSpeed: Math.round(wind.speed),
        description: weather[0]?.description ?? 'Forecast',
      });

      if (grouped.size === 3) {
        break;
      }
    }

    return { current, forecast: Array.from(grouped.values()) };
  } catch (error) {
    console.error(error);
    return { current: mockWeather, forecast: mockForecast };
  }
}

export async function searchBeautyStores(query: string): Promise<BeautyStore[]> {
  if (!mapsKey) {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
      return mockStores;
    }

    return mockStores.filter(
      (store) =>
        store.name.toLowerCase().includes(normalizedQuery) ||
        store.address.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.split(' ').some((token) => store.name.toLowerCase().includes(token)),
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        `${query || 'beauty supply'} near Atlanta`,
      )}&key=${mapsKey}`,
    );

    if (!response.ok) {
      throw new Error('Places lookup failed');
    }

    const data = await response.json();
    return normalizeStoreResult((data.results as Array<Record<string, unknown>>) ?? []);
  } catch (error) {
    console.error(error);
    return mockStores;
  }
}
