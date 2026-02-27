const onlineUsers = new Map();

export const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('setup', (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.join(userId);
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });

        socket.on('sendMessage', (data) => {
            const { receiverId, message, senderId, senderName, senderPic } = data;
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit('receiveMessage', {
                    senderId,
                    senderName,
                    senderPic,
                    message,
                    createdAt: new Date(),
                });
            }
        });

        socket.on('typing', ({ receiverId, senderId }) => {
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit('userTyping', { senderId });
            }
        });

        socket.on('stopTyping', ({ receiverId, senderId }) => {
            const receiverSocket = onlineUsers.get(receiverId);
            if (receiverSocket) {
                io.to(receiverSocket).emit('userStoppedTyping', { senderId });
            }
        });

        socket.on('newNotification', ({ userId, notification }) => {
            const userSocket = onlineUsers.get(userId);
            if (userSocket) {
                io.to(userSocket).emit('receiveNotification', notification);
            }
        });

        socket.on('disconnect', () => {
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
            console.log('User disconnected:', socket.id);
        });
    });
};
