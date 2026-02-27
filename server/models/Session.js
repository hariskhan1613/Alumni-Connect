import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        domain: { type: String, required: true, trim: true },
        type: { type: String, enum: ['group', '1:1'], default: 'group' },
        dateTime: { type: Date, required: true },
        duration: { type: Number, default: 60 }, // minutes
        maxParticipants: { type: Number, default: 30 },
        participants: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            bookedAt: { type: Date, default: Date.now },
        }],
        ratings: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 },
            feedback: { type: String, default: '' },
        }],
        status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
        creditCost: { type: Number, default: 1 },
    },
    { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
