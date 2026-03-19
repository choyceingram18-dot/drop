import { useEffect, useMemo, useState } from 'react';
import { fetchWeather, searchBeautyStores } from './lib/api';
import { assessHairRisk, plannerRecommendation } from './lib/hairEngine';
import { mockForecast, mockStores, mockWeather } from './lib/mockData';
import { ApiState, BeautyStore, DayForecast, HairProfile, WeatherSnapshot } from './types';

type Tab = 'Home' | 'Planner' | 'Locator' | 'Profile';

const starterProfile: HairProfile = {
  hairType: 'natural',
  porosity: '',
  preferredStyles: ['Wash-and-go', 'Silk press', 'Wig'],
};

const styleOptions = ['Silk press', 'Wig', 'Braids', 'Loc style', 'Twist-out', 'Wash-and-go'];
const PROFILE_KEY = 'crowncast_profile';
const SAVED_STORES_KEY = 'crowncast_saved_stores';

function loadProfile(): HairProfile {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return starterProfile;

  try {
    return JSON.parse(raw) as HairProfile;
  } catch {
    return starterProfile;
  }
}

function loadSavedStoreIds(): string[] {
  const raw = localStorage.getItem(SAVED_STORES_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function App(): JSX.Element {
  const [tab, setTab] = useState<Tab>('Home');
  const [city, setCity] = useState('Atlanta');
  const [weather, setWeather] = useState<WeatherSnapshot>(mockWeather);
  const [forecast, setForecast] = useState<DayForecast[]>(mockForecast);
  const [profile, setProfile] = useState<HairProfile>(starterProfile);
  const [stores, setStores] = useState<BeautyStore[]>(mockStores);
  const [savedStoreIds, setSavedStoreIds] = useState<string[]>([]);
  const [search, setSearch] = useState('edge control');
  const [openNow, setOpenNow] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [blackOwned, setBlackOwned] = useState(false);
  const [weatherState, setWeatherState] = useState<ApiState>({ loading: false, error: '' });
  const [storesState, setStoresState] = useState<ApiState>({ loading: false, error: '' });

  useEffect(() => {
    setProfile(loadProfile());
    setSavedStoreIds(loadSavedStoreIds());
  }, []);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(SAVED_STORES_KEY, JSON.stringify(savedStoreIds));
  }, [savedStoreIds]);

  useEffect(() => {
    let cancelled = false;
    setWeatherState({ loading: true, error: '' });

    fetchWeather(city)
      .then((data) => {
        if (cancelled) return;
        setWeather(data.current);
        setForecast(data.forecast);
        setWeatherState({ loading: false, error: '' });
      })
      .catch(() => {
        if (cancelled) return;
        setWeatherState({
          loading: false,
          error: 'Live weather is unavailable right now. Showing trusted fallback data.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    let cancelled = false;
    setStoresState({ loading: true, error: '' });

    searchBeautyStores(search)
      .then((results) => {
        if (cancelled) return;
        setStores(results.length ? results : mockStores);
        setStoresState({ loading: false, error: '' });
      })
      .catch(() => {
        if (cancelled) return;
        setStoresState({
          loading: false,
          error: 'Store search is currently limited. Showing curated nearby options.',
        });
      });

    return () => {
      cancelled = true;
    };
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

  const savedStores = useMemo(
    () => filteredStores.filter((store) => savedStoreIds.includes(store.id)),
    [filteredStores, savedStoreIds],
  );

  const emergencyItems = useMemo(() => {
    if (assessment.status === 'Safe Hair Day') return ['Travel satin scarf', 'Light finishing serum'];
    if (assessment.status === 'Proceed With Caution') return ['Mini umbrella', 'Edge control pen', 'Hold spray'];
    if (assessment.status === 'High Humidity Risk') return ['Anti-humidity spray', 'Compact scarf', 'Frizz stick'];
    if (assessment.status === 'Weather Damage Likely') return ['Protective wrap', 'Waterproof hood', 'Strong hold gel'];
    return ['Braiding hair', 'Satin-lined cap', 'Scalp oil', 'Wide-tooth comb'];
  }, [assessment.status]);

  function toggleSavedStore(id: string): void {
    setSavedStoreIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function activateEmergencyMode(): void {
    setTab('Locator');
    setSearch(emergencyItems[0]?.toLowerCase() ?? 'anti-humidity spray');
  }

  function getStoreDirectionsUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

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

      <nav className="tabbar" aria-label="Primary navigation">
        {(['Home', 'Planner', 'Locator', 'Profile'] as Tab[]).map((item) => (
          <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </nav>

      <main className="content">
        {weatherState.error && <p className="service-note">{weatherState.error}</p>}
        {storesState.error && tab === 'Locator' && <p className="service-note">{storesState.error}</p>}

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
                  <strong className="emphasis">{weather.humidity}%</strong>
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
                <button className="soft-btn" onClick={activateEmergencyMode}>
                  Build emergency list
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
                  <p>
                    {day.rainChance}% rain · {day.windSpeed} mph wind
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

            {storesState.loading && <p className="service-note">Loading stores...</p>}

            {filteredStores.map((store) => (
              <article key={store.id} className="card store-card">
                <div>
                  <h3>{store.name}</h3>
                  <p>{store.address}</p>
                  <p>
                    {store.distanceKm} km · {store.rating.toFixed(1)} rating · {store.openNow ? 'Open now' : 'Closed'}
                  </p>
                </div>
                <div className="actions">
                  <a className="soft-btn link-btn" href={getStoreDirectionsUrl(store.address)} target="_blank" rel="noreferrer">
                    Get directions
                  </a>
                  {store.phone ? (
                    <a className="soft-btn link-btn" href={`tel:${store.phone}`}>
                      Call store
                    </a>
                  ) : (
                    <button className="soft-btn" disabled>
                      Call store
                    </button>
                  )}
                  <button className="soft-btn" onClick={() => toggleSavedStore(store.id)}>
                    {savedStoreIds.includes(store.id) ? 'Saved' : 'Save store'}
                  </button>
                </div>
              </article>
            ))}

            {!!savedStores.length && (
              <article className="card">
                <h3>Saved Stores</h3>
                <ul>
                  {savedStores.map((store) => (
                    <li key={`saved-${store.id}`}>{store.name}</li>
                  ))}
                </ul>
              </article>
            )}
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

      {(weatherState.loading || (tab === 'Locator' && storesState.loading)) && (
        <div className="loading-strip">Updating your forecast...</div>
      )}
    </div>
  );
}
