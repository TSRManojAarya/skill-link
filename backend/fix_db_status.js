import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
dotenv.config();

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        
        // Find all providers with no verification status
        const providers = await User.find({ role: 'PROVIDER', isVerified: false, verificationStatus: 'NONE' });
        console.log(`Found ${providers.length} providers with status: NONE`);

        for (const p of providers) {
            p.verificationStatus = 'PENDING';
            await p.save();
            console.log(`Updated ${p.email} to PENDING`);
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
fix();
