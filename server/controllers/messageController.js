import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const newMsg = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            message,
        });
        const populated = await newMsg.populate('sender', 'name profilePic');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConversation = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id },
            ],
        })
            .populate('sender', 'name profilePic')
            .sort({ createdAt: 1 });

        await Message.updateMany(
            { sender: req.params.userId, receiver: req.user._id, read: false },
            { read: true }
        );
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConversations = async (req, res) => {
    try {
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ['$sender', req.user._id] }, '$receiver', '$sender'],
                    },
                    lastMessage: { $first: '$message' },
                    lastMessageAt: { $first: '$createdAt' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$read', false] }] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { lastMessageAt: -1 } },
        ]);

        await Message.populate(messages, { path: '_id', select: 'name profilePic jobRole company', model: 'User' });

        const conversations = messages.map((m) => ({
            user: m._id,
            lastMessage: m.lastMessage,
            lastMessageAt: m.lastMessageAt,
            unreadCount: m.unreadCount,
        }));
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
