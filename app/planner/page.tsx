'use client';

import React, { useState } from 'react';
import { TouristPlace, TripPreferences, FeasibilityResult, ItineraryItem } from '@/types';
import { getTouristPlaces, analyzeFeasibility, generateItinerary } from '@/lib/gemini';

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
    foodPreference: 'BOTH',
    travelPreference: 'BOTH',
  });

  const [feasibility, setFeasibility] = useState<FeasibilityResult | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);

  const searchCity = async () => {
    if (!cityInput) return;
    setLoading(true);
    const places = await getTouristPlaces(cityInput);
    setSuggestedPlaces(
      places.map((place, index) => ({
        ...place,
        id: `${cityInput}-${index}-${place.name}`,
        city: cityInput,
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
    const data = { ...preferences, cities: selectedCities, places: selectedPlaces };
    const result = await analyzeFeasibility(data);
    setFeasibility(result);
    if (result?.isPossible) {
      const plan = await generateItinerary(data);
      setItinerary(plan);
    }
    setLoading(false);
    setStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">SwadeshiYatra Planner</h1>
      
      {/* Step Indicators */}
      <div className="flex justify-between mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex flex-col items-center flex-1`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s}
            </div>
            <span className={`text-sm ${step >= s ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
              {s === 1 ? 'Search Cities' : s === 2 ? 'Preferences' : 'Final Plan'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Search and Select */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter city name (e.g. Mumbai, Bangalore)"
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && searchCity()}
            />
            <button 
              onClick={searchCity} 
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {selectedCities.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedCities.map(city => (
                <span key={city} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
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
                    className={`p-4 border rounded-lg cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
                    onClick={() => togglePlace(place)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{place.name}</h3>
                      <span className="text-yellow-500 font-bold">★ {place.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{place.description}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-gray-200 px-2 py-1 rounded">Fame: {place.fameScore}/10</span>
                      <span className="bg-gray-200 px-2 py-1 rounded">{place.bestTime}</span>
                      <span className="bg-gray-200 px-2 py-1 rounded">{place.type}</span>
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
                className="bg-green-600 text-white px-10 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg"
              >
                Next: Set Preferences ({selectedPlaces.length} places)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (INR)</label>
              <input 
                type="number" 
                value={preferences.budget}
                onChange={(e) => setPreferences({...preferences, budget: Number(e.target.value)})}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
              <input 
                type="number" 
                value={preferences.durationDays}
                onChange={(e) => setPreferences({...preferences, durationDays: Number(e.target.value)})}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Preference</label>
              <select 
                value={preferences.foodPreference}
                onChange={(e) => setPreferences({...preferences, foodPreference: e.target.value as TripPreferences['foodPreference']})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="VEG">Veg</option>
                <option value="NON-VEG">Non-Veg</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Preference</label>
              <select 
                value={preferences.travelPreference}
                onChange={(e) => setPreferences({...preferences, travelPreference: e.target.value as TripPreferences['travelPreference']})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="PUBLIC">Public Transport</option>
                <option value="PRIVATE">Private Taxi/Car</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <button onClick={() => setStep(1)} className="px-8 py-3 border border-gray-300 rounded-full font-bold hover:bg-gray-100 transition">Back</button>
            <button 
              onClick={handleFeasibilityCheck} 
              disabled={loading}
              className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Generate AI Plan'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && (
        <div className="space-y-8 animate-fadeIn">
          {feasibility && (
            <div className={`p-6 rounded-lg border-l-8 ${feasibility.isPossible ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                {feasibility.isPossible ? '✅ Trip is Feasible!' : '❌ Trip May Be Difficult'}
              </h2>
              <p className="text-gray-700 mb-4">{feasibility.reason}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="text-sm text-gray-500">Estimated Cost</span>
                  <p className="text-xl font-bold text-blue-700">₹{feasibility.estimatedCost}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="text-sm text-gray-500">Total Hours Required</span>
                  <p className="text-xl font-bold text-blue-700">{feasibility.estimatedTime}h</p>
                </div>
              </div>

              {feasibility.suggestions && feasibility.suggestions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">AI Suggestions:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {feasibility.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {itinerary.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center text-gray-800">Your Detailed Itinerary</h2>
              <div className="relative border-l-4 border-blue-200 ml-4 pl-8 space-y-8">
                {itinerary.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[42px] top-1 w-5 h-5 bg-blue-600 rounded-full border-4 border-white"></div>
                    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Day {item.day} • {item.time}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">{item.city}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{item.place}</h3>
                      <p className="text-gray-600 mb-3">{item.activity}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        {item.transport && (
                          <div className="flex items-center gap-2 text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded">
                            <span>🚌 {item.transport}</span>
                          </div>
                        )}
                        {item.suggestedGuide && (
                          <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                            <span>👤 Guide: {item.suggestedGuide}</span>
                          </div>
                        )}
                        {item.suggestedHotel && (
                          <div className="flex items-center gap-2 text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                            <span>🏨 Hotel: {item.suggestedHotel}</span>
                          </div>
                        )}
                        {item.suggestedRestaurant && (
                          <div className="flex items-center gap-2 text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
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
            <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg">Start New Plan</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
