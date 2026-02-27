import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
        profilePic: { type: String, default: '' },
        coverImage: { type: String, default: '' },
        bio: { type: String, default: '', maxlength: 500 },
        skills: [{ type: String, trim: true }],
        course: { type: String, default: '' },
        batch: { type: String, default: '' },
        company: { type: String, default: '' },
        jobRole: { type: String, default: '' },
        linkedIn: { type: String, default: '' },
        resume: { type: String, default: '' },
        location: { type: String, default: '' },
        connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        resetPasswordToken: String,
        resetPasswordExpire: Date,

        // AI Profile fields
        cvUrl: { type: String, default: '' },
        targetRole: { type: String, default: '' },
        projects: [{
            title: { type: String, trim: true },
            description: { type: String, default: '' },
            technologies: [String],
            link: { type: String, default: '' },
        }],
        internships: [{
            company: { type: String, trim: true },
            role: { type: String, default: '' },
            duration: { type: String, default: '' },
            description: { type: String, default: '' },
        }],
        certifications: [{
            name: { type: String, trim: true },
            issuer: { type: String, default: '' },
            date: { type: String, default: '' },
            link: { type: String, default: '' },
        }],

        // Scores
        profileStrengthScore: { type: Number, default: 0 },
        roleReadinessScore: { type: Number, default: 0 },
        resumeScore: { type: Number, default: 0 },
        skillGrowthScore: { type: Number, default: 0 },

        // Gamification
        badges: [{
            name: { type: String },
            icon: { type: String, default: '🏆' },
            earnedAt: { type: Date, default: Date.now },
        }],
        credits: { type: Number, default: 10 },

        // Score history for growth tracking
        scoreHistory: [{
            date: { type: Date, default: Date.now },
            profileStrength: { type: Number, default: 0 },
            roleReadiness: { type: Number, default: 0 },
            resumeScore: { type: Number, default: 0 },
        }],
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
