import Review from '../models/Review.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Seeker only effectively, or check role)
export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is the seeker of this booking
        if (booking.seeker.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to review this booking' });
        }

        // Check if already reviewed (optional but good)
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'Booking already reviewed' });
        }

        const review = await Review.create({
            booking: bookingId,
            reviewer: req.user.id,
            provider: booking.provider,
            rating,
            comment
        });

        // Update Provider Stats
        const provider = await User.findById(booking.provider);
        if (provider) {
            const reviews = await Review.find({ provider: provider.id });
            const total = reviews.length;
            const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / total;

            provider.totalReviews = total;
            provider.averageRating = avg;
            await provider.save();
        }

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/:providerId
// @access  Public
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
            .populate('reviewer', 'name avatarUrl')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
