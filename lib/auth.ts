import { User, UserRole } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Tourist',
    email: 'tourist@example.com',
    role: 'TOURIST',
    verified: true,
  },
  {
    id: '2',
    name: 'Luxury Palace Hotel',
    email: 'hotel@example.com',
    role: 'HOTEL',
    verified: true,
    price: 5000,
    features: ['WiFi', 'Pool', 'Breakfast'],
    location: 'Mumbai',
  },
  {
    id: '3',
    name: 'Spicy Delights',
    email: 'restaurant@example.com',
    role: 'RESTAURANT',
    verified: true,
    features: ['Veg', 'Non-Veg', 'Home Delivery'],
    location: 'Bangalore',
  },
  {
    id: '4',
    name: 'Local Guide Amit',
    email: 'guide@example.com',
    role: 'GUIDE',
    verified: true,
    price: 1500,
    location: 'Mumbai',
  },
];

export const login = (email: string, role: UserRole): User | null => {
  const user = mockUsers.find(u => u.email === email && u.role === role);
  return user || null;
};

export const register = (user: Partial<User>): User => {
  // Mock registration
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'TOURIST',
    verified: user.role === 'TOURIST' ? true : false, // Others need verification
    ...user,
  };
  return newUser;
};
