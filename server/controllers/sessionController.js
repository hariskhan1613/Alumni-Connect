import Session from '../models/Session.js';
import User from '../models/User.js';

// Calculate session relevance for a student
const calculateRelevance = (user, session) => {
    const userSkills = (user.skills || []).map(s => s.toLowerCase());
    const sessionDomain = (session.domain || '').toLowerCase();
    const targetRole = (user.targetRole || '').toLowerCase();

    let relevance = 0;

    // Domain match with user skills
    if (userSkills.some(s => sessionDomain.includes(s) || s.includes(sessionDomain))) {
        relevance += 40;
    }

    // Domain match with target role
    if (targetRole && (sessionDomain.includes(targetRole) || targetRole.includes(sessionDomain))) {
        relevance += 30;
    }

    // Partial keyword matches
    const sessionWords = sessionDomain.split(/[\s,]+/);
    const matchCount = sessionWords.filter(w =>
        userSkills.some(s => s.includes(w) || w.includes(s))
    ).length;
    relevance += Math.min(30, matchCount * 10);

    return Math.min(100, relevance);
};

// Create session (alumni/faculty)
export const createSession = async (req, res) => {
    try {
        if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only alumni and admins can create sessions' });
        }

        const { title, description, domain, type, dateTime, duration, maxParticipants, creditCost } = req.body;

        const session = await Session.create({
            host: req.user._id,
            title,
            description,
            domain,
            type: type || 'group',
            dateTime: new Date(dateTime),
            duration: duration || 60,
            maxParticipants: type === '1:1' ? 1 : (maxParticipants || 30),
            creditCost: creditCost || 1,
        });

        await session.populate('host', 'name profilePic company jobRole');
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all sessions with optional domain filter
export const getSessions = async (req, res) => {
    try {
        const { domain } = req.query;
        const filter = { status: { $in: ['upcoming', 'ongoing'] } };
        if (domain) filter.domain = { $regex: domain, $options: 'i' };

        const sessions = await Session.find(filter)
            .populate('host', 'name profilePic company jobRole')
            .sort({ dateTime: 1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get recommended sessions (with relevance %)
export const getRecommendedSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const sessions = await Session.find({ status: { $in: ['upcoming', 'ongoing'] } })
            .populate('host', 'name profilePic company jobRole')
            .sort({ dateTime: 1 });

        const recommended = sessions.map(session => {
            const relevance = calculateRelevance(user, session);
            const isBooked = session.participants.some(
                p => p.user.toString() === req.user._id.toString()
            );
            return {
                ...session.toObject(),
                relevance,
                isBooked,
                spotsLeft: session.maxParticipants - session.participants.length,
            };
        });

        recommended.sort((a, b) => b.relevance - a.relevance);
        res.json(recommended);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Book a session
export const bookSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.status !== 'upcoming') return res.status(400).json({ message: 'Session is not available for booking' });

        // Check if already booked
        const alreadyBooked = session.participants.some(
            p => p.user.toString() === req.user._id.toString()
        );
        if (alreadyBooked) return res.status(400).json({ message: 'Already booked' });

        // Check capacity
        if (session.participants.length >= session.maxParticipants) {
            return res.status(400).json({ message: 'Session is full' });
        }

        // Check credits
        const user = await User.findById(req.user._id);
        if (user.credits < session.creditCost) {
            return res.status(400).json({ message: `Not enough credits. Need ${session.creditCost}, have ${user.credits}` });
        }

        // Deduct credits
        user.credits -= session.creditCost;
        await user.save();

        session.participants.push({ user: req.user._id });
        await session.save();

        res.json({
            message: 'Session booked successfully',
            remainingCredits: user.credits,
            session,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get my bookings
export const getMyBookings = async (req, res) => {
    try {
        const sessions = await Session.find({
            'participants.user': req.user._id,
        })
            .populate('host', 'name profilePic company jobRole')
            .sort({ dateTime: 1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rate a session
export const rateSession = async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Check if participated
        const participated = session.participants.some(
            p => p.user.toString() === req.user._id.toString()
        );
        if (!participated) return res.status(400).json({ message: 'You did not attend this session' });

        // Check if already rated
        const alreadyRated = session.ratings.some(
            r => r.user.toString() === req.user._id.toString()
        );
        if (alreadyRated) return res.status(400).json({ message: 'Already rated' });

        session.ratings.push({
            user: req.user._id,
            rating: Math.min(5, Math.max(1, rating)),
            feedback: feedback || '',
        });

        await session.save();
        res.json({ message: 'Rating submitted', session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
