import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
    {
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        company: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        requiredSkills: [{ type: String, trim: true }],
        minProfileScore: { type: Number, default: 0 },
        maxApplicants: { type: Number, default: 10 },
        applicants: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            matchScore: { type: Number, default: 0 },
            rank: { type: Number, default: 0 },
            status: { type: String, enum: ['eligible', 'applied', 'shortlisted', 'rejected'], default: 'eligible' },
            appliedAt: { type: Date },
        }],
        status: { type: String, enum: ['open', 'closed', 'filled'], default: 'open' },
        deadline: { type: Date },
    },
    { timestamps: true }
);

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;
