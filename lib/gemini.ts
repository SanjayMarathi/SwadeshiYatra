import { GoogleGenerativeAI } from "@google/generative-ai";
import { FeasibilityResult, ItineraryItem, TouristPlace, TripPreferences } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const modelCandidates = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash-latest"];

const generateText = async (prompt: string) => {
  let lastError: unknown = null;
  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const extractJson = <T>(text: string, pattern: RegExp): T => {
  const jsonStr = text.match(pattern)?.[0] || text;
  return JSON.parse(jsonStr) as T;
};

export const getTouristPlaces = async (city: string) => {
  const prompt = `Suggest top 5 tourist places in ${city}, India. For each place, provide:
  1. Name
  2. Rating (out of 5)
  3. Fame Score (1-10)
  4. Brief Description
  5. History summary in 2-3 lines
  6. Best Time to visit (MORNING, AFTERNOON, EVENING, NIGHT)
  7. Type (TEMPLE, BEACH, MUSEUM, PARK, HISTORICAL, OTHER)
  
  Format the response as a JSON array of objects.
  Each object should have keys: name, rating, fameScore, description, historyInfo, bestTime, type.`;

  try {
    const text = await generateText(prompt);
    return extractJson<TouristPlace[]>(text, /\[[\s\S]*\]/);
  } catch (error) {
    console.error("Error fetching places from Gemini:", error);
    return [];
  }
};

type PlannerInput = Pick<TripPreferences, "budget" | "durationDays" | "cities" | "foodPreference" | "travelPreference" | "startCity" | "numberOfTravelers" | "tripPace" | "accommodationPreference" | "interests" | "requireGuide"> & {
  places: Pick<TouristPlace, "name">[];
};

export const analyzeFeasibility = async (data: PlannerInput) => {
  const prompt = `As a travel expert, analyze if this trip is feasible:
  Budget: ${data.budget} INR
  Duration: ${data.durationDays} days
  Start City: ${data.startCity}
  Selected Cities: ${data.cities.join(', ')}
  Selected Places: ${data.places.map((p) => p.name).join(', ')}
  Number of Travelers: ${data.numberOfTravelers}
  Trip Pace: ${data.tripPace}
  Accommodation Preference: ${data.accommodationPreference}
  Interests: ${data.interests.join(', ')}
  Need Guide: ${data.requireGuide ? 'YES' : 'NO'}
  Food Preference: ${data.foodPreference}
  Travel Preference: ${data.travelPreference}

  Check if the trip can be completed in the given time and budget. Consider city-to-city travel and local transit by BUS, TRAIN, and FLIGHT when relevant.
  
  Format the response as a JSON object:
  {
    "isPossible": boolean,
    "reason": "string",
    "suggestions": ["suggestion1", "suggestion2"],
    "estimatedCost": number,
    "estimatedTime": number
  }`;

  try {
    const text = await generateText(prompt);
    return extractJson<FeasibilityResult>(text, /\{[\s\S]*\}/);
  } catch (error) {
    console.error("Error analyzing feasibility:", error);
    return null;
  }
};

export const generateItinerary = async (data: PlannerInput) => {
  const prompt = `Create a detailed daily itinerary for a trip:
  Cities: ${data.cities.join(', ')}
  Places: ${data.places.map((p) => p.name).join(', ')}
  Duration: ${data.durationDays} days
  Start City: ${data.startCity}
  Number of Travelers: ${data.numberOfTravelers}
  Trip Pace: ${data.tripPace}
  Accommodation Preference: ${data.accommodationPreference}
  Interests: ${data.interests.join(', ')}
  Need Guide: ${data.requireGuide ? 'YES' : 'NO'}
  Food: ${data.foodPreference}
  Transport: ${data.travelPreference}

  Suggest specific timings (e.g., 9:00 AM), activities, transport modes, and when to visit temples (morning), beaches (evening), etc.
  Include intercity routing for multiple cities across India with BUS/TRAIN/FLIGHT suggestions and route summary.
  Include historyInfo for each place in simple language and include suggested guide with approximate price where possible.

  Format the response as a JSON array of objects:
  [
    {
      "id": "string",
      "day": number,
      "time": "string",
      "segmentType": "LOCAL_VISIT or INTERCITY_TRAVEL",
      "place": "string",
      "city": "string",
      "activity": "string",
      "routeSummary": "string",
      "transportMode": "BUS or TRAIN or FLIGHT or OTHER",
      "transport": "string",
      "durationHours": number,
      "distanceKm": number,
      "historyInfo": "string",
      "suggestedGuide": "string",
      "suggestedGuidePrice": number,
      "suggestedHotel": "string",
      "suggestedRestaurant": "string"
    }
  ]`;

  try {
    const text = await generateText(prompt);
    return extractJson<ItineraryItem[]>(text, /\[[\s\S]*\]/);
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return [];
  }
};
