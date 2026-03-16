export type UserRole = 'TOURIST' | 'HOTEL' | 'RESTAURANT' | 'GUIDE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  price?: number;
  expertise?: string;
  country?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  nationalIdDocument?: string;
  licenseDocument?: string;
}

export interface TouristPlace {
  id: string;
  name: string;
  city: string;
  rating: number;
  fameScore: number; // 1-10
  description: string;
  historyInfo?: string;
  imageUrl?: string;
  bestTime: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  type: 'TEMPLE' | 'BEACH' | 'MUSEUM' | 'PARK' | 'HISTORICAL' | 'OTHER';
}

export interface TripPreferences {
  budget: number;
  durationDays: number;
  cities: string[];
  places: TouristPlace[];
  originCountry: string;
  foodPreference: 'VEG' | 'NON-VEG' | 'BOTH';
  travelPreference: 'PUBLIC' | 'PRIVATE' | 'BOTH';
}

export interface ItineraryItem {
  id?: string;
  day: number;
  time: string;
  segmentType?: 'LOCAL_VISIT' | 'INTERCITY_TRAVEL';
  place: string;
  city: string;
  activity: string;
  routeSummary?: string;
  transportMode?: 'BUS' | 'TRAIN' | 'FLIGHT' | 'CAR' | 'METRO' | 'WALK' | 'OTHER';
  transport?: string;
  durationHours?: number;
  distanceKm?: number;
  historyInfo?: string;
  suggestedGuide?: string;
  routeFrom?: string;
  routeTo?: string;
  entryFee?: number;
  transportCost?: number;
  guideFee?: number;
  totalCost?: number;
  highlights?: string[];
  imageUrl?: string;
}

export interface FeasibilityResult {
  isPossible: boolean;
  reason?: string;
  suggestions?: string[];
  estimatedCost: number;
  estimatedTime: number;
}
