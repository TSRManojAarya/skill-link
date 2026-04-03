import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        
        const users = await User.find().sort({ createdAt: -1 }).limit(10);
        console.log("Recent 10 users:");
        users.forEach(u => {
            console.log(`${u.email} - Role: ${u.role} - verified: ${u.isVerified} - status: ${u.verificationStatus}`);
        });
        
    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};
test();
