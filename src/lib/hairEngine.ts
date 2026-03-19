import { DayForecast, HairAssessment, HairProfile, HairStatus, WeatherSnapshot } from '../types';

const statusPriority: HairStatus[] = [
  'Safe Hair Day',
  'Proceed With Caution',
  'High Humidity Risk',
  'Weather Damage Likely',
  'Protective Style Recommended',
];

function hasStyle(profile: HairProfile, style: string): boolean {
  return profile.preferredStyles.some((s) => s.toLowerCase() === style.toLowerCase());
}

export function assessHairRisk(weather: WeatherSnapshot, profile: HairProfile): HairAssessment {
  const humid = weather.humidity;
  const rain = weather.rainChance;
  const wind = weather.windSpeed;

  let status: HairStatus = 'Safe Hair Day';
  let explanation = 'Conditions are balanced for most styles with minimal disruption risk.';
  const recommendedStyles: string[] = [];
  const avoid: string[] = [];

  if (humid >= 85 || (rain > 70 && wind > 14)) {
    status = 'Protective Style Recommended';
    explanation =
      'Moisture and exposure are high, so protective styles offer the best hold and frizz control.';
    recommendedStyles.push('Braids', 'Loc styling', 'Bun with scarf support');
    avoid.push('Silk press', 'Defined twist-out');
  } else if (humid >= 75 || rain >= 50) {
    status = 'Weather Damage Likely';
    explanation =
      'Humidity and rain elevate swelling and frizz, putting defined or heat-styled looks at risk.';
    recommendedStyles.push('Wig with secure band', 'Ponytail updo', 'Pinned protective style');
    avoid.push('Fresh press', 'Loose curls');
  } else if (humid >= 65) {
    status = 'High Humidity Risk';
    explanation = 'High humidity detected. Flat-ironed styles are at risk of reverting.';
    recommendedStyles.push('Wash-and-go with gel cast', 'Braided crown', 'Half-up protective style');
    avoid.push('Silk press without barrier spray');
  } else if (rain >= 30 || wind >= 15) {
    status = 'Proceed With Caution';
    explanation = 'Light weather stress is expected, so hold products and wraps are important.';
    recommendedStyles.push('Set curls with humidity shield', 'Clip-in updo');
    avoid.push('Glue-light wig install');
  } else {
    recommendedStyles.push('Twist-out', 'Press and wrap', 'Soft curls');
    avoid.push('No major restrictions');
  }

  if (profile.hairType === 'relaxed' || hasStyle(profile, 'silk press')) {
    if (humid >= 65) {
      status = statusPriority[Math.max(statusPriority.indexOf(status), 2)];
      explanation = 'Humidity can quickly reduce smoothness in heat-styled hair, so barrier products are essential.';
      recommendedStyles.unshift('Wrap style with anti-humidity serum');
      avoid.unshift('Loose silk press wear-down');
    }
  }

  if (profile.hairType === 'natural' && profile.porosity === 'high') {
    recommendedStyles.push('Layered sealant to lock moisture');
  }

  return {
    status,
    explanation,
    recommendedStyles: Array.from(new Set(recommendedStyles)).slice(0, 4),
    avoid: Array.from(new Set(avoid)).slice(0, 4),
    quickTip:
      humid > 70
        ? 'Carry a satin scarf and anti-humidity spray for midday touch-ups.'
        : 'Use a light sealant at the ends before stepping out for longer hold.',
  };
}

export function plannerRecommendation(day: DayForecast, profile: HairProfile): string {
  const assessment = assessHairRisk(
    {
      city: '',
      temp: day.temp,
      humidity: day.humidity,
      rainChance: day.rainChance,
      windSpeed: day.windSpeed,
      description: day.description,
    },
    profile,
  );
  return assessment.recommendedStyles[0] ?? 'Low-manipulation style';
}
