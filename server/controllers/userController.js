import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('connections', 'name profilePic jobRole company');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            'name', 'bio', 'skills', 'course', 'batch', 'company',
            'jobRole', 'linkedIn', 'location', 'profilePic', 'coverImage', 'resume',
        ];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q
            ? { name: { $regex: req.query.q, $options: 'i' } }
            : {};
        const users = await User.find({ ...keyword, _id: { $ne: req.user._id } })
            .select('name profilePic jobRole company batch')
            .limit(20);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAlumniDirectory = async (req, res) => {
    try {
        const { company, batch, skills, jobRole, page = 1, limit = 12 } = req.query;
        const filter = { role: { $in: ['alumni', 'student'] } };
        if (company) filter.company = { $regex: company, $options: 'i' };
        if (batch) filter.batch = batch;
        if (skills) filter.skills = { $in: skills.split(',').map((s) => new RegExp(s.trim(), 'i')) };
        if (jobRole) filter.jobRole = { $regex: jobRole, $options: 'i' };

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        res.json({ users, total, pages: Math.ceil(total / limit), page: Number(page) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const field = req.query.type === 'cover' ? 'coverImage' : 'profilePic';
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { [field]: `/uploads/${req.file.filename}` },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
