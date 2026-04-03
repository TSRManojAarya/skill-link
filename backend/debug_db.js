import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
dotenv.config();
const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        const users = await User.find().sort({ createdAt: -1 }).limit(5);
        users.forEach(u => console.log(u.email, u.role, u.isVerified, u.verificationStatus, u._id));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
test();
