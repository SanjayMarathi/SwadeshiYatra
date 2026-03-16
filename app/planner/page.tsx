'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TouristPlace, TripPreferences, FeasibilityResult, ItineraryItem } from '@/types';
import { getTouristPlaces, analyzeFeasibility, generateItinerary } from '@/lib/gemini';

const getPlaceImageUrl = (placeName: string, city: string) =>
  `https://source.unsplash.com/900x600/?${encodeURIComponent(`${placeName},${city},india,travel`)}`;

const PlannerPage = () => {
  const [step, setStep] = useState(1);
  const [cityInput, setCityInput] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [suggestedPlaces, setSuggestedPlaces] = useState<TouristPlace[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<TouristPlace[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState<TripPreferences>({
    budget: 10000,
    durationDays: 3,
    cities: [],
    places: [],
    startCity: '',
    numberOfTravelers: 1,
    tripPace: 'BALANCED',
    accommodationPreference: 'COMFORT',
    interests: [],
    requireGuide: false,
    foodPreference: 'BOTH',
    travelPreference: 'BOTH',
  });

  const [feasibility, setFeasibility] = useState<FeasibilityResult | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [interestsInput, setInterestsInput] = useState('history, food, architecture');
  const [guideRequests, setGuideRequests] = useState<Record<string, boolean>>({});

  const searchCity = async () => {
    if (!cityInput) return;
    setLoading(true);
    const places = await getTouristPlaces(cityInput);
    setSuggestedPlaces(
      places.map((place, index) => ({
        ...place,
        id: `${cityInput}-${index}-${place.name}`,
        city: cityInput,
        imageUrl: place.imageUrl || getPlaceImageUrl(place.name, cityInput),
      }))
    );
    if (!selectedCities.includes(cityInput)) {
      setSelectedCities([...selectedCities, cityInput]);
    }
    setLoading(false);
  };

  const togglePlace = (place: TouristPlace) => {
    if (selectedPlaces.find(p => p.name === place.name && p.city === place.city)) {
      setSelectedPlaces(selectedPlaces.filter(p => !(p.name === place.name && p.city === place.city)));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const handleFeasibilityCheck = async () => {
    setLoading(true);
    const data = {
      ...preferences,
      cities: selectedCities,
      places: selectedPlaces,
      interests: interestsInput.split(',').map((item) => item.trim()).filter(Boolean),
      startCity: preferences.startCity || selectedCities[0] || '',
    };
    const result = await analyzeFeasibility(data);
    setFeasibility(result);
    if (result?.isPossible) {
      const plan = await generateItinerary(data);
      setItinerary(plan);
    }
    setLoading(false);
    setStep(3);
  };

  const hireGuide = (key: string) => {
    setGuideRequests((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="relative mx-auto max-w-5xl py-8">
      <div className="pointer-events-none absolute -left-10 top-10 h-36 w-36 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-20 h-36 w-36 rounded-full bg-orange-300/25 blur-3xl" />
      <h1 className="mb-8 text-center text-4xl font-bold text-gradient md:text-5xl">SwadeshiYatra Planner</h1>
      
      {/* Step Indicators */}
      <div className="theme-card mb-12 flex justify-between rounded-2xl p-4 md:p-5">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex flex-col items-center flex-1`}>
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full font-bold ${step >= s ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md' : 'bg-slate-200 text-slate-500'}`}>
              {s}
            </div>
            <span className={`text-sm ${step >= s ? 'font-semibold text-orange-700' : 'text-slate-400'}`}>
              {s === 1 ? 'Search Cities' : s === 2 ? 'Preferences' : 'Final Plan'}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="theme-card space-y-6 rounded-3xl p-6 animate-fadeIn md:p-8">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter city name (e.g. Mumbai, Bangalore)"
              className="flex-1 rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              onKeyPress={(e) => e.key === 'Enter' && searchCity()}
            />
            <button 
              onClick={searchCity} 
              disabled={loading}
              className="theme-button rounded-xl px-6 py-2 font-semibold disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {selectedCities.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedCities.map(city => (
                <span key={city} className="theme-pill flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-orange-900">
                  {city}
                  <button onClick={() => setSelectedCities(selectedCities.filter(c => c !== city))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          )}

          {suggestedPlaces.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedPlaces.map((place) => {
                const isSelected = selectedPlaces.find(p => p.name === place.name && p.city === place.city);
                return (
                  <div 
                    key={place.id} 
                    className={`hover-lift cursor-pointer rounded-2xl border p-4 transition ${isSelected ? 'border-orange-400 bg-orange-50/70' : 'border-orange-100 bg-white/80'}`}
                    onClick={() => togglePlace(place)}
                  >
                    <Image
                      src={place.imageUrl || getPlaceImageUrl(place.name, place.city)}
                      alt={place.name}
                      width={900}
                      height={600}
                      className="mb-3 h-40 w-full rounded-xl object-cover"
                    />
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{place.name}</h3>
                      <span className="font-bold text-amber-500">★ {place.rating}</span>
                    </div>
                    <p className="mb-2 text-sm text-slate-600">{place.description}</p>
                    {place.historyInfo && <p className="mb-2 text-sm text-slate-500">{place.historyInfo}</p>}
                    <div className="flex gap-2 text-xs">
                      <span className="theme-pill rounded px-2 py-1 text-slate-700">Fame: {place.fameScore}/10</span>
                      <span className="theme-pill rounded px-2 py-1 text-slate-700">{place.bestTime}</span>
                      <span className="theme-pill rounded px-2 py-1 text-slate-700">{place.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedPlaces.length > 0 && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => setStep(2)} 
                className="theme-button rounded-full px-10 py-3 font-bold shadow-lg"
              >
                Next: Set Preferences ({selectedPlaces.length} places)
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="theme-card space-y-6 rounded-3xl p-6 animate-fadeIn md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Start City</label>
              <input
                type="text"
                value={preferences.startCity}
                onChange={(e) => setPreferences({ ...preferences, startCity: e.target.value })}
                placeholder={selectedCities[0] || 'Enter start city'}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Number of Travelers</label>
              <input
                type="number"
                min={1}
                value={preferences.numberOfTravelers}
                onChange={(e) => setPreferences({ ...preferences, numberOfTravelers: Number(e.target.value) })}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Budget (INR)</label>
              <input 
                type="number" 
                value={preferences.budget}
                onChange={(e) => setPreferences({...preferences, budget: Number(e.target.value)})}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Duration (Days)</label>
              <input 
                type="number" 
                value={preferences.durationDays}
                onChange={(e) => setPreferences({...preferences, durationDays: Number(e.target.value)})}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Food Preference</label>
              <select 
                value={preferences.foodPreference}
                onChange={(e) => setPreferences({...preferences, foodPreference: e.target.value as TripPreferences['foodPreference']})}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="VEG">Veg</option>
                <option value="NON-VEG">Non-Veg</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Travel Preference</label>
              <select 
                value={preferences.travelPreference}
                onChange={(e) => setPreferences({...preferences, travelPreference: e.target.value as TripPreferences['travelPreference']})}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="PUBLIC">Public Transport</option>
                <option value="PRIVATE">Private Taxi/Car</option>
                <option value="BOTH">Both</option>
              </select>
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

          <div className="flex gap-4 justify-center mt-8">
            <button onClick={() => setStep(1)} className="theme-button-secondary rounded-full px-8 py-3 font-bold">Back</button>
            <button 
              onClick={handleFeasibilityCheck} 
              disabled={loading}
              className="theme-button rounded-full px-10 py-3 font-bold shadow-lg disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Generate AI Plan'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-fadeIn">
          {feasibility && (
            <div className={`theme-card rounded-2xl border-l-8 p-6 ${feasibility.isPossible ? 'border-emerald-500' : 'border-red-500'}`}>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                {feasibility.isPossible ? '✅ Trip is Feasible!' : '❌ Trip May Be Difficult'}
              </h2>
              <p className="mb-4 text-slate-700">{feasibility.reason}</p>
              
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/80 p-3 shadow-sm">
                  <span className="text-sm text-slate-500">Estimated Cost</span>
                  <p className="text-xl font-bold text-orange-700">₹{feasibility.estimatedCost}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 shadow-sm">
                  <span className="text-sm text-slate-500">Total Hours Required</span>
                  <p className="text-xl font-bold text-orange-700">{feasibility.estimatedTime}h</p>
                </div>
              </div>

              {feasibility.suggestions && feasibility.suggestions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">AI Suggestions:</h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-700">
                    {feasibility.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {itinerary.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-center text-3xl font-bold text-gradient">Your Detailed Itinerary</h2>
              <div className="relative ml-4 space-y-8 border-l-4 border-orange-200 pl-8">
                {itinerary.map((item, idx) => (
                  <div key={item.id || `${item.day}-${item.time}-${idx}`} className="relative">
                    <div className="absolute -left-[42px] top-1 h-5 w-5 rounded-full border-4 border-white bg-gradient-to-r from-orange-500 to-amber-400"></div>
                    <div className="theme-card hover-lift rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-orange-700">Day {item.day} • {item.time}</span>
                        <span className="theme-pill rounded-full px-3 py-1 text-xs font-semibold text-slate-700">{item.city}</span>
                      </div>
                      {item.segmentType === 'INTERCITY_TRAVEL' && (
                        <div className="mb-3 rounded-xl bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-800">
                          Intercity Route • {item.transportMode || 'TRANSPORT'} • {item.routeSummary}
                        </div>
                      )}
                      <h3 className="text-xl font-bold mb-1">{item.place}</h3>
                      <p className="text-gray-600 mb-3">{item.activity}</p>
                      {item.historyInfo && (
                        <p className="mb-3 rounded-xl bg-orange-50 px-3 py-2 text-sm text-slate-700">{item.historyInfo}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        {item.transport && (
                          <div className="theme-pill flex items-center gap-2 rounded px-2 py-1 font-medium text-orange-700">
                            <span>🚌 {item.transport}</span>
                          </div>
                        )}
                        {item.durationHours && (
                          <div className="theme-pill rounded px-2 py-1 font-medium text-slate-700">{item.durationHours} hrs</div>
                        )}
                        {item.distanceKm && (
                          <div className="theme-pill rounded px-2 py-1 font-medium text-slate-700">{item.distanceKm} km</div>
                        )}
                        {item.suggestedGuide && (
                          <>
                            <div className="theme-pill flex items-center gap-2 rounded px-2 py-1 font-medium text-emerald-600">
                              <span>👤 Guide: {item.suggestedGuide}</span>
                            </div>
                            {item.suggestedGuidePrice && (
                              <div className="theme-pill rounded px-2 py-1 font-medium text-emerald-700">₹{item.suggestedGuidePrice}</div>
                            )}
                            <button
                              onClick={() => hireGuide(item.id || `${item.day}-${item.time}-${idx}`)}
                              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              {guideRequests[item.id || `${item.day}-${item.time}-${idx}`] ? 'Guide Request Sent' : 'Hire Guide'}
                            </button>
                          </>
                        )}
                        {item.suggestedHotel && (
                          <div className="theme-pill flex items-center gap-2 rounded px-2 py-1 font-medium text-orange-600">
                            <span>🏨 Hotel: {item.suggestedHotel}</span>
                          </div>
                        )}
                        {item.suggestedRestaurant && (
                          <div className="theme-pill flex items-center gap-2 rounded px-2 py-1 font-medium text-rose-600">
                            <span>🍴 Food: {item.suggestedRestaurant}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-12">
            <button onClick={() => setStep(1)} className="theme-button rounded-full px-10 py-3 font-bold shadow-lg">Start New Plan</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
