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

const FEATURES = [
  {
    icon: '🏛️',
    title: 'City Deep Dive',
    desc: 'Get 8–10 real attractions per city with visiting hours, entry fees (Indian/child/foreign), best season, cultural tips, and more.',
    accent: 'saffron',
  },
  {
    icon: '🗺️',
    title: 'Multi-City Routes',
    desc: 'Plan trips spanning multiple Indian cities with a sequenced day-wise itinerary, intercity transport options, and point-wise activity steps.',
    accent: 'blue',
  },
  {
    icon: '₹',
    title: 'Full Cost Breakdown',
    desc: 'See entry fees, transport, guide charges, and route totals — per stop, per day, and for the entire trip. No hotel or restaurant clutter.',
    accent: 'red',
  },
];

export default function Home() {
  return (
    <div
      className="flex flex-col items-center gap-12 max-w-7xl mx-auto px-4 py-10"
      style={{ color: 'var(--foreground)' }}
    >
      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="w-full rounded-3xl sw-hero p-10 md:p-14 shadow-xl text-white text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 bg-white" />

        <div className="relative">
          <div className="text-5xl mb-3 animate-floaty inline-block">🇮🇳</div>
          <h1 className="text-5xl md:text-6xl font-black mb-3 tracking-tight drop-shadow-lg">
            SwadeshiYatra
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90 leading-relaxed">
            Your complete travel planner for India — explore any city in depth or plan a multi-city route with step-by-step itineraries.
          </p>

          {/* Mode cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10 max-w-3xl mx-auto text-left">
            <Link
              href="/planner?mode=city"
              className="group block rounded-2xl p-6 border border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              <div className="text-4xl mb-3">🏛️</div>
              <h2 className="text-xl font-black text-white mb-2">City Planner</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Pick one Indian city and get a complete guide — top attractions, visiting hours, entry fees, best season, tips, and full budget estimate.
              </p>
              <div className="mt-5 inline-block bg-white font-bold px-5 py-2 rounded-full text-sm transition-all group-hover:bg-yellow-100"
                style={{ color: 'var(--sw-red)' }}>
                Explore a City →
              </div>
            </Link>

            <Link
              href="/planner?mode=journey"
              className="group block rounded-2xl p-6 border border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}
            >
              <div className="text-4xl mb-3">🗺️</div>
              <h2 className="text-xl font-black text-white mb-2">Journey Planner</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Plan a multi-city route across India — select cities, pick attractions, choose guides, and get a full day-wise itinerary with all costs.
              </p>
              <div className="mt-5 inline-block bg-white font-bold px-5 py-2 rounded-full text-sm transition-all group-hover:bg-yellow-100"
                style={{ color: 'var(--sw-red)' }}>
                Plan a Journey →
              </div>
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block border border-white/60 text-white font-bold px-8 py-3 rounded-full text-sm transition-all hover:bg-white/20"
            >
              Join as Guide or Provider
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Feature highlights ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="sw-card hover-lift p-6"
            style={{
              borderTop: `3px solid var(--sw-${f.accent})`,
            }}
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="text-lg font-black mb-2" style={{ color: `var(--sw-${f.accent})` }}>
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ─── City showcase ───────────────────────────────────────────────────── */}
      <section className="w-full">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-black sw-section-title mb-2">Beauties of India</h2>
          <div className="sw-tricolor-bar max-w-xs mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Click any city to get a complete AI-generated travel guide
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {CITY_SHOWCASE.map((item) => (
            <Link
              key={item.city}
              href={`/planner?mode=city&city=${encodeURIComponent(item.city)}`}
              className="sw-card hover-lift block p-5 group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{item.emoji}</span>
                <h3 className="font-black text-lg sw-section-title">{item.city}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {item.beauty}
              </p>
              <p className="text-xs font-bold mt-3 transition-colors group-hover:opacity-80"
                style={{ color: 'var(--sw-saffron)' }}>
                View City Guide →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Footer strip ───────────────────────────────────────────────────── */}
      <footer className="w-full text-center py-6 border-t" style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
        <p className="text-sm">
          🇮🇳 SwadeshiYatra — Explore India, your way.
        </p>
      </footer>
    </div>
  );
}
