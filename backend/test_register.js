import fetch from 'node-fetch'; // if available, or just use mongoose directly.. let's just use mongoose.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        
        let users = await User.find({ email: 'test_admin_see@example.com' });
        if (users.length > 0) {
            await User.deleteMany({ email: 'test_admin_see@example.com' });
        }

        const role = 'PROVIDER';
        const name = "Test Admin See";
        const email = "test_admin_see@example.com";

        const user = await User.create({
            name,
            email,
            password: "hashedPassword",
            role: role || 'SEEKER',
            verificationStatus: role === 'PROVIDER' ? 'PENDING' : 'NONE',
            location: role === 'PROVIDER' ? { lat: 40.7128, lng: -74.0060, address: 'New York, NY' } : undefined,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            availability: role === 'PROVIDER' ? [
                { day: 'Mon', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Tue', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Wed', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Thu', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Fri', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Sat', enabled: false, startTime: '10:00', endTime: '14:00' },
                { day: 'Sun', enabled: false, startTime: '10:00', endTime: '14:00' }
            ] : []
        });

        console.log("Created user:");
        console.log("Role:", user.role);
        console.log("isVerified:", user.isVerified);
        console.log("verificationStatus:", user.verificationStatus);
        
    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};
test();
