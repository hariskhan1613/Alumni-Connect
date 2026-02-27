import User from '../models/User.js';
import Post from '../models/Post.js';
import Job from '../models/Job.js';
import Connection from '../models/Connection.js';

export const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalPosts, totalJobs, totalConnections] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Job.countDocuments(),
            Connection.countDocuments({ status: 'accepted' }),
        ]);
        const roleStats = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);
        res.json({ totalUsers, totalPosts, totalJobs, totalConnections, roleStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const total = await User.countDocuments();
        const users = await User.find()
            .select('-password')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        res.json({ users, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });
        await Post.deleteMany({ user: req.params.id });
        await Connection.deleteMany({ $or: [{ sender: req.params.id }, { receiver: req.params.id }] });
        await user.deleteOne();
        res.json({ message: 'User and associated data deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const total = await Post.countDocuments();
        const posts = await Post.find()
            .populate('user', 'name profilePic')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ posts, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePostAdmin = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'name profilePic').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteJobAdmin = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        await job.deleteOne();
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
