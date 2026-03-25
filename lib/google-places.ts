import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  "";

// ─── City Autocomplete ──────────────────────────────────────────────────────

export interface CitySuggestion {
  name: string;
  placeId: string;
  description: string;
}

/**
 * Returns Indian city suggestions matching the user's partial input using Gemini.
 */
export async function searchCities(
  query: string
): Promise<CitySuggestion[]> {
  if (!geminiApiKey || !query.trim()) return [];

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `User typed: "${query}". Return a JSON array of up to 5 actual major Indian cities matching this prefix or spelling.
Format STRICTLY as:
[{"name":"City Name","placeId":"cityname","description":"City Name, State, India"}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = stripped.match(/\[[\s\S]*?\]/);
    if (match?.[0]) {
      return JSON.parse(match[0]) as CitySuggestion[];
    }
    return [];
  } catch (err) {
    console.error("[fallback-places] Autocomplete failed:", err);
    return [];
  }
}

// ─── Place Photo ─────────────────────────────────────────────────────────────

/**
 * Gets a real photo from Wikimedia Commons for a given place.
 */
export async function getPlacePhotoUrl(
  placeName: string,
  city: string
): Promise<string | null> {
  const query = `${placeName} ${city}`;
  try {
    // Step 1: Fuzzy search Wikipedia for the closest matching article
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=&format=json&srlimit=1`;
    
    let res = await fetch(searchUrl, { cache: "no-store", headers: { "User-Agent": "SwadeshiYatra/1.0" } });
    let data = await res.json();
    let bestTitle = data.query?.search?.[0]?.title;

    // Step 2: Fetch the original main image for that article
    if (bestTitle) {
      const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(
        bestTitle
      )}`;
      res = await fetch(imgUrl, { cache: "no-store", headers: { "User-Agent": "SwadeshiYatra/1.0" } });
      data = await res.json();
      const pages = data?.query?.pages;
      const pageId = Object.keys(pages || {})[0];
      const photoUrl = pages?.[pageId]?.original?.source;
      if (photoUrl) return photoUrl;
    }
    
    return null;
  } catch (err) {
    console.error("[fallback-places] Photo fetch failed:", err);
    return null;
  }
}
