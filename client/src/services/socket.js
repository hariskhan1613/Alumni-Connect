import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
let socket = null;

export const connectSocket = (userId) => {
    if (socket?.connected) return socket;
    socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.emit('setup', userId);
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
