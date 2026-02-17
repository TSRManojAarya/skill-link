import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'SEEKER',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            availability: role === 'PROVIDER' ? [
                { day: 'Mon', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Tue', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Wed', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Thu', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Fri', enabled: true, startTime: '09:00', endTime: '17:00' },
                { day: 'Sat', enabled: false, startTime: '10:00', endTime: '14:00' },
                { day: 'Sun', enabled: false, startTime: '10:00', endTime: '14:00' },
            ] : []
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await argon2.verify(user.password, password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                // Include other necessary fields for frontend state
                bio: user.bio,
                location: user.location,
                isVerified: user.isVerified,
                // Provider specific
                skills: user.skills,
                hourlyRate: user.hourlyRate,
                serviceRadius: user.serviceRadius,
                availability: user.availability,
                portfolio: user.portfolio,
                totalEarnings: user.totalEarnings,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
