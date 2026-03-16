export type UserRole = 'TOURIST' | 'HOTEL' | 'RESTAURANT' | 'GUIDE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  price?: number; // For guides and hotels
  features?: string[]; // For hotels and restaurants
  location?: string;
}

export interface TouristPlace {
  id: string;
  name: string;
  city: string;
  rating: number;
  fameScore: number; // 1-10
  description: string;
  bestTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  type: 'TEMPLE' | 'BEACH' | 'MUSEUM' | 'PARK' | 'HISTORICAL' | 'OTHER';
}

export interface TripPreferences {
  budget: number;
  durationDays: number;
  cities: string[];
  places: TouristPlace[];
  foodPreference: 'VEG' | 'NON-VEG' | 'BOTH';
  travelPreference: 'PUBLIC' | 'PRIVATE' | 'BOTH';
}

export interface ItineraryItem {
  day: number;
  time: string;
  place: string;
  city: string;
  activity: string;
  transport?: string;
  suggestedGuide?: string;
  suggestedHotel?: string;
  suggestedRestaurant?: string;
}

export interface FeasibilityResult {
  isPossible: boolean;
  reason?: string;
  suggestions?: string[];
  estimatedCost: number;
  estimatedTime: number;
}
