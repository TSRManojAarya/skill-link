export enum UserRole {
  SEEKER = 'SEEKER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  providerId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId?: string; // Optional, can be direct chat
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Availability {
  day: string; // 'Mon', 'Tue', etc.
  enabled: boolean;
  startTime: string; // '09:00'
  endTime: string; // '17:00'
}

export interface PortfolioItem {
  id: string;
  imageUrl: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  location?: Location;
  isVerified?: boolean; // For providers
  verificationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  skills?: string[]; // For providers
  hourlyRate?: number; // For providers
  serviceRadius?: number; // For providers in km
  availability?: Availability[]; // For providers
  portfolio?: PortfolioItem[]; // For providers
  totalEarnings?: number; // For providers
  reviews?: Review[];
  savedProviderIds?: string[]; // For seekers
  createdAt: string;
}

export interface Booking {
  id: string;
  seekerId: string;
  providerId: string;
  status: BookingStatus;
  scheduledDate: string;
  description: string;
  price: number;
  location: Location;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
