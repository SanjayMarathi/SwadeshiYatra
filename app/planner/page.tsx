'use client';

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { TouristPlace, TripPreferences, FeasibilityResult, ItineraryItem, User } from '@/types';
import { CityPlannerData } from '@/lib/gemini';

// ─── Helpers ─────────────────────────────────────────────────────────────────

type GuideOption = { id: string; name: string; city: string; pricePerDay: number; expertise: string };

const stableImage = (place: string, city: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(`${place}-${city}`)}/800/400`;

const googlePhotos = (place: string, city: string) =>
  `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${place} ${city} India`)}`;

const googleMap = (place: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, ${city}, India`)}`;

const INDIAN_CITIES = [
  'Agra', 'Ahmedabad', 'Amritsar', 'Aurangabad', 'Bengaluru', 'Bhopal', 'Bhubaneswar', 'Chandigarh',
  'Chennai', 'Coimbatore', 'Darjeeling', 'Dehradun', 'Delhi', 'Gangtok', 'Goa', 'Guwahati', 'Gwalior',
  'Hyderabad', 'Indore', 'Jaipur', 'Jaisalmer', 'Jammu', 'Jodhpur', 'Kochi', 'Kolkata', 'Leh', 'Lucknow',
  'Madurai', 'Manali', 'Mangalore', 'Mumbai', 'Munnar', 'Mysuru', 'Nagpur', 'Nainital', 'Nashik', 'Pondicherry',
  'Pune', 'Rishikesh', 'Shimla', 'Srinagar', 'Surat', 'Thiruvananthapuram', 'Udaipur', 'Varanasi', 'Vijayawada', 'Visakhapatnam',
];

// ─── API helpers (server-side routes) ────────────────────────────────────────

async function fetchPlaces(city: string): Promise<TouristPlace[]> {
  const res = await fetch(`/api/places?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`Places API error: ${res.status}`);
  const { places } = await res.json();
  return places;
}

async function fetchCityGuide(city: string): Promise<CityPlannerData> {
  const res = await fetch(`/api/city-guide?city=${encodeURIComponent(city)}`);
  if (!res.ok) throw new Error(`City guide API error: ${res.status}`);
  const { data } = await res.json();
  return data;
}

async function fetchPlan(preferences: {
  budget: number; durationDays: number; cities: string[]; places: Pick<TouristPlace, 'name'>[];
  originCountry: string; foodPreference: string; travelPreference: string;
}): Promise<{ feasibility: FeasibilityResult; itinerary: ItineraryItem[] }> {
  const res = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error(`Plan API error: ${res.status}`);
  return res.json();
}

// ─── City Planner ────────────────────────────────────────────────────────────

function CityPlannerMode({ initialCity }: { initialCity: string }) {
  const [cityInput, setCityInput] = useState(initialCity);
  const [selectedCity, setSelectedCity] = useState('');
  const [cityData, setCityData] = useState<CityPlannerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCity = async (city: string) => {
    if (!city.trim()) return;
    setLoading(true); setError(''); setCityData(null); setSelectedCity(city.trim());
    try {
      const data = await fetchCityGuide(city.trim());
      setCityData(data);
    } catch (e) {
      console.error(e);
      setError('Could not load city data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (initialCity) loadCity(initialCity); }, []); // eslint-disable-line

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-orange-100">
        <h2 className="text-2xl font-black text-red-700 mb-1">City Deep Dive</h2>
        <p className="text-gray-600 text-sm mb-4">Select any Indian city to get a complete AI-powered travel guide with real attractions, entry fees, visiting hours, and budget tips.</p>
        <div className="flex flex-wrap gap-3">
          <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadCity(cityInput)}
            placeholder="Type city name (e.g. Jaipur, Varanasi, Goa)"
            className="flex-1 min-w-[220px] p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            list="cp-city-list" />
          <datalist id="cp-city-list">{INDIAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
          <button onClick={() => loadCity(cityInput)} disabled={loading}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-7 py-3 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition">
            {loading ? 'Loading AI Guide...' : 'Get City Guide'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {['Jaipur', 'Varanasi', 'Mumbai', 'Delhi', 'Goa', 'Agra', 'Udaipur', 'Kochi'].map((c) => (
            <button key={c} onClick={() => { setCityInput(c); loadCity(c); }}
              className="px-3 py-1 rounded-full bg-yellow-100 hover:bg-yellow-200 text-red-800 text-sm font-semibold transition">
              {c}
            </button>
          ))}
        </div>
        {error && <p className="text-red-600 font-semibold mt-3">⚠ {error}</p>}
      </div>

      {loading && (
        <div className="rounded-2xl bg-white p-12 shadow-sm border border-orange-100 text-center">
          <div className="text-5xl mb-4 animate-bounce">🤖</div>
          <p className="text-xl font-bold text-red-700">Gemini AI is generating your city guide...</p>
          <p className="text-gray-500 text-sm mt-2">Getting real attractions, fees, hours and tips for {selectedCity}</p>
        </div>
      )}

      {cityData && !loading && (
        <div className="space-y-6">
          {/* Overview banner */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 p-6 text-white shadow-md">
            <h2 className="text-3xl font-black mb-2">{selectedCity} — Complete Travel Guide</h2>
            <p className="text-white/90 mb-4">{cityData.cityOverview}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                { label: 'Best Time', val: cityData.bestTimeToVisit },
                { label: 'How to Reach', val: cityData.howToReach },
                { label: 'Local Transport', val: cityData.localTransport },
                { label: 'Budget/Day', val: cityData.totalBudgetEstimate },
              ].map((item) => (
                <div key={item.label} className="bg-white/20 rounded-xl p-3">
                  <p className="text-white/70 text-xs font-bold uppercase mb-1">{item.label}</p>
                  <p className="font-semibold text-sm">{item.val}</p>
                </div>
              ))}
            </div>
            {cityData.culturalTips?.length > 0 && (
              <div className="mt-4 bg-white/15 rounded-xl p-4">
                <p className="font-bold text-sm mb-2">💡 Cultural Tips</p>
                <ol className="space-y-1 text-sm text-white/90">
                  {cityData.culturalTips.map((tip, i) => <li key={i}>{i + 1}. {tip}</li>)}
                </ol>
              </div>
            )}
          </div>

          {/* Attraction cards */}
          <div>
            <h3 className="text-2xl font-black text-red-700 mb-4">Top Attractions in {selectedCity}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(cityData.attractions || []).map((attr, i) => (
                <div key={i} className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                  <div className="relative w-full h-48">
                    <Image src={stableImage(attr.name, selectedCity)} alt={attr.name} fill className="object-cover" unoptimized />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">{attr.type}</div>
                    <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-black px-2 py-1 rounded-full">★ {attr.rating} · {attr.fameScore}/10</div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-2">
                      <h4 className="text-white font-black text-lg">{attr.name}</h4>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-700 text-sm mb-3">{attr.description}</p>

                    {/* Highlights */}
                    {attr.highlights?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-orange-600 uppercase mb-2">Highlights</p>
                        <ol className="space-y-1">
                          {attr.highlights.map((h, hi) => (
                            <li key={hi} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-red-500 font-bold shrink-0">{hi + 1}.</span>{h}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Visit info */}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-orange-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Visiting Hours</p>
                        <p className="font-semibold text-gray-800">{attr.visitingHours}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Time Needed</p>
                        <p className="font-semibold text-gray-800">{attr.timeNeeded}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Best Season</p>
                        <p className="font-semibold text-gray-800">{attr.bestSeason}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                        <p className="text-xs text-gray-500">Entry Fee (Adult/Child/Foreign)</p>
                        <p className="font-bold text-red-700">₹{attr.entryFeeAdult} / ₹{attr.entryFeeChild} / ₹{attr.entryFeeForeign}</p>
                      </div>
                    </div>

                    {attr.tips?.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-bold text-orange-600 uppercase mb-1">Tips</p>
                        {attr.tips.map((t, ti) => <p key={ti} className="text-sm text-gray-700">• {t}</p>)}
                      </div>
                    )}

                    {attr.nearbyAttractions?.length > 0 && (
                      <p className="text-xs text-gray-600 mb-3"><span className="font-bold text-orange-600">Nearby: </span>{attr.nearbyAttractions.join(', ')}</p>
                    )}

                    <div className="flex gap-4 text-sm">
                      <a href={googlePhotos(attr.name, selectedCity)} target="_blank" rel="noreferrer" className="text-red-700 font-semibold underline">Google Photos</a>
                      <a href={googleMap(attr.name, selectedCity)} target="_blank" rel="noreferrer" className="text-red-700 font-semibold underline">Google Maps</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Journey Planner ─────────────────────────────────────────────────────────

function JourneyPlannerMode() {
  const [step, setStep] = useState(1);
  const [cityInput, setCityInput] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cityPlaces, setCityPlaces] = useState<Record<string, TouristPlace[]>>({});
  const [selectedPlaces, setSelectedPlaces] = useState<TouristPlace[]>([]);
  const [guideMap, setGuideMap] = useState<Record<string, GuideOption[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGuides, setSelectedGuides] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState<TripPreferences>({
    budget: 30000, durationDays: 5, cities: [], places: [], originCountry: 'India', foodPreference: 'BOTH', travelPreference: 'BOTH',
  });
  const [feasibility, setFeasibility] = useState<FeasibilityResult | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [interestsInput, setInterestsInput] = useState('history, food, architecture');
  const [guideRequests, setGuideRequests] = useState<Record<string, boolean>>({});

  const loadGuides = async (cities: string[]) => {
    if (!cities.length) { setGuideMap({}); return; }
    try {
      const q = cities.map((c) => `city=${encodeURIComponent(c)}`).join('&');
      const res = await fetch(`/api/guides?${q}`, { cache: 'no-store' });
      if (!res.ok) { setGuideMap({}); return; }
      const { guides } = (await res.json()) as { guides: User[] };
      const byCity: Record<string, GuideOption[]> = {};
      guides.forEach((g) => {
        const key = g.location || '';
        if (!byCity[key]) byCity[key] = [];
        byCity[key].push({ id: g.id, name: g.name, city: key, pricePerDay: g.price || 0, expertise: g.expertise || 'City Tour' });
      });
      setGuideMap(byCity);
    } catch { setGuideMap({}); }
  };

  const addCity = async (raw: string) => {
    const city = raw.trim();
    if (!city || selectedCities.includes(city)) { setCityInput(''); return; }
    setError(''); setLoading(true);
    try {
      const places = await fetchPlaces(city);
      const next = [...selectedCities, city];
      setCityPlaces((p) => ({ ...p, [city]: places }));
      if (places.length > 0) {
        const top = [...places].sort((a, b) => b.fameScore - a.fameScore || b.rating - a.rating)[0];
        setSelectedPlaces((prev) => prev.find((p) => p.name === top.name && p.city === top.city) ? prev : [...prev, top]);
      }
      setSelectedCities(next);
      await loadGuides(next);
      setCityInput('');
    } catch { setError('Could not load city data. Please try again.'); }
    finally { setLoading(false); }
  };

  const togglePlace = (place: TouristPlace) => {
    if (selectedPlaces.find((p) => p.name === place.name && p.city === place.city))
      setSelectedPlaces(selectedPlaces.filter((p) => !(p.name === place.name && p.city === place.city)));
    else setSelectedPlaces([...selectedPlaces, place]);
  };

  const removeCity = (city: string) => {
    const next = selectedCities.filter((c) => c !== city);
    setSelectedCities(next);
    setSelectedPlaces((p) => p.filter((x) => x.city !== city));
    setSelectedGuides((p) => { const n = { ...p }; delete n[city]; return n; });
    loadGuides(next);
  };

  const handleGeneratePlan = async () => {
    if (!selectedCities.length || !selectedPlaces.length) { setError('Please select at least one city and one place.'); return; }
    setLoading(true); setError('');
    try {
      const { feasibility: feas, itinerary: plan } = await fetchPlan({
        ...preferences, cities: selectedCities, places: selectedPlaces,
      });
      const normalized = plan.map((item) => {
        const guideId = selectedGuides[item.city];
        const guide = Object.values(guideMap).flat().find((g) => g.id === guideId);
        const entryFee = item.entryFee ?? 300;
        const transportCost = item.transportCost ?? (selectedCities.length > 1 ? 1500 : 500);
        const guideFee = item.guideFee ?? guide?.pricePerDay ?? 0;
        return {
          ...item,
          routeFrom: item.routeFrom ?? 'Previous Stop',
          routeTo: item.routeTo ?? item.city,
          suggestedGuide: guide ? `${guide.name} — ₹${guide.pricePerDay}/day` : item.suggestedGuide,
          entryFee, transportCost, guideFee,
          totalCost: item.totalCost ?? entryFee + transportCost + guideFee,
          imageUrl: item.imageUrl || stableImage(item.place, item.city),
          highlights: item.highlights?.length ? item.highlights : [
            `1. Reach ${item.place} via ${item.transport || 'local transport'}.`,
            '2. Collect entry tickets at the gate.',
            '3. Explore main highlights — allow 2 hours.',
            '4. Visit the best photo spots.',
            '5. Proceed to next stop on schedule.',
          ],
        };
      });
      const total = normalized.reduce((s, it) => s + (it.totalCost ?? 0), 0);
      setFeasibility(feas ?? { isPossible: total <= preferences.budget, reason: total <= preferences.budget ? 'Route feasible.' : 'Exceeds budget.', estimatedCost: total, estimatedTime: normalized.length * 3 });
      setItinerary(normalized);
      setStep(3);
    } catch { setError('Unable to generate plan. Please retry.'); }
    finally { setLoading(false); }
  };

  const quickCities = INDIAN_CITIES.filter((c) => c.toLowerCase().includes(cityInput.toLowerCase()) && !selectedCities.includes(c)).slice(0, 12);
  const totalGuideCost = Object.entries(selectedGuides).reduce((s, [city, id]) => { const g = (guideMap[city] ?? []).find((x) => x.id === id); return s + (g?.pricePerDay ?? 0); }, 0);
  const totalRouteCost = itinerary.reduce((s, it) => s + (it.totalCost ?? 0), 0);
  const routeMapLink = useMemo(() => {
    if (selectedCities.length < 2) return '';
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(selectedCities[0])}&destination=${encodeURIComponent(selectedCities[selectedCities.length - 1])}&waypoints=${encodeURIComponent(selectedCities.slice(1, -1).join('|'))}&travelmode=driving`;
  }, [selectedCities]);

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex justify-between gap-3">
        {['Cities & Places', 'Budget & Guides', 'Route & Expenses'].map((label, idx) => {
          const s = idx + 1;
          return (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= s ? 'bg-red-600 text-white' : 'bg-yellow-100 text-orange-400'}`}>{s}</div>
              <span className={`text-sm text-center ${step >= s ? 'text-red-700 font-semibold' : 'text-orange-400'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm border border-orange-100">
          <div className="flex flex-wrap gap-3">
            <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCity(cityInput)}
              placeholder="Type city name (e.g. Mumbai, Varanasi, Jaipur)"
              className="flex-1 min-w-[220px] p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              list="jp-city-list" />
            <datalist id="jp-city-list">{INDIAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
            <button onClick={() => addCity(cityInput)} disabled={loading}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition">
              {loading ? 'Loading...' : 'Add City'}
            </button>
          </div>

          {quickCities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickCities.map((c) => (
                <button key={c} onClick={() => addCity(c)} className="px-3 py-1 rounded-full bg-yellow-100 hover:bg-yellow-200 text-red-800 text-sm font-semibold">{c}</button>
              ))}
            </div>
          )}

          {selectedCities.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedCities.map((city) => (
                <span key={city} className="bg-orange-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                  {city}
                  <button onClick={() => removeCity(city)} className="hover:text-black text-lg leading-none">×</button>
                </span>
              ))}
            </div>
          )}

          {selectedCities.map((city) => (
            <div key={city} className="bg-white rounded-xl border border-orange-100 p-4">
              <h3 className="font-black text-xl text-red-700 mb-3">{city} Attractions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(cityPlaces[city] ?? []).map((place) => {
                  const isSel = !!selectedPlaces.find((p) => p.name === place.name && p.city === place.city);
                  return (
                    <button type="button" key={place.id}
                      className={`text-left p-4 border rounded-xl transition ${isSel ? 'border-red-500 bg-yellow-50' : 'border-orange-100 hover:border-orange-400'}`}
                      onClick={() => togglePlace(place)}>
                      <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden">
                        <Image src={stableImage(place.name, city)} alt={place.name} fill className="object-cover" unoptimized />
                        {isSel && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center"><span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black">✓</span></div>}
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-800">{place.name}</h4>
                        <span className="text-yellow-500 font-black shrink-0">★ {place.rating}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{place.description}</p>
                      <div className="flex gap-2 text-xs flex-wrap mb-2">
                        <span className="bg-orange-100 px-2 py-1 rounded">Fame: {place.fameScore}/10</span>
                        <span className="bg-orange-100 px-2 py-1 rounded">{place.bestTime}</span>
                        <span className="bg-orange-100 px-2 py-1 rounded">{place.type}</span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <a href={googlePhotos(place.name, city)} target="_blank" rel="noreferrer" className="underline text-red-700 font-semibold" onClick={(e) => e.stopPropagation()}>Google Photos</a>
                        <a href={googleMap(place.name, city)} target="_blank" rel="noreferrer" className="underline text-red-700 font-semibold" onClick={(e) => e.stopPropagation()}>Google Maps</a>
                      </div>
                    </button>
                  );
                })}
                {!(cityPlaces[city] ?? []).length && <p className="text-sm text-gray-500 col-span-2">No places loaded. Click Add City again to retry.</p>}
              </div>
            </div>
          ))}

          {error && <p className="text-red-600 font-semibold">{error}</p>}

          {selectedCities.length > 0 && (
            <div className="flex justify-center mt-4">
              <button onClick={() => {
                if (!selectedCities.length) { setError('Add at least one city.'); return; }
                if (!selectedPlaces.length) {
                  const auto = selectedCities.flatMap((c) => cityPlaces[c] ?? []).slice(0, 3);
                  if (!auto.length) { setError('No places found. Retry adding city.'); return; }
                  setSelectedPlaces(auto);
                }
                setStep(2);
              }} className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-3 rounded-full font-bold hover:from-red-700 hover:to-orange-700 transition shadow-lg">
                Next: Budget & Guides ({selectedPlaces.length} places)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm border border-orange-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Total Budget (₹ INR)', key: 'budget', type: 'number', min: 1000 },
              { label: 'Trip Duration (Days)', key: 'durationDays', type: 'number', min: 1 },
            ].map(({ label, key, type, min }) => (
              <div key={key}>
                <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
                 <input type={type} min={min} value={(preferences as unknown as Record<string, unknown>)[key] as number}
                  onChange={(e) => setPreferences((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Country of Origin</label>
              <input type="text" value={preferences.originCountry}
                onChange={(e) => setPreferences((p) => ({ ...p, originCountry: e.target.value }))}
                className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Travel Mode</label>
              <select value={preferences.travelPreference}
                onChange={(e) => setPreferences((p) => ({ ...p, travelPreference: e.target.value as TripPreferences['travelPreference'] }))}
                className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none">
                <option value="PUBLIC">Public (Bus / Train / Auto)</option>
                <option value="PRIVATE">Private Taxi / Car</option>
                <option value="BOTH">Mixed</option>
              </select>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:col-span-2">
              <p className="font-bold text-red-700">Trip Summary</p>
              <p className="text-sm text-gray-700 mt-1">{preferences.originCountry} → {selectedCities.join(' → ')} · {selectedPlaces.length} places · Guide daily total: ₹{totalGuideCost.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Trip Pace</label>
              <select
                value={preferences.tripPace}
                onChange={(e) => setPreferences({ ...preferences, tripPace: e.target.value as TripPreferences['tripPace'] })}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="RELAXED">Relaxed</option>
                <option value="BALANCED">Balanced</option>
                <option value="FAST">Fast</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Stay Preference</label>
              <select
                value={preferences.accommodationPreference}
                onChange={(e) => setPreferences({ ...preferences, accommodationPreference: e.target.value as TripPreferences['accommodationPreference'] })}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="BUDGET">Budget</option>
                <option value="COMFORT">Comfort</option>
                <option value="LUXURY">Luxury</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-orange-900">Interests (comma separated)</label>
              <input
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="history, local food, nature, architecture"
              />
            </div>
            <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-orange-200 bg-white/90 px-4 py-3">
              <input
                type="checkbox"
                checked={preferences.requireGuide}
                onChange={(e) => setPreferences({ ...preferences, requireGuide: e.target.checked })}
              />
              <span className="text-sm font-semibold text-orange-900">I want guide assistance during the trip</span>
            </label>
          </div>

          <div>
            <h3 className="text-xl font-black text-red-700 mb-3">Select Guide by City (Optional)</h3>
            {selectedCities.map((city) => {
              const guides = guideMap[city] ?? [];
              return (
                <div key={city} className="border border-orange-200 rounded-xl p-4 mb-4">
                  <h4 className="font-bold mb-2 text-red-700">{city}</h4>
                  {guides.length === 0 ? <p className="text-sm text-gray-500">No registered guides for {city} yet.</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {guides.map((g) => (
                        <button type="button" key={g.id}
                          onClick={() => setSelectedGuides((p) => ({ ...p, [city]: p[city] === g.id ? '' : g.id }))}
                          className={`text-left border rounded-lg p-3 transition ${selectedGuides[city] === g.id ? 'border-red-500 bg-yellow-50' : 'border-orange-200 hover:border-orange-400'}`}>
                          <p className="font-bold">{g.name}</p>
                          <p className="text-sm text-gray-700">{g.expertise}</p>
                          <p className="text-sm text-red-700 font-semibold mt-1">₹{g.pricePerDay.toLocaleString('en-IN')} / day</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && <p className="text-red-600 font-semibold">{error}</p>}

          <div className="flex gap-4 justify-center">
            <button onClick={() => setStep(1)} className="px-8 py-3 border border-orange-300 rounded-full font-bold hover:bg-orange-50 transition">Back</button>
            <button onClick={handleGeneratePlan} disabled={loading}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-10 py-3 rounded-full font-bold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition shadow-lg">
              {loading ? '🤖 Gemini AI is Planning...' : 'Generate AI Journey Plan'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm border border-orange-100">
          {!itinerary.length && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-gray-700">No route yet. Go to Step 2 and click Generate.</div>}

          {feasibility && (
            <div className={`p-6 rounded-xl border-l-8 ${feasibility.isPossible ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <h2 className="text-2xl font-bold mb-2">{feasibility.isPossible ? '✅ Trip is Feasible' : '⚠️ Needs Optimization'}</h2>
              <p className="text-gray-700 mb-4">{feasibility.reason}</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'AI Estimated Cost', val: `₹${feasibility.estimatedCost.toLocaleString('en-IN')}` },
                  { label: 'Hours Required', val: `${feasibility.estimatedTime}h` },
                  { label: 'Route Total', val: `₹${totalRouteCost.toLocaleString('en-IN')}` },
                ].map((x) => (
                  <div key={x.label} className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">{x.label}</p>
                    <p className="text-2xl font-black text-red-700 mt-1">{x.val}</p>
                  </div>
                ))}
              </div>
              {feasibility.suggestions?.length && (
                <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                  {feasibility.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              )}
            </div>
          )}

          {selectedCities.length > 1 && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-red-700">Route Map</h2>
              <div className="rounded-xl overflow-hidden border border-orange-100">
                <iframe title="route-map" src={`https://www.google.com/maps?q=${encodeURIComponent(selectedCities.join(' to '))}&output=embed`} className="w-full h-[280px]" />
              </div>
              {routeMapLink && <a href={routeMapLink} target="_blank" rel="noreferrer" className="inline-block text-red-700 underline font-semibold text-sm">Open full route in Google Maps →</a>}
            </div>
          )}

          {itinerary.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-center text-red-700">Complete Route Plan</h2>
              {itinerary.map((item, idx) => (
                <div key={idx} className="bg-white border border-orange-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="relative w-full h-48">
                    <Image src={item.imageUrl || stableImage(item.place, item.city)} alt={item.place} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <p className="text-xl font-black">{item.place}</p>
                      <p className="text-sm opacity-90">Day {item.day} · {item.time} · {item.city}</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-sm font-black px-3 py-1 rounded-full">
                      ₹{(item.totalCost ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-700 mb-4">{item.activity}</p>
                    {(item.highlights ?? []).length > 0 && (
                      <div className="mb-4 bg-orange-50 rounded-xl p-4">
                        <p className="font-bold text-red-700 text-sm uppercase mb-2">📋 Step-by-Step Activity</p>
                        <ol className="space-y-2">
                          {(item.highlights ?? []).map((point, pi) => (
                            <li key={pi} className="flex gap-2 text-sm text-gray-800">
                              <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{pi + 1}</span>
                              <span>{point.replace(/^\d+\.\s*/, '')}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="bg-orange-50 rounded-lg p-2"><p className="text-xs text-gray-500">Route</p><p className="font-semibold">{item.routeFrom} → {item.routeTo}</p></div>
                      <div className="bg-orange-50 rounded-lg p-2"><p className="text-xs text-gray-500">Transport</p><p className="font-semibold">{item.transport}</p></div>
                      <div className="bg-orange-50 rounded-lg p-2"><p className="text-xs text-gray-500">Guide</p><p className="font-semibold">{item.suggestedGuide ?? 'Not selected'}</p></div>
                      <div className="bg-red-50 rounded-lg p-2 border border-red-100"><p className="text-xs text-gray-500">Entry Fee</p><p className="font-bold text-red-700">₹{(item.entryFee ?? 0).toLocaleString('en-IN')}</p></div>
                      <div className="bg-red-50 rounded-lg p-2 border border-red-100"><p className="text-xs text-gray-500">Transport</p><p className="font-bold text-red-700">₹{(item.transportCost ?? 0).toLocaleString('en-IN')}</p></div>
                      <div className="bg-red-50 rounded-lg p-2 border border-red-100"><p className="text-xs text-gray-500">Guide Fee</p><p className="font-bold text-red-700">₹{(item.guideFee ?? 0).toLocaleString('en-IN')}</p></div>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm justify-between items-center">
                      <div className="flex gap-4">
                        <a href={googlePhotos(item.place, item.city)} target="_blank" rel="noreferrer" className="underline text-red-700 font-semibold">Google Photos</a>
                        <a href={googleMap(item.place, item.city)} target="_blank" rel="noreferrer" className="underline text-red-700 font-semibold">Google Maps</a>
                      </div>
                      <p className="font-black text-lg text-red-700">₹{(item.totalCost ?? 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-6 text-center">
                <p className="text-lg font-bold opacity-80">Complete Journey Cost</p>
                <p className="text-4xl font-black mt-1">₹{totalRouteCost.toLocaleString('en-IN')}</p>
                <p className="text-sm opacity-80 mt-1">{itinerary.length} stops · {selectedCities.length} cities · {preferences.durationDays} days · Excludes accommodation & meals</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center mt-6">
            <button onClick={() => setStep(2)} className="px-8 py-3 border border-orange-300 rounded-full font-bold hover:bg-orange-50 transition">Back</button>
            <button onClick={() => { setStep(1); setItinerary([]); setFeasibility(null); setSelectedCities([]); setSelectedPlaces([]); setSelectedGuides({}); setCityPlaces({}); }}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-10 py-3 rounded-full font-bold hover:from-red-700 hover:to-orange-700 transition shadow-lg">
              New Journey Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function PlannerContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'city';
  const initialCity = searchParams.get('city') || '';
  const [activeMode, setActiveMode] = useState<'city' | 'journey'>(mode === 'journey' ? 'journey' : 'city');

  return (
    <div className="max-w-6xl mx-auto py-8 text-orange-950">
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 p-8 text-white mb-8 shadow-md">
        <h1 className="text-4xl md:text-5xl font-black text-center">SwadeshiYatra Planner</h1>
        <p className="text-center mt-2 text-white/90">AI-powered travel planning for India — powered by Gemini</p>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setActiveMode('city')}
            className={`px-6 py-3 rounded-full font-bold transition ${activeMode === 'city' ? 'bg-white text-red-600' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            🏛️ City Planner
          </button>
          <button onClick={() => setActiveMode('journey')}
            className={`px-6 py-3 rounded-full font-bold transition ${activeMode === 'journey' ? 'bg-white text-red-600' : 'bg-white/20 text-white hover:bg-white/30'}`}>
            🗺️ Journey Planner
          </button>
        </div>
      </div>
      {activeMode === 'city' && <CityPlannerMode key={initialCity} initialCity={initialCity} />}
      {activeMode === 'journey' && <JourneyPlannerMode />}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] text-center">
        <div>
          <div className="text-5xl animate-bounce mb-4">🇮🇳</div>
          <p className="text-xl font-bold text-red-700">Loading planner...</p>
        </div>
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
