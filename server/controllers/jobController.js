import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createJob = async (req, res) => {
    try {
        const { title, description, company, location, type } = req.body;
        const job = await Job.create({
            title, description, company, location,
            type: type || 'job',
            postedBy: req.user._id,
        });
        const populated = await job.populate('postedBy', 'name profilePic');

        // Notify all students about new job
        const students = await User.find({ role: 'student' }).select('_id');
        const notifications = students.map((s) => ({
            user: s._id,
            type: 'job_posted',
            fromUser: req.user._id,
            referenceId: job._id,
            message: `New ${type || 'job'}: ${title} at ${company}`,
        }));
        if (notifications.length) await Notification.insertMany(notifications);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getJobs = async (req, res) => {
    try {
        const { type, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (type) filter.type = type;
        const total = await Job.countDocuments(filter);
        const jobs = await Job.find(filter)
            .populate('postedBy', 'name profilePic company')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        res.json({ jobs, total, pages: Math.ceil(total / limit), page: Number(page) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name profilePic company')
            .populate('applicants', 'name profilePic email');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.applicants.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already applied' });
        }
        job.applicants.push(req.user._id);
        await job.save();
        res.json({ message: 'Applied successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await job.deleteOne();
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
