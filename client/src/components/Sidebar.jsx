import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { disconnectSocket } from '../services/socket';
import { Home, Users, MessageSquare, Briefcase, Bell, User, Shield, LogOut, X, GraduationCap, ChevronRight, LayoutDashboard, Sparkles, FileText, UserCheck, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        disconnectSocket();
        dispatch(logout());
        navigate('/login');
    };

    const links = [
        { to: '/', icon: Home, label: 'Home Feed' },
        { to: '/directory', icon: Users, label: 'Alumni Directory' },
        { to: '/chat', icon: MessageSquare, label: 'Messages' },
        { to: '/jobs', icon: Briefcase, label: 'Opportunities' },
        { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
        { to: `/profile/${user?._id}`, icon: User, label: 'My Profile' },
    ];

    const aiLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/ai-profile', icon: Sparkles, label: 'AI Profile' },
        { to: '/resume', icon: FileText, label: 'Resume Optimizer' },
        { to: '/referrals', icon: UserCheck, label: 'Referrals' },
        { to: '/sessions', icon: Calendar, label: 'Sessions' },
        { to: '/skill-growth', icon: TrendingUp, label: 'Skill Growth' },
    ];

    if (user?.role === 'admin') {
        links.push({ to: '/admin', icon: Shield, label: 'Admin Panel' });
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-40 md:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <aside
                className={`fixed top-0 left-0 h-full z-50 w-[280px] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
                style={{
                    background: 'var(--sidebar-bg)',
                    borderRight: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                {/* Logo Area - big and spacious */}
                <div
                    className="flex items-center justify-between"
                    style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)' }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '14px',
                                background: 'var(--primary-gradient)',
                                boxShadow: 'var(--shadow-glow)',
                            }}
                        >
                            <GraduationCap size={24} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                                Alumni Connect
                            </h1>
                            <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                                LPU Network
                            </p>
                        </div>
                    </div>
                    <button className="md:hidden p-2 rounded-lg" onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0 12px', marginBottom: '12px' }}>
                        Menu
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {links.map(({ to, icon: Icon, label, badge }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={onClose}
                                className="group"
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    background: isActive ? 'var(--primary-gradient)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                                })}
                            >
                                <Icon size={20} style={{ flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{label}</span>
                                {badge > 0 && (
                                    <span style={{
                                        width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '50%', fontSize: '10px', fontWeight: '700', color: 'white', background: 'var(--danger)',
                                    }}>
                                        {badge > 9 ? '9+' : badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* AI Tools Section */}
                    <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0 12px', marginBottom: '12px', marginTop: '20px' }}>
                        AI Tools
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {aiLinks.map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={onClose}
                                className="group"
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    background: isActive ? 'var(--primary-gradient)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                                })}
                            >
                                <Icon size={20} style={{ flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User Card & Logout */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <div
                        onClick={() => { navigate(`/profile/${user?._id}`); onClose(); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                            borderRadius: '14px', background: 'var(--bg-tertiary)', cursor: 'pointer', marginBottom: '12px',
                        }}
                    >
                        <img
                            src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                            alt={user?.name}
                            style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.name}
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                {user?.role}
                            </p>
                        </div>
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px',
                            borderRadius: '14px', fontSize: '14px', fontWeight: '500', color: 'var(--danger)',
                            background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
