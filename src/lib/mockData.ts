import { BeautyStore, DayForecast, WeatherSnapshot } from '../types';

export const mockWeather: WeatherSnapshot = {
  city: 'Atlanta',
  temp: 81,
  humidity: 78,
  rainChance: 46,
  windSpeed: 11,
  description: 'Warm with moisture in the air',
};

export const mockForecast: DayForecast[] = [
  {
    date: 'Friday',
    temp: 80,
    humidity: 76,
    rainChance: 52,
    windSpeed: 10,
    description: 'Clouds with scattered rain',
  },
  {
    date: 'Saturday',
    temp: 84,
    humidity: 68,
    rainChance: 20,
    windSpeed: 7,
    description: 'Partly sunny',
  },
  {
    date: 'Sunday',
    temp: 78,
    humidity: 61,
    rainChance: 34,
    windSpeed: 8,
    description: 'Warm and calm',
  },
];

export const mockStores: BeautyStore[] = [
  {
    id: '1',
    name: 'Melanin Beauty Supply',
    distanceKm: 1.3,
    rating: 4.8,
    openNow: true,
    phone: '(404) 555-0129',
    address: '821 Peachtree St NE',
    blackOwned: true,
  },
  {
    id: '2',
    name: 'Crown Essentials Supply',
    distanceKm: 2.1,
    rating: 4.5,
    openNow: true,
    phone: '(404) 555-0191',
    address: '220 North Ave NW',
    blackOwned: false,
  },
  {
    id: '3',
    name: 'Her Texture Depot',
    distanceKm: 3.9,
    rating: 4.6,
    openNow: false,
    phone: '(404) 555-0167',
    address: '990 Glenwood Ave',
    blackOwned: true,
  },
  {
    id: '4',
    name: 'Silk Press Beauty Market',
    distanceKm: 4.7,
    rating: 4.4,
    openNow: true,
    phone: '(404) 555-0113',
    address: '77 Moreland Ave',
    blackOwned: false,
  },
];
