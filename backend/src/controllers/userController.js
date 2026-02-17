import argon2 from 'argon2';
import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = await argon2.hash(req.body.password);
            }
            user.bio = req.body.bio || user.bio;
            user.location = req.body.location || user.location;
            user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

            // Provider specific updates
            if (user.role === 'PROVIDER') {
                user.skills = req.body.skills || user.skills;
                user.hourlyRate = req.body.hourlyRate || user.hourlyRate;
                user.serviceRadius = req.body.serviceRadius || user.serviceRadius;
                user.availability = req.body.availability || user.availability;
                user.portfolio = req.body.portfolio || user.portfolio;
            }

            // Seeker specific (reserved for future use if needed)

            const updatedUser = await user.save();

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatarUrl: updatedUser.avatarUrl,
                bio: updatedUser.bio,
                location: updatedUser.location,
                isVerified: updatedUser.isVerified,
                skills: updatedUser.skills,
                hourlyRate: updatedUser.hourlyRate,
                serviceRadius: updatedUser.serviceRadius,
                availability: updatedUser.availability,
                portfolio: updatedUser.portfolio,
                totalEarnings: updatedUser.totalEarnings,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all providers
// @route   GET /api/users/providers
// @access  Public
export const getProviders = async (req, res) => {
    try {
        const providers = await User.find({ role: 'PROVIDER' }).select('-password');
        res.json(providers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify provider (Admin)
// @route   POST /api/users/:id/verify
// @access  Private/Admin
export const verifyProvider = async (req, res) => {
    try {
        const { approved } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = approved;
        user.verificationStatus = approved ? 'APPROVED' : 'REJECTED';

        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
