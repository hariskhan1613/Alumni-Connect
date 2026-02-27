import Connection from '../models/Connection.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const sendRequest = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot connect with yourself' });
        }
        const existing = await Connection.findOne({
            $or: [
                { sender: req.user._id, receiver: receiverId },
                { sender: receiverId, receiver: req.user._id },
            ],
        });
        if (existing) {
            return res.status(400).json({ message: 'Connection already exists' });
        }
        const connection = await Connection.create({ sender: req.user._id, receiver: receiverId });
        await Notification.create({
            user: receiverId,
            type: 'connection_request',
            fromUser: req.user._id,
            referenceId: connection._id,
            message: `${req.user.name} sent you a connection request`,
        });
        res.status(201).json(connection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const acceptRequest = async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ message: 'Request not found' });
        if (connection.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        connection.status = 'accepted';
        await connection.save();

        await User.findByIdAndUpdate(connection.sender, { $addToSet: { connections: connection.receiver } });
        await User.findByIdAndUpdate(connection.receiver, { $addToSet: { connections: connection.sender } });

        await Notification.create({
            user: connection.sender,
            type: 'connection_accepted',
            fromUser: req.user._id,
            referenceId: connection._id,
            message: `${req.user.name} accepted your connection request`,
        });
        res.json(connection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectRequest = async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) return res.status(404).json({ message: 'Request not found' });
        if (connection.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        connection.status = 'rejected';
        await connection.save();
        res.json({ message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConnections = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('connections', 'name profilePic jobRole company batch');
        res.json(user.connections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Connection.find({ receiver: req.user._id, status: 'pending' })
            .populate('sender', 'name profilePic jobRole company');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConnectionStatus = async (req, res) => {
    try {
        const connection = await Connection.findOne({
            $or: [
                { sender: req.user._id, receiver: req.params.id },
                { sender: req.params.id, receiver: req.user._id },
            ],
        });
        res.json({ connection });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
