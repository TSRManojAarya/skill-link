import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        
        let user = await User.findOne({ email: 'test_error_catcher@skill-link.example.com' });
        if (!user) {
            user = await User.create({
                name: 'Test Catcher',
                email: 'test_error_catcher@skill-link.example.com',
                password: 'password123',
                role: 'PROVIDER'
            });
        }

        // Simulate update
        user.name = 'Updated Name';
        user.bio = 'Some bio';
        user.skills = ['Plumbing'];
        user.hourlyRate = Number("50");
        user.serviceRadius = Number("20");
        
        user.portfolio = [
            {
                id: '12345',
                imageUrl: 'data:image/jpeg;base64,1234',
                description: 'test'
            }
        ];

        try {
            await user.save();
            console.log("SUCCESS!");
        } catch (err) {
            console.error("FAIL:", err.message);
        }
        
    } catch (e) {
        console.error("Setup error:", e);
    } finally {
        await mongoose.disconnect();
    }
};

test();
