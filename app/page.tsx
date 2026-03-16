'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-6xl font-extrabold text-blue-700 mb-6 drop-shadow-md">
        SwadeshiYatra
      </h1>
      <p className="text-2xl text-gray-600 max-w-2xl mb-12">
        Experience India like never before. AI-powered travel planning, multi-city itineraries, and verified local services.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16">
        <div className="p-8 bg-white rounded-2xl shadow-lg border-t-4 border-blue-500 hover:transform hover:scale-105 transition">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-xl font-bold mb-2">Smart City Search</h3>
          <p className="text-gray-600 text-sm">Select multiple cities and get AI-recommended tourist spots with real-time ratings.</p>
        </div>
        <div className="p-8 bg-white rounded-2xl shadow-lg border-t-4 border-green-500 hover:transform hover:scale-105 transition">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI Feasibility</h3>
          <p className="text-gray-600 text-sm">Check if your trip fits your budget and time. Get alternatives and suggestions instantly.</p>
        </div>
        <div className="p-8 bg-white rounded-2xl shadow-lg border-t-4 border-orange-500 hover:transform hover:scale-105 transition">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-bold mb-2">Verified Locals</h3>
          <p className="text-gray-600 text-sm">Directly connect with verified guides, hotels, and restaurants with transparent pricing.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link 
          href="/planner" 
          className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-xl"
        >
          Start Planning Your Trip
        </Link>
        <Link 
          href="/login" 
          className="bg-white text-blue-600 border-2 border-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition"
        >
          Join as Service Provider
        </Link>
      </div>

      <div className="mt-20 p-8 bg-blue-50 rounded-3xl w-full max-w-5xl">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Why SwadeshiYatra?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl font-bold">✓</span>
            <p className="text-gray-700"><span className="font-bold">No Scam Zone:</span> Every guide and hotelier goes through a multi-step verification process.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl font-bold">✓</span>
            <p className="text-gray-700"><span className="font-bold">AI Itinerary:</span> Timings suggested for the best experience (Temples in morning, Beaches in evening).</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl font-bold">✓</span>
            <p className="text-gray-700"><span className="font-bold">Transport Timing:</span> Integrated public and private transport duration and costs.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl font-bold">✓</span>
            <p className="text-gray-700"><span className="font-bold">Budget Optimizer:</span> Real-time budget analysis and alternative suggestions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
