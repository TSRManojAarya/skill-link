import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        
        // Final Fix: All Providers must have a location and status
        const providers = await User.find({ role: 'PROVIDER' });
        console.log(`Migrating ${providers.length} providers...`);

        for (const p of providers) {
            let changed = false;
            
            // 1. Ensure location exists
            if (!p.location || !p.location.lat || !p.location.lng) {
                p.location = {
                    lat: 40.7128,
                    lng: -74.0060,
                    address: 'New York, NY'
                };
                changed = true;
                console.log(`Added location to ${p.email}`);
            }

            // 2. Ensure verificationStatus is not NONE if they are unverified
            if (!p.isVerified && p.verificationStatus === 'NONE') {
                p.verificationStatus = 'PENDING';
                changed = true;
                console.log(`Updated status to PENDING for ${p.email}`);
            }

            if (changed) {
                await p.save();
            }
        }
        
        console.log("Migration complete.");
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
migrate();
