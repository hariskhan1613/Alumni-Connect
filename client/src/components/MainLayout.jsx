import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { connectSocket, getSocket } from '../services/socket';
import { addMessage, setOnlineUsers, addTypingUser, removeTypingUser } from '../store/slices/chatSlice';
import { addNotification, fetchUnreadCount } from '../store/slices/notificationSlice';
import { loadUser } from '../store/slices/authSlice';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user?._id) return;
        dispatch(loadUser());
        const socket = connectSocket(user._id);

        socket.on('receiveMessage', (msg) => {
            dispatch(addMessage(msg));
        });

        socket.on('onlineUsers', (users) => {
            dispatch(setOnlineUsers(users));
        });

        socket.on('userTyping', ({ senderId }) => {
            dispatch(addTypingUser(senderId));
        });

        socket.on('userStoppedTyping', ({ senderId }) => {
            dispatch(removeTypingUser(senderId));
        });

        socket.on('receiveNotification', (notification) => {
            dispatch(addNotification(notification));
            dispatch(fetchUnreadCount());
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('onlineUsers');
            socket.off('userTyping');
            socket.off('userStoppedTyping');
            socket.off('receiveNotification');
        };
    }, [user?._id, dispatch]);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="main-content">
                <div className="page-container animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
