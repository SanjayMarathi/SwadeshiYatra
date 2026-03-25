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



const extractJson = <T>(text: string, pattern: RegExp): T => {
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = stripped.match(pattern);
  if (!match?.[0]) {
    throw makeGeminiError("Invalid JSON response");
  }
  return JSON.parse(match[0]) as T;
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

Respond ONLY as valid JSON array:
[{"name":"Exact place","rating":4.7,"fameScore":9,"description":"Accurate description","historyInfo":"Brief historical context","bestTime":"MORNING","type":"HISTORICAL"}]

Allowed types: TEMPLE, BEACH, MUSEUM, PARK, HISTORICAL, OTHER
Allowed bestTime: MORNING, AFTERNOON, EVENING, NIGHT`;

  const text = await generateText(prompt);
  const places = extractJson<TouristPlace[]>(text, /\[[\s\S]*?\]/);
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
  bestTimeToVisit: string;
  howToReach: string;
  localTransport: string;
  attractions: CityAttractionDetail[];
  totalBudgetEstimate: string;
  culturalTips: string[];
}

export const getCityPlannerData = async (city: string): Promise<CityPlannerData> => {
  const prompt = `Expert Indian travel guide for ${city}, India.
Provide only real and factual information.
Use actual named places only.

Respond ONLY as valid JSON:
{"cityOverview":"2 sentences","bestTimeToVisit":"e.g. Oct–Mar","howToReach":"Air/Train/Road briefly","localTransport":"Options","attractions":[{"name":"Exact real name","type":"Historical","description":"3-4 sentences","highlights":["h1","h2","h3","h4"],"visitingHours":"9AM-5PM","bestSeason":"Oct-Mar","timeNeeded":"2hr","entryFeeAdult":100,"entryFeeChild":50,"entryFeeForeign":500,"nearbyAttractions":["a","b"],"tips":["t1","t2"],"rating":4.7,"fameScore":9}],"totalBudgetEstimate":"₹2000-4000/person/day","culturalTips":["c1","c2","c3"]}
Give 8 real attractions for ${city}. All fees in INR.`;

  const text = await generateText(prompt);
  const data = extractJson<CityPlannerData>(text, /\{[\s\S]*\}/);
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
  "budget" | "durationDays" | "cities" | "foodPreference" | "travelPreference"
> & {
  originCountry: string;
  places: Pick<TouristPlace, "name">[];
};

export const analyzeFeasibility = async (data: PlannerInput): Promise<FeasibilityResult> => {
  const prompt = `Analyze India trip feasibility:
From: ${data.originCountry}, Budget: ₹${data.budget}, Duration: ${data.durationDays}d
Route: ${data.cities.join("→")}, Places: ${data.places.map((p) => p.name).join(", ")}
Transport: ${data.travelPreference}

Respond ONLY as JSON:
{"isPossible":true,"reason":"1-2 sentences","suggestions":["tip1","tip2","tip3"],"estimatedCost":45000,"estimatedTime":36}`;

  const text = await generateText(prompt);
  return extractJson<FeasibilityResult>(text, /\{[\s\S]*\}/);
};

export const generateItinerary = async (data: PlannerInput): Promise<ItineraryItem[]> => {
  const prompt = `Create a detailed India trip itinerary:
Route: ${data.cities.join("→")}
Places: ${data.places.map((p) => p.name).join(", ")}
Duration: ${data.durationDays}d, Transport: ${data.travelPreference}

Use real Indian prices. Give 5 numbered point-wise steps per stop.
Respond ONLY as JSON array:
[{"day":1,"time":"09:00 AM","place":"Real name","city":"City","activity":"Brief","transport":"Mode","routeFrom":"From","routeTo":"To","suggestedGuide":"Note","entryFee":500,"transportCost":1200,"guideFee":0,"totalCost":1700,"highlights":["1. Step one","2. Step two","3. Step three","4. Step four","5. Step five"],"imageUrl":""}]`;

  const text = await generateText(prompt);
  const plan = extractJson<ItineraryItem[]>(text, /\[[\s\S]*?\]/);
  if (!Array.isArray(plan) || plan.length === 0) {
    throw makeGeminiError("No itinerary returned");
  }
  return plan;
};
