import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './src/models/User.js';
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        const users = await User.find().sort({ createdAt: -1 }).limit(10);
        const mapped = users.map(u => ({ email: u.email, role: u.role, status: u.verificationStatus, v: u.isVerified, name: u.name }));
        fs.writeFileSync('db_roles.json', JSON.stringify(mapped, null, 2));
    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};
test();
