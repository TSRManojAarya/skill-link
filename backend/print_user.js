import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        const user = await User.findOne({ email: 'newprov_test99@example.com' });
        console.log("Complete JSON info:");
        console.log(JSON.stringify(user, null, 2));
    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await mongoose.disconnect();
    }
};
test();
