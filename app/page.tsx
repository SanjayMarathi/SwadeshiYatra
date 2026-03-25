'use client';

import Link from 'next/link';

const CITY_SHOWCASE = [
  { city: 'Jaipur', beauty: 'Amber Fort, Hawa Mahal, City Palace, Jantar Mantar' },
  { city: 'Varanasi', beauty: 'Dashashwamedh Ghat, Kashi Vishwanath, Sarnath' },
  { city: 'Mumbai', beauty: 'Gateway of India, Marine Drive, Elephanta Caves' },
  { city: 'Delhi', beauty: 'Red Fort, Qutub Minar, India Gate, Humayun Tomb' },
  { city: 'Udaipur', beauty: 'City Palace, Lake Pichola, Jagdish Temple' },
  { city: 'Goa', beauty: 'Calangute Beach, Old Goa Churches, Fort Aguada' },
  { city: 'Kolkata', beauty: 'Victoria Memorial, Howrah Bridge, Dakshineswar' },
  { city: 'Agra', beauty: 'Taj Mahal, Agra Fort, Fatehpur Sikri' },
  { city: 'Hyderabad', beauty: 'Charminar, Golconda Fort, Chowmahalla Palace' },
  { city: 'Bengaluru', beauty: 'Lalbagh, Cubbon Park, Tipu Sultan Palace' },
  { city: 'Chennai', beauty: 'Marina Beach, Kapaleeshwarar Temple, Mahabalipuram' },
  { city: 'Kochi', beauty: 'Fort Kochi, Chinese Nets, Mattancherry Palace' },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[80vh] text-center gap-10 text-red-900">
      {/* Hero */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 p-10 shadow-md text-white">
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">SwadeshiYatra</h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90">
          AI-powered travel planner for India — explore a city in depth or plan a route across multiple cities.
        </p>

        {/* Two mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-3xl mx-auto text-left">
          <Link href="/planner?mode=city" className="group block bg-white/15 backdrop-blur hover:bg-white/25 border border-white/30 rounded-2xl p-6 transition">
            <div className="text-4xl mb-3">🏛️</div>
            <h2 className="text-2xl font-black text-white mb-2">City Planner</h2>
            <p className="text-white/85 text-sm leading-relaxed">
              Pick one Indian city and get a complete guide — top attractions, visiting hours, entry fees, best season, tips, and full budget estimate.
            </p>
            <div className="mt-4 inline-block bg-white text-red-600 font-bold px-5 py-2 rounded-full text-sm group-hover:bg-yellow-100 transition">
              Explore a City →
            </div>
          </Link>

          <Link href="/planner?mode=journey" className="group block bg-white/15 backdrop-blur hover:bg-white/25 border border-white/30 rounded-2xl p-6 transition">
            <div className="text-4xl mb-3">🗺️</div>
            <h2 className="text-2xl font-black text-white mb-2">Journey Planner</h2>
            <p className="text-white/85 text-sm leading-relaxed">
              Plan a multi-city route across India — select cities, pick attractions, choose guides, and get a full day-wise itinerary with transport, entry, and guide costs.
            </p>
            <div className="mt-4 inline-block bg-white text-red-600 font-bold px-5 py-2 rounded-full text-sm group-hover:bg-yellow-100 transition">
              Plan a Journey →
            </div>
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/login"
            className="bg-black/20 border border-white text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-black/35 transition"
          >
            Join as Guide or Provider
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
          <div className="text-4xl mb-3">🏛️</div>
          <h3 className="text-lg font-black mb-2 text-red-700">City Deep Dive</h3>
          <p className="text-gray-700 text-sm">Get 8–10 real attractions per city with visiting hours, entry fees (Indian/child/foreign), best season, and practical tips — all from Gemini AI.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
          <div className="text-4xl mb-3">🗺️</div>
          <h3 className="text-lg font-black mb-2 text-red-700">Multi-City Route</h3>
          <p className="text-gray-700 text-sm">Plan trips spanning multiple Indian cities with sequenced day-wise itinerary, intercity transport options, and point-wise activity steps.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
          <div className="text-4xl mb-3">₹</div>
          <h3 className="text-lg font-black mb-2 text-red-700">Full Cost Breakdown</h3>
          <p className="text-gray-700 text-sm">See entry fees, transport, guide charges, and route totals — per stop, per day, and for the entire trip. No hotel or restaurant clutter.</p>
        </div>
      </div>

      {/* City showcase */}
      <div className="w-full rounded-3xl p-8 bg-white border border-orange-100 shadow-sm">
        <h2 className="text-3xl font-black text-red-700 mb-2">Beauties of India</h2>
        <p className="text-gray-600 mb-6 text-sm">Click any city in City Planner to get AI-generated complete travel details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-left">
          {CITY_SHOWCASE.map((item) => (
            <Link
              key={item.city}
              href={`/planner?mode=city&city=${encodeURIComponent(item.city)}`}
              className="rounded-xl border border-orange-100 p-4 bg-yellow-50 hover:bg-orange-50 hover:border-orange-300 transition block"
            >
              <h3 className="font-black text-red-700">{item.city}</h3>
              <p className="text-sm text-gray-700 mt-1">{item.beauty}</p>
              <p className="text-xs text-orange-600 mt-2 font-semibold">View City Guide →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
