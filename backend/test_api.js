import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';

dotenv.config();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-link');
        
        let user = await User.findOne({ email: 'test_error_catcher@skill-link.example.com' });
        if (!user) {
            console.log("No user found.");
            process.exit(1);
        }

        const token = generateToken(user._id);

        const payload = {
            id: user._id,
            name: 'Updated Name',
            email: user.email,
            bio: 'Some bio',
            skills: ['Plumbing'],
            hourlyRate: 50,
            serviceRadius: 20,
            portfolio: [
                {
                    id: '12345',
                    imageUrl: 'data:image/jpeg;base64,1234',
                    description: 'test'
                }
            ],
            // Simulate formData sending some empty fields
            password: ""
        };

        console.log("Sending Profile Update Request...");
        const response = await fetch('http://localhost:5001/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", data);

    } catch (e) {
        console.error("Setup error:", e);
    } finally {
        await mongoose.disconnect();
    }
};

test();
