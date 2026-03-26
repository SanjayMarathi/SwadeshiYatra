'use client';

import Link from 'next/link';

const CITY_SHOWCASE = [
  { city: 'Jaipur',     emoji: '🏰', beauty: 'Amber Fort, Hawa Mahal, City Palace, Jantar Mantar' },
  { city: 'Varanasi',   emoji: '🛕', beauty: 'Dashashwamedh Ghat, Kashi Vishwanath, Sarnath' },
  { city: 'Mumbai',     emoji: '🌊', beauty: 'Gateway of India, Marine Drive, Elephanta Caves' },
  { city: 'Delhi',      emoji: '🏯', beauty: 'Red Fort, Qutub Minar, India Gate, Humayun Tomb' },
  { city: 'Udaipur',    emoji: '🏛️', beauty: 'City Palace, Lake Pichola, Jagdish Temple' },
  { city: 'Goa',        emoji: '🏖️', beauty: 'Calangute Beach, Old Goa Churches, Fort Aguada' },
  { city: 'Kolkata',    emoji: '🎭', beauty: 'Victoria Memorial, Howrah Bridge, Dakshineswar' },
  { city: 'Agra',       emoji: '🕌', beauty: 'Taj Mahal, Agra Fort, Fatehpur Sikri' },
  { city: 'Hyderabad',  emoji: '🦁', beauty: 'Charminar, Golconda Fort, Chowmahalla Palace' },
  { city: 'Bengaluru',  emoji: '🌿', beauty: 'Lalbagh, Cubbon Park, Tipu Sultan Palace' },
  { city: 'Chennai',    emoji: '🌅', beauty: 'Marina Beach, Kapaleeshwarar Temple, Mahabalipuram' },
  { city: 'Kochi',      emoji: '⛵', beauty: 'Fort Kochi, Chinese Nets, Mattancherry Palace' },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12 max-w-7xl mx-auto px-4 py-10" style={{ color: 'var(--foreground)' }}>
      
      {/* ─── High-Contrast Hero ─────────────────────────────────────────────── */}
      <section className="w-full rounded-3xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 p-10 md:p-16 shadow-2xl text-white text-center relative overflow-hidden border-4 border-orange-200/30">
        <div className="absolute top-0 left-0 w-full h-full pattern-dots opacity-10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-floaty inline-block shadow-black/20 drop-shadow-2xl">🇮🇳</div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight drop-shadow-xl text-white">
            SwadeshiYatra
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-white leading-relaxed font-semibold drop-shadow-md">
            The ultimate AI-powered travel companion for exploring India. Get deep city insights or craft perfect multi-city itineraries instantly.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="inline-block bg-white text-red-700 font-black px-8 py-3 rounded-full shadow-lg transition-all hover:bg-yellow-50 hover:scale-105 hover:shadow-xl"
            >
              Join as Guide or Provider
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Detailed Feature Explanations ──────────────────────────────────── */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* City Planner Explanation */}
        <Link href="/planner?mode=city" className="group flex flex-col justify-between rounded-3xl bg-white border-2 border-orange-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:border-orange-400 overflow-hidden transform hover:-translate-y-1">
          <div className="p-8">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              🏛️
            </div>
            <h2 className="text-3xl font-black text-red-700 mb-4">City Planner</h2>
            <p className="text-gray-700 font-medium mb-6 text-lg leading-relaxed">
              Focus deeply on a single Indian destination. The AI generates a comprehensive, encyclopedic travel guide tailored for exploration.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✔️</span>
                <span className="text-gray-800 font-medium"><strong>Detailed Attractions:</strong> Explores the top historic and cultural landmarks.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✔️</span>
                <span className="text-gray-800 font-medium"><strong>Core Logistics:</strong> Lists precise visiting hours, best seasons, and entry fees (for Indians & Foreigners).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✔️</span>
                <span className="text-gray-800 font-medium"><strong>Rich History:</strong> Provides theoretical insights, cultural tips, and historical importance.</span>
              </li>
            </ul>
          </div>
          <div className="bg-orange-50 p-6 border-t border-orange-100 flex justify-between items-center group-hover:bg-orange-100 transition-colors">
            <span className="font-black text-orange-700">Launch City Planner</span>
            <span className="text-2xl text-orange-600 transition-transform group-hover:translate-x-2">→</span>
          </div>
        </Link>

        {/* Journey Planner Explanation */}
        <Link href="/planner?mode=journey" className="group flex flex-col justify-between rounded-3xl bg-white border-2 border-red-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:border-red-400 overflow-hidden transform hover:-translate-y-1">
          <div className="p-8">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
              🗺️
            </div>
            <h2 className="text-3xl font-black text-red-700 mb-4">Journey Planner</h2>
            <p className="text-gray-700 font-medium mb-6 text-lg leading-relaxed">
              Design a complete multi-city itinerary. Select multiple destinations and let the AI sequence the perfect day-by-day travel plan.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✔️</span>
                <span className="text-gray-800 font-medium"><strong>Smart Sequencing:</strong> AI automatically orders your cities logically and predicts the needed trip duration.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✔️</span>
                <span className="text-gray-800 font-medium"><strong>Personalized Context:</strong> Adjusts pacing and recommendations based on dietary needs, activity levels, and group types.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 mt-1">✔️</span>
                <span className="text-gray-800 font-medium"><strong>Cost Breakdown:</strong> Calculates step-by-step travel costs, entry fees, and generates survival cautions.</span>
              </li>
            </ul>
          </div>
          <div className="bg-red-50 p-6 border-t border-red-100 flex justify-between items-center group-hover:bg-red-100 transition-colors">
            <span className="font-black text-red-700">Launch Journey Planner</span>
            <span className="text-2xl text-red-600 transition-transform group-hover:translate-x-2">→</span>
          </div>
        </Link>

      </section>

      {/* ─── City showcase ───────────────────────────────────────────────────── */}
      <section className="w-full mt-8">
        <div className="mb-8 text-center bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <h2 className="text-3xl font-black text-red-700 mb-2">Beauties of India</h2>
          <p className="text-base text-gray-700 font-medium">
            Click any vibrant city below to instantly launch the <strong>City Planner</strong> and get a complete AI-generated travel guide.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {CITY_SHOWCASE.map((item) => (
            <Link
              key={item.city}
              href={`/planner?mode=city&city=${encodeURIComponent(item.city)}`}
              className="bg-white border hover:border-orange-400 rounded-2xl shadow-sm hover:shadow-lg focus:outline-none transition-all duration-300 p-5 group transform hover:-translate-y-1 block"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl bg-orange-50 rounded-lg p-2">{item.emoji}</span>
                <h3 className="font-black text-xl text-gray-800">{item.city}</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 font-medium mb-4">
                {item.beauty}
              </p>
              <p className="text-sm font-bold mt-auto text-orange-600 group-hover:text-red-600 flex items-center gap-1 transition-colors">
                View Deep Dive <span className="transition-transform group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Footer strip ───────────────────────────────────────────────────── */}
      <footer className="w-full text-center py-6 mt-10 border-t border-orange-200">
        <p className="text-sm font-bold text-orange-800">
          🇮🇳 SwadeshiYatra — Explore India, your way.
        </p>
      </footer>
    </div>
  );
}
