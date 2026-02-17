import Booking from '../models/Booking.js';
import User from '../models/User.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        console.log("Create Booking Body:", req.body);
        const { providerId, scheduledDate, description, price, location } = req.body;

        if (!providerId || !scheduledDate || !description || price === undefined) {
            console.log("Missing fields");
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const booking = await Booking.create({
            seeker: req.user.id,
            provider: providerId,
            scheduledDate,
            description,
            price,
            location,
            status: 'PENDING'
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error("Booking Create Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
    try {
        let query;
        if (req.user.role === 'SEEKER') {
            query = { seeker: req.user.id };
        } else if (req.user.role === 'PROVIDER') {
            query = { provider: req.user.id };
        } else {
            // Admin sees all? Or maybe empty for now
            query = {};
        }

        const bookings = await Booking.find(query)
            .populate('seeker', 'name email avatarUrl')
            .populate('provider', 'name email avatarUrl')
            .sort({ createdAt: -1 });

        // Transform to match frontend expected format slightly if needed, 
        // but better to align frontend to use 'seeker' and 'provider' objects or just IDs
        // The frontend expects: { id, seekerId, providerId, ... }
        // We will return standard mongoose objects but frontend might need adjustment or we map here.
        // For now, let's map it to match frontend "Booking" interface which uses string IDs

        const formattedBookings = bookings.map(b => ({
            id: b._id,
            seekerId: b.seeker._id,
            providerId: b.provider._id,
            status: b.status,
            scheduledDate: b.scheduledDate,
            description: b.description,
            price: b.price,
            location: b.location,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt,
            // Include hydrated objects if frontend wants them, but types say IDs.
            // The frontend 'getBooking' logic might rely on 'getUserById' separately.
        }));

        res.json(formattedBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        // Provider can Accept, Reject, Start, Complete
        // Seeker can Cancel

        // Simplification for MVP: allow if involved
        if (booking.seeker.toString() !== req.user.id && booking.provider.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking.status = status;
        const updatedBooking = await booking.save();

        // If completed, update provider earnings
        if (status === 'COMPLETED') {
            const provider = await User.findById(booking.provider);
            if (provider) {
                provider.totalEarnings = (provider.totalEarnings || 0) + booking.price;
                await provider.save();
            }
        }

        res.json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
