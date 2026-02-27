import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        company: { type: String, required: true, trim: true },
        location: { type: String, default: '' },
        type: { type: String, enum: ['job', 'internship', 'referral'], default: 'job' },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
