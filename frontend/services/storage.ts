import { User, UserRole, Booking, BookingStatus, Review, Location, Message, Availability } from '../types';

const STORAGE_KEYS = {
  USERS: 'skill_link_users',
  BOOKINGS: 'skill_link_bookings',
  REVIEWS: 'skill_link_reviews',
  MESSAGES: 'skill_link_messages',
  CURRENT_USER: 'skill_link_current_user'
};

export const DEFAULT_AVAILABILITY: Availability[] = [
  { day: 'Mon', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Tue', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Wed', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Thu', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Fri', enabled: true, startTime: '09:00', endTime: '17:00' },
  { day: 'Sat', enabled: false, startTime: '10:00', endTime: '14:00' },
  { day: 'Sun', enabled: false, startTime: '10:00', endTime: '14:00' },
];

// Seed Data
const SEED_PROVIDERS: User[] = [
  // US Providers (Keep for legacy/demo)
  {
    id: 'p1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: UserRole.PROVIDER,
    bio: 'Certified master plumber with 15 years experience. Emergency services available.',
    skills: ['Plumbing', 'Pipe Repair', 'Water Heater'],
    hourlyRate: 85,
    serviceRadius: 20,
    isVerified: true,
    verificationStatus: 'APPROVED',
    location: { lat: 37.7749, lng: -122.4194, address: 'Mission District' },
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    availability: DEFAULT_AVAILABILITY,
    portfolio: [
        { id: 'pf1', imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80', description: 'Bathroom pipe fix' },
        { id: 'pf2', imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80', description: 'Water heater installation' }
    ],
    totalEarnings: 1250,
    createdAt: new Date().toISOString()
  },
  // Tamil Nadu Providers
  {
    id: 'tn1',
    name: 'Ravi Kumar',
    email: 'ravi.k@example.com',
    role: UserRole.PROVIDER,
    bio: 'Expert Electrician servicing Chennai and surrounding areas. Industrial and home wiring.',
    skills: ['Electrical', 'Wiring', 'Inverter Installation'],
    hourlyRate: 45,
    serviceRadius: 30,
    isVerified: true,
    verificationStatus: 'APPROVED',
    location: { lat: 13.0827, lng: 80.2707, address: 'Chennai, TN' }, // Chennai
    avatarUrl: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=0D9488&color=fff',
    availability: DEFAULT_AVAILABILITY,
    totalEarnings: 5400,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tn2',
    name: 'Lakshmi Priya',
    email: 'lakshmi@example.com',
    role: UserRole.PROVIDER,
    bio: 'Professional Home Cleaning and Organization. Top rated in Coimbatore.',
    skills: ['Cleaning', 'Deep Clean', 'Housekeeping'],
    hourlyRate: 25,
    serviceRadius: 20,
    isVerified: true,
    verificationStatus: 'APPROVED',
    location: { lat: 11.0168, lng: 76.9558, address: 'Coimbatore, TN' }, // Coimbatore
    avatarUrl: 'https://ui-avatars.com/api/?name=Lakshmi+Priya&background=DB2777&color=fff',
    availability: DEFAULT_AVAILABILITY,
    totalEarnings: 2100,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tn3',
    name: 'Karthik Raja',
    email: 'karthik@example.com',
    role: UserRole.PROVIDER,
    bio: 'AC Mechanic and Repair Specialist. Fast service in Madurai.',
    skills: ['AC Repair', 'Appliance Repair', 'Installation'],
    hourlyRate: 35,
    serviceRadius: 25,
    isVerified: true,
    verificationStatus: 'APPROVED',
    location: { lat: 9.9252, lng: 78.1198, address: 'Madurai, TN' }, // Madurai
    avatarUrl: 'https://ui-avatars.com/api/?name=Karthik+Raja&background=2563EB&color=fff',
    availability: DEFAULT_AVAILABILITY,
    totalEarnings: 3200,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tn4',
    name: 'Senthil Motors',
    email: 'senthil@example.com',
    role: UserRole.PROVIDER,
    bio: 'Car and Bike Mechanic. Breakdown assistance available on highways.',
    skills: ['Mechanic', 'Car Repair', 'Bike Service'],
    hourlyRate: 50,
    serviceRadius: 100,
    isVerified: false,
    verificationStatus: 'PENDING',
    location: { lat: 10.7905, lng: 78.7047, address: 'Trichy, TN' }, // Trichy
    avatarUrl: 'https://ui-avatars.com/api/?name=Senthil+Motors&background=D97706&color=fff',
    availability: DEFAULT_AVAILABILITY,
    totalEarnings: 800,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tn5',
    name: 'Anitha Desai',
    email: 'anitha@example.com',
    role: UserRole.PROVIDER,
    bio: 'Math and Science Tutor for State Board and CBSE.',
    skills: ['Tutoring', 'Math', 'Science'],
    hourlyRate: 20,
    serviceRadius: 15,
    isVerified: true,
    verificationStatus: 'APPROVED',
    location: { lat: 11.6643, lng: 78.1460, address: 'Salem, TN' }, // Salem
    avatarUrl: 'https://ui-avatars.com/api/?name=Anitha+Desai&background=9333EA&color=fff',
    availability: DEFAULT_AVAILABILITY,
    totalEarnings: 1500,
    createdAt: new Date().toISOString()
  }
];

const SEED_ADMIN: User = {
  id: 'admin1',
  name: 'System Admin',
  email: 'admin@skilllink.com',
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString()
};

const SEED_SEEKER: User = {
  id: 's1',
  name: 'Arun Vijay',
  email: 'arun@example.com',
  role: UserRole.SEEKER,
  location: { lat: 13.0827, lng: 80.2707 }, // Chennai
  savedProviderIds: ['tn1'],
  createdAt: new Date().toISOString()
};

const SEED_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'tn1',
    receiverId: 's1',
    content: 'Hi Arun, I can come check the wiring tomorrow.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: false
  }
];

// Initialize Storage
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const users = [...SEED_PROVIDERS, SEED_ADMIN, SEED_SEEKER];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
  }
};

// User Methods
export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const getUserById = (id: string): User | undefined => {
  return getUsers().find(u => u.id === id);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Update current user in session if it matches
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  if (currentUser && currentUser.id === user.id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
};

export const getProviders = (): User[] => {
  return getUsers().filter(u => u.role === UserRole.PROVIDER);
};

// Booking Methods
export const getBookings = (): Booking[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
};

export const createBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

export const updateBookingStatus = (id: string, status: BookingStatus): void => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index >= 0) {
    const booking = bookings[index];
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    
    // If completed, update provider earnings (simplified)
    if (status === BookingStatus.COMPLETED) {
        const users = getUsers();
        const providerIndex = users.findIndex(u => u.id === booking.providerId);
        if (providerIndex >= 0) {
            users[providerIndex].totalEarnings = (users[providerIndex].totalEarnings || 0) + booking.price;
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }
};

// Verification Methods
export const getPendingVerifications = (): User[] => {
  return getUsers().filter(u => u.role === UserRole.PROVIDER && u.verificationStatus === 'PENDING');
};

export const verifyProvider = (providerId: string, approved: boolean): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === providerId);
  if (index >= 0) {
    users[index].verificationStatus = approved ? 'APPROVED' : 'REJECTED';
    users[index].isVerified = approved;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
};

// Message Methods
export const getMessages = (userId: string): Message[] => {
  const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  return allMessages.filter((m: Message) => m.senderId === userId || m.receiverId === userId);
};

export const sendMessage = (message: Message): void => {
  const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  allMessages.push(message);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
};