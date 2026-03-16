'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative overflow-hidden py-8 text-center">
      <div className="pointer-events-none absolute left-8 top-6 h-44 w-44 rounded-full bg-orange-300/35 blur-3xl animate-floaty" />
      <div className="pointer-events-none absolute right-8 top-16 h-44 w-44 rounded-full bg-orange-300/35 blur-3xl animate-floaty" />

      <section className="theme-card relative mx-auto mb-12 max-w-6xl rounded-[2rem] px-6 py-14 md:px-14">
        <span className="theme-pill mb-5 inline-flex rounded-full px-5 py-2 text-sm font-semibold text-orange-900">
          AI Tour Planner • Multi-City • Verified Locals
        </span>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight md:text-7xl">
          <span className="text-gradient">SwadeshiYatra</span>
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-700 md:text-2xl">
          Plan unforgettable India trips with a clean orange flow — smart city recommendations, budget checks, and day-wise routes in one place.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link 
            href="/planner" 
            className="theme-button animate-glowPulse rounded-full px-9 py-4 text-lg font-bold shadow-xl"
          >
            Start Planning Your Trip
          </Link>
          <Link 
            href="/register" 
            className="theme-button-secondary rounded-full px-9 py-4 text-lg font-bold"
          >
            Create Provider Account
          </Link>
        </div>
      </section>

      <section className="mx-auto mb-14 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="theme-card hover-lift rounded-3xl p-8 text-left">
          <div className="mb-4 text-4xl animate-floaty">🌍</div>
          <h3 className="mb-2 text-xl font-bold text-orange-900">Smart City Search</h3>
          <p className="text-sm text-slate-700">Pick multiple cities and get high-rated tourist places with fame score and ideal visit timing.</p>
        </div>
        <div className="theme-card hover-lift rounded-3xl p-8 text-left">
          <div className="mb-4 text-4xl animate-floaty">🤖</div>
          <h3 className="mb-2 text-xl font-bold text-orange-900">Feasibility Intelligence</h3>
          <p className="text-sm text-slate-700">AI verifies budget, duration, and travel flow, then recommends smarter alternatives if needed.</p>
        </div>
        <div className="theme-card hover-lift rounded-3xl p-8 text-left">
          <div className="mb-4 text-4xl animate-floaty">🤝</div>
          <h3 className="mb-2 text-xl font-bold text-orange-900">Verified Service Network</h3>
          <p className="text-sm text-slate-700">Connect with trusted guides, hotels, and restaurants with transparent pricing and features.</p>
        </div>
      </section>

      <section className="theme-card relative mx-auto max-w-6xl overflow-hidden rounded-3xl p-8 md:p-10">
        <div className="shimmer-strip absolute inset-x-0 top-0 h-1" />
        <h2 className="mb-6 text-3xl font-bold text-gradient">Why Travelers Love SwadeshiYatra</h2>
        <div className="grid grid-cols-1 gap-5 text-left md:grid-cols-2">
          <div className="theme-pill hover-lift rounded-2xl px-4 py-3 text-slate-700"><span className="font-bold text-orange-900">No Scam Zone:</span> Multi-step verification for guides and hotels.</div>
          <div className="theme-pill hover-lift rounded-2xl px-4 py-3 text-slate-700"><span className="font-bold text-orange-900">AI Timings:</span> Morning temples, evening beaches, optimized for comfort.</div>
          <div className="theme-pill hover-lift rounded-2xl px-4 py-3 text-slate-700"><span className="font-bold text-orange-900">Smart Transport:</span> Better city-to-city and local route planning.</div>
          <div className="theme-pill hover-lift rounded-2xl px-4 py-3 text-slate-700"><span className="font-bold text-orange-900">Budget Adaptation:</span> Instant alternatives when budget or time is tight.</div>
        </div>
      </section>
    </div>
  );
}
