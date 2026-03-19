import { useEffect, useMemo, useState } from 'react';
import { fetchWeather, searchBeautyStores } from './lib/api';
import { assessHairRisk, plannerRecommendation } from './lib/hairEngine';
import { mockStores, mockWeather } from './lib/mockData';
import { BeautyStore, DayForecast, HairProfile, WeatherSnapshot } from './types';

type Tab = 'Home' | 'Planner' | 'Locator' | 'Profile';

const starterProfile: HairProfile = {
  hairType: 'natural',
  porosity: '',
  preferredStyles: ['Wash-and-go', 'Silk press', 'Wig'],
};

const styleOptions = ['Silk press', 'Wig', 'Braids', 'Loc style', 'Twist-out', 'Wash-and-go'];

export function App(): JSX.Element {
  const [tab, setTab] = useState<Tab>('Home');
  const [city, setCity] = useState('Atlanta');
  const [weather, setWeather] = useState<WeatherSnapshot>(mockWeather);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [profile, setProfile] = useState<HairProfile>(starterProfile);
  const [stores, setStores] = useState<BeautyStore[]>(mockStores);
  const [search, setSearch] = useState('edge control');
  const [openNow, setOpenNow] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [blackOwned, setBlackOwned] = useState(false);

  useEffect(() => {
    fetchWeather(city).then((data) => {
      setWeather(data.current);
      setForecast(data.forecast);
    });
  }, [city]);

  useEffect(() => {
    searchBeautyStores(search).then(setStores);
  }, [search]);

  const assessment = useMemo(() => assessHairRisk(weather, profile), [weather, profile]);

  const filteredStores = useMemo(
    () =>
      stores.filter((store) => {
        if (openNow && !store.openNow) return false;
        if (nearbyOnly && store.distanceKm > 2.5) return false;
        if (blackOwned && !store.blackOwned) return false;
        return true;
      }),
    [stores, openNow, nearbyOnly, blackOwned],
  );

  const emergencyItems = useMemo(() => {
    if (assessment.status === 'Safe Hair Day') return ['Travel satin scarf', 'Light finishing serum'];
    if (assessment.status === 'Proceed With Caution') return ['Mini umbrella', 'Edge control pen', 'Hold spray'];
    if (assessment.status === 'High Humidity Risk') return ['Anti-humidity spray', 'Compact scarf', 'Frizz stick'];
    if (assessment.status === 'Weather Damage Likely') return ['Protective wrap', 'Waterproof hood', 'Strong hold gel'];
    return ['Braiding hair', 'Satin-lined cap', 'Scalp oil', 'Wide-tooth comb'];
  }, [assessment.status]);

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <p className="eyebrow">CrownCast</p>
          <h1>Daily Hair Climate Intelligence</h1>
        </div>
        <label className="city-input">
          City
          <input value={city} onChange={(event) => setCity(event.target.value)} />
        </label>
      </header>

      <nav className="tabbar">
        {(['Home', 'Planner', 'Locator', 'Profile'] as Tab[]).map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'Home' && (
          <section className="stack">
            <article className="card weather-card">
              <div>
                <p className="muted">{weather.city}</p>
                <h2>{weather.temp}°</h2>
                <p>{weather.description}</p>
              </div>
              <div className="metrics">
                <div>
                  <span>Humidity</span>
                  <strong>{weather.humidity}%</strong>
                </div>
                <div>
                  <span>Rain</span>
                  <strong>{weather.rainChance}%</strong>
                </div>
                <div>
                  <span>Wind</span>
                  <strong>{weather.windSpeed} mph</strong>
                </div>
              </div>
            </article>

            <article className="card">
              <div className="row-between">
                <h3>Hair Forecast</h3>
                <span className="badge">{assessment.status}</span>
              </div>
              <p>{assessment.explanation}</p>
            </article>

            <article className="card">
              <h3>Recommended Styles</h3>
              <div className="scroll-row">
                {assessment.recommendedStyles.map((style) => (
                  <div key={style} className="mini-card">
                    <p>{style}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <h3>Avoid Today</h3>
              <ul>
                {assessment.avoid.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="tip">Quick Tip: {assessment.quickTip}</p>
            </article>

            <article className="card emergency-card">
              <div className="row-between">
                <h3>Hair Emergency</h3>
                <button className="soft-btn" onClick={() => setTab('Locator')}>
                  View Nearby Stores
                </button>
              </div>
              <p>{assessment.explanation}</p>
              <div className="pill-wrap">
                {emergencyItems.map((item) => (
                  <span key={item} className="pill">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          </section>
        )}

        {tab === 'Planner' && (
          <section className="stack">
            <h2>3-Day Style Planner</h2>
            <div className="scroll-row">
              {forecast.map((day) => (
                <article key={day.date} className="card planner-card">
                  <h3>{day.date}</h3>
                  <p>{day.description}</p>
                  <p>
                    {day.temp}° · {day.humidity}% humidity
                  </p>
                  <p className="tip">Recommended: {plannerRecommendation(day, profile)}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'Locator' && (
          <section className="stack">
            <h2>Beauty Supply Locator</h2>
            <div className="card">
              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or stores"
              />
              <div className="filters">
                <label>
                  <input type="checkbox" checked={openNow} onChange={() => setOpenNow((value) => !value)} /> Open now
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={nearbyOnly}
                    onChange={() => setNearbyOnly((value) => !value)}
                  />
                  Nearby
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={blackOwned}
                    onChange={() => setBlackOwned((value) => !value)}
                  />
                  Black-owned
                </label>
              </div>
            </div>
            {filteredStores.map((store) => (
              <article key={store.id} className="card store-card">
                <div>
                  <h3>{store.name}</h3>
                  <p>{store.address}</p>
                  <p>
                    {store.distanceKm} km · {store.rating.toFixed(1)} rating ·{' '}
                    {store.openNow ? 'Open now' : 'Closed'}
                  </p>
                </div>
                <div className="actions">
                  <button className="soft-btn">Get directions</button>
                  <button className="soft-btn">Call store</button>
                  <button className="soft-btn">Save store</button>
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === 'Profile' && (
          <section className="stack">
            <h2>Hair Profile</h2>
            <article className="card form-card">
              <label>
                Hair Type
                <select
                  value={profile.hairType}
                  onChange={(event) =>
                    setProfile((old) => ({ ...old, hairType: event.target.value as HairProfile['hairType'] }))
                  }
                >
                  <option value="natural">Natural</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="locs">Locs</option>
                  <option value="protective">Protective</option>
                </select>
              </label>

              <label>
                Porosity (optional)
                <select
                  value={profile.porosity}
                  onChange={(event) =>
                    setProfile((old) => ({ ...old, porosity: event.target.value as HairProfile['porosity'] }))
                  }
                >
                  <option value="">Not set</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <fieldset>
                <legend>Preferred Styles</legend>
                <div className="pill-wrap">
                  {styleOptions.map((style) => {
                    const selected = profile.preferredStyles.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        className={selected ? 'pill selected' : 'pill'}
                        onClick={() =>
                          setProfile((old) => ({
                            ...old,
                            preferredStyles: selected
                              ? old.preferredStyles.filter((item) => item !== style)
                              : [...old.preferredStyles, style],
                          }))
                        }
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
