import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['connection_request', 'connection_accepted', 'new_message', 'job_posted', 'post_like', 'post_comment'],
            required: true,
        },
        referenceId: { type: mongoose.Schema.Types.ObjectId },
        fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
