export type UserRole = 'TOURIST' | 'HOTEL' | 'RESTAURANT' | 'GUIDE' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  price?: number;
  features?: string[];
  expertise?: string;
  country?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  nationalIdDocument?: string;
  licenseDocument?: string;
  rejectionReason?: string;
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
  tripPace?: 'RELAXED' | 'BALANCED' | 'FAST';
  accommodationPreference?: 'BUDGET' | 'COMFORT' | 'LUXURY';
  interests?: string[];
  requireGuide?: boolean;
  groupType?: 'SOLO' | 'COUPLE' | 'FAMILY' | 'FRIENDS';
  activityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  dietaryRestrictions?: 'NONE' | 'VEGAN' | 'HALAL' | 'JAIN' | 'GLUTEN_FREE' | 'OTHER';
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
  suggestedArrivalAirport?: string;
  optimizedCityRoute?: string[];
  foodAndStayAdvice?: string;
  generalCautions?: string[];
  suggestions?: string[];
  estimatedCost: number;
  estimatedTime: number;
}
