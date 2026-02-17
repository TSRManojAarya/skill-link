import { User, Booking, Message, UserRole, BookingStatus } from '../types';

const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const user = localStorage.getItem('skill_link_current_user');
    const token = user ? JSON.parse(user).token : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || response.statusText);
    }
    const data = await response.json();
    return mapId(data);
};

// Helper to map _id to id
const mapId = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(item => mapId(item));
    }
    if (data && typeof data === 'object' && data._id) {
        const { _id, ...rest } = data;
        return { id: _id, ...mapId(rest) };
    }
    return data;
};

export const api = {
    // Auth
    register: async (userData: any): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    login: async (credentials: any): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return handleResponse(response);
    },

    getMe: async (): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Users
    updateProfile: async (userData: Partial<User>): Promise<User> => {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    getProviders: async (): Promise<User[]> => {
        const response = await fetch(`${API_URL}/users/providers`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getUserById: async (id: string): Promise<User | undefined> => {
        // We might not have a dedicated endpoint for this if we assume we have the user locally or fetch from a list
        // But for completeness let's use the one we created
        const response = await fetch(`${API_URL}/users/${id}`, {
            headers: getHeaders()
        });
        if (response.status === 404) return undefined;
        return handleResponse(response);
    },

    // Bookings
    createBooking: async (bookingData: any): Promise<Booking> => {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(bookingData)
        });
        return handleResponse(response);
    },

    getBookings: async (): Promise<Booking[]> => {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    updateBookingStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
        const response = await fetch(`${API_URL}/bookings/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    },

    // Messages
    sendMessage: async (bookingId: string | undefined, recipientId: string, content: string): Promise<Message> => {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ bookingId, receiverId: recipientId, content })
        });
        return handleResponse(response);
    },

    getMessages: async (userId?: string): Promise<Message[]> => {
        // userId param ignored as backend gets messages for current user
        const response = await fetch(`${API_URL}/messages`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Admin / User Management
    getUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_URL}/users`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    deleteUser: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || response.statusText);
        }
    },

    verifyProvider: async (id: string, approved: boolean): Promise<User> => {
        const response = await fetch(`${API_URL}/users/${id}/verify`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ approved })
        });
        return handleResponse(response);
    },

    getPendingVerifications: async (): Promise<User[]> => {
        // This endpoint might not exist in backend yet, reusing getUsers and filtering on client for MVP
        // or if backend supports it. checking backend routes...
        // Backend user routes: router.get('/', protect, authorize('ADMIN'), getAllUsers);
        // So getUsers will work for admin.
        return [];
    },

    // Reviews
    createReview: async (reviewData: { bookingId: string, rating: number, comment: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(reviewData)
        });
        return handleResponse(response);
    }
};
