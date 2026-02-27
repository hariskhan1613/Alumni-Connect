import Referral from '../models/Referral.js';
import User from '../models/User.js';

// Calculate match score between a student and a referral
const calculateMatchScore = (user, referral) => {
    const userSkills = (user.skills || []).map(s => s.toLowerCase());
    const requiredSkills = (referral.requiredSkills || []).map(s => s.toLowerCase());

    // Skill match (60% weight)
    let skillMatches = 0;
    requiredSkills.forEach(skill => {
        if (userSkills.some(us => us.includes(skill) || skill.includes(us))) {
            skillMatches++;
        }
    });
    const skillScore = requiredSkills.length > 0 ? (skillMatches / requiredSkills.length) * 100 : 50;

    // Profile strength (25% weight)
    const profileScore = user.profileStrengthScore || 0;

    // Skill growth (15% weight)
    const growthScore = user.skillGrowthScore || 50;

    const totalMatch = Math.round(skillScore * 0.6 + profileScore * 0.25 + growthScore * 0.15);
    return Math.min(100, totalMatch);
};

// Alumni: Create a referral
export const createReferral = async (req, res) => {
    try {
        const { company, role, description, requiredSkills, minProfileScore, maxApplicants, deadline } = req.body;

        if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only alumni can post referrals' });
        }

        const referral = await Referral.create({
            postedBy: req.user._id,
            company,
            role,
            description,
            requiredSkills: requiredSkills || [],
            minProfileScore: minProfileScore || 0,
            maxApplicants: maxApplicants || 10,
            deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        await referral.populate('postedBy', 'name profilePic company');
        res.status(201).json(referral);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all open referrals
export const getReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find({ status: 'open' })
            .populate('postedBy', 'name profilePic company jobRole')
            .sort({ createdAt: -1 });

        res.json(referrals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Student: Get referrals with match scores
export const getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const referrals = await Referral.find({ status: 'open' })
            .populate('postedBy', 'name profilePic company jobRole');

        const matches = referrals.map(referral => {
            const matchScore = calculateMatchScore(user, referral);
            const meetsMinScore = user.profileStrengthScore >= referral.minProfileScore;
            const existingApp = referral.applicants.find(
                a => a.user.toString() === req.user._id.toString()
            );

            return {
                ...referral.toObject(),
                matchScore,
                meetsMinScore,
                hasApplied: !!existingApp,
                applicationStatus: existingApp?.status || null,
                applicantCount: referral.applicants.filter(a => a.status === 'applied').length,
            };
        });

        // Sort by match score descending
        matches.sort((a, b) => b.matchScore - a.matchScore);

        // Add rank
        matches.forEach((m, i) => { m.rank = i + 1; });

        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Student: Apply to a referral
export const applyToReferral = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id);
        if (!referral) return res.status(404).json({ message: 'Referral not found' });
        if (referral.status !== 'open') return res.status(400).json({ message: 'Referral is no longer open' });

        const user = await User.findById(req.user._id);

        // Check minimum profile score
        if (user.profileStrengthScore < referral.minProfileScore) {
            return res.status(400).json({
                message: `Minimum profile score of ${referral.minProfileScore} required. Your score: ${user.profileStrengthScore}`,
            });
        }

        // Check if already applied
        const alreadyApplied = referral.applicants.find(
            a => a.user.toString() === req.user._id.toString()
        );
        if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

        // Check max applicants
        const appliedCount = referral.applicants.filter(a => a.status === 'applied').length;
        if (appliedCount >= referral.maxApplicants) {
            return res.status(400).json({ message: 'Maximum applicants reached' });
        }

        const matchScore = calculateMatchScore(user, referral);

        referral.applicants.push({
            user: req.user._id,
            matchScore,
            status: 'applied',
            appliedAt: new Date(),
        });

        // Re-rank all applicants
        referral.applicants.sort((a, b) => b.matchScore - a.matchScore);
        referral.applicants.forEach((app, i) => { app.rank = i + 1; });

        await referral.save();
        res.json({ message: 'Application submitted', matchScore, rank: referral.applicants.findIndex(a => a.user.toString() === req.user._id.toString()) + 1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get referral details with ranked applicants
export const getReferralDetails = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id)
            .populate('postedBy', 'name profilePic company')
            .populate('applicants.user', 'name profilePic skills profileStrengthScore');

        if (!referral) return res.status(404).json({ message: 'Referral not found' });
        res.json(referral);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
