import { User, UserRole } from '@/types';

type StoredUser = User & { password: string };

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  nationalIdDocument?: string;
  licenseDocument?: string;
  price?: number;
  features?: string[];
};

const USERS_KEY = 'swadeshiyatra_users';
const SESSION_KEY = 'user';

const seedUsers: StoredUser[] = [
  {
    id: '1',
    name: 'John Tourist',
    email: 'tourist@example.com',
    password: 'tourist123',
    role: 'TOURIST',
    verified: true,
  },
  {
    id: '2',
    name: 'Luxury Palace Hotel',
    email: 'hotel@example.com',
    password: 'hotel123',
    role: 'HOTEL',
    verified: true,
    price: 5000,
    features: ['WiFi', 'Pool', 'Breakfast'],
    location: 'Mumbai',
    contactNumber: '9876543210',
    nationalIdDocument: 'hotel_national_id.pdf',
    licenseDocument: 'hotel_license.pdf',
  },
  {
    id: '3',
    name: 'Spicy Delights',
    email: 'restaurant@example.com',
    password: 'restaurant123',
    role: 'RESTAURANT',
    verified: true,
    features: ['Veg', 'Non-Veg', 'Home Delivery'],
    location: 'Bangalore',
    contactNumber: '9123456780',
    nationalIdDocument: 'restaurant_national_id.pdf',
    licenseDocument: 'restaurant_food_license.pdf',
    price: 350,
  },
  {
    id: '4',
    name: 'Local Guide Amit',
    email: 'guide@example.com',
    password: 'guide123',
    role: 'GUIDE',
    verified: true,
    price: 1500,
    location: 'Mumbai',
    contactNumber: '9988776655',
    nationalIdDocument: 'guide_national_id.pdf',
    licenseDocument: 'guide_license.pdf',
  },
];

const isBrowser = () => typeof window !== 'undefined';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const sanitizeUser = (storedUser: StoredUser): User => {
  return {
    id: storedUser.id,
    name: storedUser.name,
    email: storedUser.email,
    role: storedUser.role,
    verified: storedUser.verified,
    price: storedUser.price,
    features: storedUser.features,
    location: storedUser.location,
    latitude: storedUser.latitude,
    longitude: storedUser.longitude,
    contactNumber: storedUser.contactNumber,
    nationalIdDocument: storedUser.nationalIdDocument,
    licenseDocument: storedUser.licenseDocument,
  };
};

const loadUsers = (): StoredUser[] => {
  if (!isBrowser()) return seedUsers;
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
  try {
    const users = JSON.parse(raw) as StoredUser[];
    return users.length > 0 ? users : seedUsers;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
};

const saveUsers = (users: StoredUser[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getMockCredentials = () => [
  { email: 'tourist@example.com', password: 'tourist123', role: 'TOURIST' as const },
  { email: 'hotel@example.com', password: 'hotel123', role: 'HOTEL' as const },
  { email: 'restaurant@example.com', password: 'restaurant123', role: 'RESTAURANT' as const },
  { email: 'guide@example.com', password: 'guide123', role: 'GUIDE' as const },
];

export const login = (email: string, password: string, role: UserRole): User | null => {
  const users = loadUsers();
  const found = users.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password &&
      user.role === role
  );
  if (!found) return null;
  const user = sanitizeUser(found);
  if (isBrowser()) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  return user;
};

export const register = (input: RegisterInput): { user?: User; error?: string } => {
  const users = loadUsers();
  const exists = users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (exists) return { error: 'Email already registered. Please login.' };
  if (input.role !== 'TOURIST') {
    if (!input.contactNumber?.trim()) return { error: 'Contact number is required for service providers.' };
    if (!input.nationalIdDocument?.trim()) return { error: 'National ID document is required for service providers.' };
    if (!input.licenseDocument?.trim()) return { error: 'Authorized license is required for service providers.' };
    if (!input.location?.trim()) return { error: 'Location is required for service providers.' };
    if (!input.price || input.price <= 0) return { error: 'Please provide valid pricing details.' };
  }

  const storedUser: StoredUser = {
    id: createId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    role: input.role,
    verified: input.role === 'TOURIST',
    location: input.location,
    latitude: input.latitude,
    longitude: input.longitude,
    contactNumber: input.contactNumber,
    nationalIdDocument: input.nationalIdDocument,
    licenseDocument: input.licenseDocument,
    price: input.price,
    features: input.features,
  };

  const nextUsers = [...users, storedUser];
  saveUsers(nextUsers);
  const user = sanitizeUser(storedUser);
  if (isBrowser()) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  return { user };
};

export const logout = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const updateCurrentUser = (updates: Partial<User>): User | null => {
  if (!isBrowser()) return null;
  const current = getCurrentUser();
  if (!current) return null;
  const users = loadUsers();
  const index = users.findIndex((user) => user.id === current.id);
  if (index < 0) return null;

  const updatedStored: StoredUser = {
    ...users[index],
    ...updates,
  };
  users[index] = updatedStored;
  saveUsers(users);

  const updatedUser = sanitizeUser(updatedStored);
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};
