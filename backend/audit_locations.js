import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './src/models/User.js';
dotenv.config();

const audit = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        const providers = await User.find({ role: 'PROVIDER' }).select('email isVerified verificationStatus location name');
        fs.writeFileSync('provider_audit_detailed.json', JSON.stringify(providers, null, 2));
        console.log(`Audited ${providers.length} providers.`);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
audit();
