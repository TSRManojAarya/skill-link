import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'],
        default: 'PENDING'
    },
    scheduledDate: { type: Date, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    }
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
