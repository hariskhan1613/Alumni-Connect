import User from '../models/User.js';

// Badge definitions
const BADGE_DEFINITIONS = [
    { name: 'Profile Starter', icon: '🌱', condition: (u) => u.profileStrengthScore >= 20, desc: 'Profile strength reached 20%' },
    { name: 'Profile Builder', icon: '🏗️', condition: (u) => u.profileStrengthScore >= 50, desc: 'Profile strength reached 50%' },
    { name: 'Profile Master', icon: '👑', condition: (u) => u.profileStrengthScore >= 80, desc: 'Profile strength reached 80%' },
    { name: 'Skill Collector', icon: '🎯', condition: (u) => (u.skills || []).length >= 5, desc: 'Added 5+ skills' },
    { name: 'Skill Expert', icon: '💎', condition: (u) => (u.skills || []).length >= 10, desc: 'Added 10+ skills' },
    { name: 'Project Builder', icon: '🚀', condition: (u) => (u.projects || []).length >= 2, desc: 'Added 2+ projects' },
    { name: 'Project Champion', icon: '🏆', condition: (u) => (u.projects || []).length >= 4, desc: 'Added 4+ projects' },
    { name: 'Intern Ready', icon: '💼', condition: (u) => (u.internships || []).length >= 1, desc: 'Added internship experience' },
    { name: 'Certified Pro', icon: '📜', condition: (u) => (u.certifications || []).length >= 2, desc: 'Earned 2+ certifications' },
    { name: 'Resume Ready', icon: '📄', condition: (u) => u.resumeScore >= 60, desc: 'ATS score reached 60%' },
    { name: 'Resume Master', icon: '✨', condition: (u) => u.resumeScore >= 80, desc: 'ATS score reached 80%' },
    { name: 'Role Focused', icon: '🎯', condition: (u) => !!u.targetRole, desc: 'Selected a target career role' },
    { name: 'Career Ready', icon: '🔥', condition: (u) => u.roleReadinessScore >= 70, desc: 'Role readiness reached 70%' },
    { name: 'Networker', icon: '🤝', condition: (u) => (u.connections || []).length >= 5, desc: 'Made 5+ connections' },
    { name: 'Growth Mindset', icon: '📈', condition: (u) => (u.scoreHistory || []).length >= 5, desc: 'Tracked progress 5+ times' },
];

// Get leaderboard (top 10 students)
export const getLeaderboard = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name profilePic profileStrengthScore roleReadinessScore resumeScore skillGrowthScore badges')
            .sort({ profileStrengthScore: -1 })
            .limit(10);

        const leaderboard = students.map((student, index) => {
            const compositeScore = Math.round(
                (student.profileStrengthScore * 0.3) +
                (student.roleReadinessScore * 0.25) +
                (student.resumeScore * 0.25) +
                (student.skillGrowthScore * 0.2)
            );
            return {
                rank: index + 1,
                _id: student._id,
                name: student.name,
                profilePic: student.profilePic,
                compositeScore,
                profileStrength: student.profileStrengthScore,
                roleReadiness: student.roleReadinessScore,
                resumeScore: student.resumeScore,
                skillGrowth: student.skillGrowthScore,
                badgeCount: (student.badges || []).length,
            };
        });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user badges
export const getBadges = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const earnedBadges = user.badges || [];
        const allBadges = BADGE_DEFINITIONS.map(badge => {
            const earned = earnedBadges.find(b => b.name === badge.name);
            return {
                name: badge.name,
                icon: badge.icon,
                description: badge.desc,
                earned: !!earned,
                earnedAt: earned?.earnedAt || null,
            };
        });

        res.json({
            earned: allBadges.filter(b => b.earned),
            available: allBadges.filter(b => !b.earned),
            total: allBadges.length,
            earnedCount: allBadges.filter(b => b.earned).length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get progress data
export const getProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            scoreHistory: user.scoreHistory || [],
            currentScores: {
                profileStrength: user.profileStrengthScore || 0,
                roleReadiness: user.roleReadinessScore || 0,
                resumeScore: user.resumeScore || 0,
                skillGrowth: user.skillGrowthScore || 0,
            },
            skills: user.skills || [],
            projectCount: (user.projects || []).length,
            certCount: (user.certifications || []).length,
            internshipCount: (user.internships || []).length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check and award badges
export const checkBadges = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const existingNames = (user.badges || []).map(b => b.name);
        const newBadges = [];

        BADGE_DEFINITIONS.forEach(badge => {
            if (!existingNames.includes(badge.name) && badge.condition(user)) {
                newBadges.push({
                    name: badge.name,
                    icon: badge.icon,
                    earnedAt: new Date(),
                });
            }
        });

        if (newBadges.length > 0) {
            user.badges = [...(user.badges || []), ...newBadges];
            await user.save();
        }

        res.json({
            newBadges,
            totalBadges: user.badges.length,
            message: newBadges.length > 0
                ? `🎉 You earned ${newBadges.length} new badge(s)!`
                : 'No new badges earned yet. Keep improving!',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get dashboard summary for student
export const getDashboardSummary = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const compositeScore = Math.round(
            (user.profileStrengthScore || 0) * 0.3 +
            (user.roleReadinessScore || 0) * 0.25 +
            (user.resumeScore || 0) * 0.25 +
            (user.skillGrowthScore || 0) * 0.2
        );

        res.json({
            profileStrength: user.profileStrengthScore || 0,
            roleReadiness: user.roleReadinessScore || 0,
            resumeScore: user.resumeScore || 0,
            skillGrowth: user.skillGrowthScore || 0,
            compositeScore,
            targetRole: user.targetRole || '',
            badgeCount: (user.badges || []).length,
            credits: user.credits || 10,
            skillCount: (user.skills || []).length,
            projectCount: (user.projects || []).length,
            recentHistory: (user.scoreHistory || []).slice(-7),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
