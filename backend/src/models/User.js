import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
    day: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' }
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    description: { type: String }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please add a name'] },
    email: { type: String, required: [true, 'Please add an email'], unique: true },
    password: { type: String, required: [true, 'Please add a password'] },
    role: { type: String, enum: ['SEEKER', 'PROVIDER', 'ADMIN'], default: 'SEEKER' },
    avatarUrl: { type: String },
    bio: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    // Provider specific fields
    skills: [{ type: String }],
    hourlyRate: { type: Number },
    serviceRadius: { type: Number },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
        type: String,
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NONE'
    },
    availability: [availabilitySchema],
    portfolio: [portfolioSchema],
    todayEarnings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    // Seeker specific fields
    savedProviderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
