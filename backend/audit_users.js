import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './src/models/User.js';
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        const users = await User.find().select('email role isVerified verificationStatus name createdAt').sort({ createdAt: -1 });
        fs.writeFileSync('full_user_audit.json', JSON.stringify(users, null, 2));
        console.log(`Audited ${users.length} users.`);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
test();
