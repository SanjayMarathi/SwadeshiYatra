import { GoogleGenerativeAI } from "@google/generative-ai";
import { FeasibilityResult, ItineraryItem, TouristPlace, TripPreferences } from "@/types";

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
];

const GEMINI_ALERT = "Gemini not giving data alert";

const makeGeminiError = (details: unknown) => new Error(`${GEMINI_ALERT}: ${String(details).slice(0, 300)}`);

/**
 * Balanced-bracket JSON extractor.
 * Finds the first complete JSON array ([...]) or object ({...}) in the text,
 * properly handling nested brackets inside string values so that a `]` or `}`
 * inside a string value does NOT prematurely close the outer container.
 */
const extractJsonBlock = (text: string, startChar: '[' | '{'): string | null => {
  const endChar = startChar === '[' ? ']' : '}';
  const start = text.indexOf(startChar);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === startChar) depth++;
    else if (ch === endChar) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
};

const sanitizeJsonString = (raw: string): string => {
  // Strip markdown code fences
  let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // Remove trailing commas before ] or }
  s = s.replace(/,\s*([}\]])/g, '$1');
  // Remove control characters
  s = s.replace(/[\u0000-\u001F\u007F]+/g, ' ');
  return s;
};

const extractJson = <T>(text: string, kind: 'array' | 'object'): T => {
  const cleaned = sanitizeJsonString(text);
  const startChar = kind === 'array' ? '[' : '{';
  const block = extractJsonBlock(cleaned, startChar);

  if (!block) {
    console.error("JSON extraction failed. Raw snippet:", cleaned.substring(0, 300));
    throw makeGeminiError("Invalid JSON response — no balanced bracket block found");
  }

  try {
    return JSON.parse(block) as T;
  } catch (err) {
    console.error("JSON parse failed. Block snippet:", block.substring(0, 400), "...");
    throw new Error(`JSON format error: ${(err as Error).message}`);
  }
};

const generateText = async (prompt: string): Promise<string> => {
  if (!genAI) {
    throw makeGeminiError("GEMINI_API_KEY not set");
  }

  let lastError: unknown = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text?.trim()) {
        throw makeGeminiError("Empty response");
      }
      return text;
    } catch (err) {
      console.error(`[gemini] Model ${modelName} failed:`, err);
      lastError = err;
    }
  }

  throw makeGeminiError(lastError ?? "All Gemini models failed");
};

export const getTouristPlaces = async (city: string): Promise<TouristPlace[]> => {
  const prompt = `List exactly 8 real and currently relevant tourist attractions in ${city}, India.
Use only factual place names and details.
Do not invent generic places.
CRITICAL: Use only simple ASCII characters in string values. Do not use unescaped double quotes inside values. No trailing commas.

Respond ONLY as valid JSON array:
[{"name":"Exact place","rating":4.7,"fameScore":9,"description":"Accurate description","historyInfo":"Brief historical context","bestTime":"MORNING","type":"HISTORICAL"}]

Allowed types: TEMPLE, BEACH, MUSEUM, PARK, HISTORICAL, OTHER
Allowed bestTime: MORNING, AFTERNOON, EVENING, NIGHT`;

  const text = await generateText(prompt);
  const places = extractJson<TouristPlace[]>(text, 'array');
  if (!Array.isArray(places) || places.length === 0) {
    throw makeGeminiError("No places returned");
  }
  const normalized = places.map((p, i) => ({
    ...p,
    id: `${city}-${i}`,
    city,
    rating: Number(p.rating || 0),
    fameScore: Number(p.fameScore || 0),
  }));

  return normalized.slice(0, 8);
};

export interface CityAttractionDetail {
  name: string;
  type: string;
  description: string;
  highlights: string[];
  visitingHours: string;
  bestSeason: string;
  timeNeeded: string;
  entryFeeAdult: number;
  entryFeeChild: number;
  entryFeeForeign: number;
  nearbyAttractions: string[];
  tips: string[];
  rating: number;
  fameScore: number;
}

export interface CityPlannerData {
  cityOverview: string;
  historicalImportance: string;
  bestTimeToVisit: string;
  howToReach: string;
  localTransport: string;
  topSuggestions: string[];
  attractions: CityAttractionDetail[];
  totalBudgetEstimate: string;
  culturalTips: string[];
}

export const getCityPlannerData = async (city: string): Promise<CityPlannerData> => {
  const prompt = `Expert Indian travel guide for ${city}, India.
Provide highly detailed theoretical information, rich historical importance, and expert suggestions about the city.
Use actual named places only.
CRITICAL: Use only simple ASCII characters in string values. Do not use unescaped double quotes inside values. No trailing commas.

Respond ONLY as valid JSON:
{"cityOverview":"3-4 sentences of deep theoretical introduction and local vibe","historicalImportance":"Detailed paragraph about the historical significance and legacy of the city","bestTimeToVisit":"e.g. Oct-Mar","howToReach":"Air/Train/Road briefly","localTransport":"Options","topSuggestions":["Unique suggestion 1","Unique suggestion 2","Unique suggestion 3"],"attractions":[{"name":"Exact real name","type":"Historical","description":"3-4 sentences","highlights":["h1","h2","h3","h4"],"visitingHours":"9AM-5PM","bestSeason":"Oct-Mar","timeNeeded":"2hr","entryFeeAdult":100,"entryFeeChild":50,"entryFeeForeign":500,"nearbyAttractions":["a","b"],"tips":["t1","t2"],"rating":4.7,"fameScore":9}],"totalBudgetEstimate":"Rs 2000-4000/person/day","culturalTips":["c1","c2","c3"]}
Give 8 real attractions for ${city}. All fees in INR.`;

  const text = await generateText(prompt);
  const data = extractJson<CityPlannerData>(text, 'object');
  if (!data.attractions?.length) {
    throw makeGeminiError("No city attraction data returned");
  }
  const normalizedAttractions = data.attractions.map((attraction) => ({
    ...attraction,
    rating: Number(attraction.rating || 0),
    fameScore: Number(attraction.fameScore || 0),
  }));

  data.attractions = normalizedAttractions.slice(0, 8);
  return data;
};

type PlannerInput = Pick<
  TripPreferences,
  "budget" | "durationDays" | "cities" | "foodPreference" | "travelPreference" | "groupType" | "activityLevel" | "dietaryRestrictions"
> & {
  originCountry: string;
  places: Pick<TouristPlace, "name">[];
};

export const analyzeFeasibility = async (data: PlannerInput): Promise<FeasibilityResult> => {
  const prompt = `Analyze India trip feasibility:
From: ${data.originCountry}, Budget: Rs ${data.budget}
Route: ${data.cities.join("->")}, Places: ${data.places.map((p) => p.name).join(", ")}
Transport: ${data.travelPreference}
Group: ${data.groupType || 'Not specified'}, Activity Level: ${data.activityLevel || 'Not specified'}
Diet: ${data.dietaryRestrictions || 'None'}

Calculate the optimal number of days required for this trip.
Evaluate if the route makes sense. If cities are random (e.g. North to South), reorder them into a logical Sequence.
Suggest the best major Indian International Airport to land at based on the first city.
Provide practical advice on where to find authentic food/shelter if booked hotels/restaurants are unavailable, tailoring advice to diet and group type.
Provide specific cautions for this route (e.g. network issues, carry food/water on highways), keeping the group type and activity level in mind.
CRITICAL: Use only simple ASCII characters. No trailing commas. No unescaped quotes inside values.

Respond ONLY as JSON:
{"isPossible":true,"reason":"1-2 sentences","suggestedArrivalAirport":"Arrival Airport (Code)","optimizedCityRoute":["City1","City2"],"foodAndStayAdvice":"Advice","generalCautions":["caution1","caution2"],"suggestions":["tip1","tip2"],"estimatedCost":45000,"estimatedTime":36}`;

  const text = await generateText(prompt);
  return extractJson<FeasibilityResult>(text, 'object');
};

export const generateItinerary = async (data: PlannerInput): Promise<ItineraryItem[]> => {
  const prompt = `Create a detailed India trip itinerary:
Route: ${data.cities.join("->")}
Places: ${data.places.map((p) => p.name).join(", ")}
Transport: ${data.travelPreference}
Group: ${data.groupType || 'Not specified'}, Activity Level: ${data.activityLevel || 'Not specified'}
Diet: ${data.dietaryRestrictions || 'None'}

Calculate the optimal number of days required for this trip and assign the 'day' field accordingly. Ensure pace naturally matches Activity Level. Ensure food/step suggestions match Group and Diet.
Use real Indian prices. Give 5 numbered point-wise steps per stop.
CRITICAL: You MUST explicitly include EVERY single attraction from the 'Places' list in your day-by-day steps. Do not skip any selected places.
CRITICAL: Prepend a relevant emoji to EVERY step in the 'highlights' array (e.g., "🛕 Visit Kashi Vishwanath...", "🍽️ Eat lunch at...", "🚕 Take a taxi to...").
CRITICAL: Use only simple ASCII characters. No trailing commas. No unescaped quotes inside values.

Respond ONLY as JSON array:
[{"day":1,"time":"09:00 AM","place":"Real name","city":"City","activity":"Brief","transport":"Mode","routeFrom":"From","routeTo":"To","suggestedGuide":"Note","entryFee":500,"transportCost":1200,"guideFee":0,"totalCost":1700,"highlights":["1. Step one","2. Step two"],"imageUrl":""}]`;

  const text = await generateText(prompt);
  const plan = extractJson<ItineraryItem[]>(text, 'array');
  if (!Array.isArray(plan) || plan.length === 0) {
    throw makeGeminiError("No itinerary returned");
  }
  return plan;
};
