import mongoose from 'mongoose';
import dotenv from 'dotenv';
import argon2 from 'argon2';
import User from './src/models/User.js';
import Booking from './src/models/Booking.js';
import Message from './src/models/Message.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing data...');
        await Booking.deleteMany();
        await Message.deleteMany();
        await User.deleteMany();

        console.log('Hashing passwords...');
        const password = await argon2.hash('password123');

        const users = [
            // 1. Admin
            {
                name: 'Admin User',
                email: 'admin@skill-link.com',
                password,
                role: 'ADMIN',
                avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=333&color=fff',
                bio: 'System Administrator'
            },
            // 2. Seeker
            {
                name: 'John Doe',
                email: 'john@example.com',
                password,
                role: 'SEEKER',
                avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
                location: {
                    address: '123 Main St, New York, NY',
                    lat: 40.7128,
                    lng: -74.0060
                }
            },
            // 3. Provider: Plumber
            {
                name: 'Bob The Plumber',
                email: 'bob@example.com',
                password,
                role: 'PROVIDER',
                avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Plumber&background=F59E0B&color=fff',
                bio: 'Expert plumber with 15 years of experience. I fix leaks, clogs, and install new fixtures.',
                location: {
                    address: '456 Market St, New York, NY',
                    lat: 40.7150,
                    lng: -74.0090
                },
                skills: ['Plumbing', 'Pipe Repair', 'Installation'],
                hourlyRate: 800,
                serviceRadius: 20,
                isVerified: true,
                verificationStatus: 'APPROVED',
                availability: [
                    { day: 'Mon', enabled: true, startTime: '08:00', endTime: '18:00' },
                    { day: 'Tue', enabled: true, startTime: '08:00', endTime: '18:00' },
                    { day: 'Wed', enabled: true, startTime: '08:00', endTime: '18:00' },
                    { day: 'Thu', enabled: true, startTime: '08:00', endTime: '18:00' },
                    { day: 'Fri', enabled: true, startTime: '08:00', endTime: '18:00' }
                ],
                portfolio: [
                    { imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=300', description: 'Bathroom Renovation' },
                    { imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=300', description: 'Kitchen Sink Fix' }
                ],
                totalEarnings: 12000
            },
            // 4. Provider: Electrician
            {
                name: 'Alice Electrician',
                email: 'alice@example.com',
                password,
                role: 'PROVIDER',
                avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Electrician&background=10B981&color=fff',
                bio: 'Certified electrician for residential and commercial projects. Safe and reliable.',
                location: {
                    address: '789 Broadway, New York, NY',
                    lat: 40.7200,
                    lng: -74.0020
                },
                skills: ['Electrical', 'Wiring', 'Lighting'],
                hourlyRate: 950,
                serviceRadius: 25,
                isVerified: true,
                verificationStatus: 'APPROVED',
                availability: [
                    { day: 'Mon', enabled: true, startTime: '09:00', endTime: '17:00' },
                    { day: 'Wed', enabled: true, startTime: '09:00', endTime: '17:00' },
                    { day: 'Fri', enabled: true, startTime: '09:00', endTime: '17:00' }
                ]
            },
            // 5. Provider: Carpenter (Pending Verification)
            {
                name: 'Charlie Carpenter',
                email: 'charlie@example.com',
                password,
                role: 'PROVIDER',
                avatarUrl: 'https://ui-avatars.com/api/?name=Charlie+Carpenter&background=8B5CF6&color=fff',
                bio: 'Custom furniture and woodwork.',
                location: {
                    address: '321 5th Ave, New York, NY',
                    lat: 40.7400,
                    lng: -73.9900
                },
                skills: ['Carpentry', 'Woodworking'],
                hourlyRate: 700,
                serviceRadius: 15,
                isVerified: false,
                verificationStatus: 'PENDING'
            }
        ];

        console.log('Creating users...');
        const createdUsers = await User.insertMany(users);

        const seeker = createdUsers.find(u => u.role === 'SEEKER');
        const provider = createdUsers.find(u => u.name === 'Bob The Plumber');

        if (seeker && provider) {
            console.log('Creating sample bookings...');
            const bookings = [
                {
                    seeker: seeker._id,
                    provider: provider._id,
                    status: 'COMPLETED',
                    scheduledDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
                    description: 'Fix leaking sink in kitchen',
                    price: 1600,
                    location: seeker.location?.address || 'Seeker Address'
                },
                {
                    seeker: seeker._id,
                    provider: provider._id,
                    status: 'PENDING',
                    scheduledDate: new Date(Date.now() + 86400000 * 2), // in 2 days
                    description: 'Install new bathroom faucet',
                    price: 800,
                    location: seeker.location?.address || 'Seeker Address'
                }
            ];
            await Booking.insertMany(bookings);

            console.log('Creating sample messages...');
            const messages = [
                {
                    sender: seeker._id,
                    receiver: provider._id,
                    content: 'Hi Bob, are you available next Tuesday?',
                    isRead: true,
                    createdAt: new Date(Date.now() - 86400000 * 2)
                },
                {
                    sender: provider._id,
                    receiver: seeker._id,
                    content: 'Yes, I assume you mean for the faucet installation?',
                    isRead: true,
                    createdAt: new Date(Date.now() - 86400000 * 2 + 3600000)
                },
                {
                    sender: seeker._id,
                    receiver: provider._id,
                    content: 'Exactly!',
                    isRead: false,
                    createdAt: new Date(Date.now() - 86400000 * 2 + 7200000)
                }
            ];
            await Message.insertMany(messages);
        }

        console.log('Data Imported Successfully!');
        console.log('-----------------------------------');
        console.log('Login Credentials (password: password123):');
        users.forEach(u => console.log(`${u.role}: ${u.email}`));
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

importData();
