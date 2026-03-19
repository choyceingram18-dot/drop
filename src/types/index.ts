export type HairStatus =
  | 'Safe Hair Day'
  | 'Proceed With Caution'
  | 'High Humidity Risk'
  | 'Weather Damage Likely'
  | 'Protective Style Recommended';

export interface HairProfile {
  hairType: 'natural' | 'relaxed' | 'locs' | 'protective';
  porosity: 'low' | 'medium' | 'high' | '';
  preferredStyles: string[];
}

export interface WeatherSnapshot {
  city: string;
  temp: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  description: string;
}

export interface DayForecast {
  date: string;
  temp: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  description: string;
}

export interface HairAssessment {
  status: HairStatus;
  explanation: string;
  recommendedStyles: string[];
  avoid: string[];
  quickTip: string;
}

export interface BeautyStore {
  id: string;
  name: string;
  distanceKm: number;
  rating: number;
  openNow: boolean;
  phone?: string;
  address: string;
  blackOwned?: boolean;
}
