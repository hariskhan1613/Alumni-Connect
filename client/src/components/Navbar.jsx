import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUnreadCount } from '../store/slices/notificationSlice';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import API from '../services/api';

const Navbar = ({ onMenuToggle }) => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const { unreadCount } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        dispatch(fetchUnreadCount());
        const interval = setInterval(() => dispatch(fetchUnreadCount()), 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleSearch = async (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q.length < 2) { setSearchResults([]); setShowSearch(false); return; }
        try {
            const { data } = await API.get(`/users/search?q=${q}`);
            setSearchResults(data);
            setShowSearch(true);
        } catch { setSearchResults([]); }
    };

    return (
        <header
            className="fixed top-0 right-0 z-30 flex items-center justify-between"
            style={{
                left: '280px',
                height: '76px',
                padding: '0 32px',
                background: 'var(--sidebar-bg)',
                borderBottom: '1px solid var(--border)',
                boxShadow: 'var(--shadow-xs)',
            }}
        >
            <style>{`@media (max-width: 768px) { header { left: 0 !important; padding: 0 16px !important; } }`}</style>

            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 rounded-xl" style={{ color: 'var(--text-secondary)' }} onClick={onMenuToggle}>
                    <Menu size={24} />
                </button>
                <div className="relative hidden sm:block">
                    <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                        onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                        className="input-field pl-11"
                        style={{ width: '340px', padding: '12px 18px 12px 48px', borderRadius: '14px', background: 'var(--bg-tertiary)', fontSize: '14px' }}
                    />
                    {showSearch && searchResults.length > 0 && (
                        <div
                            style={{
                                position: 'absolute', top: '100%', marginTop: '10px', width: '100%',
                                borderRadius: '16px', padding: '8px', background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', zIndex: 50,
                            }}
                        >
                            {searchResults.map((u) => (
                                <button
                                    key={u._id}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                                        padding: '12px', textAlign: 'left', borderRadius: '12px', border: 'none',
                                        background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    onClick={() => { navigate(`/profile/${u._id}`); setShowSearch(false); setSearchQuery(''); }}
                                >
                                    <img
                                        src={u.profilePic || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff&size=36`}
                                        alt={u.name}
                                        style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '600' }}>{u.name}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {u.jobRole}{u.company ? ` at ${u.company}` : ''}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate('/notifications')}
                    style={{
                        position: 'relative', padding: '10px', borderRadius: '12px',
                        color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                            fontSize: '10px', fontWeight: '700', color: 'white', background: 'var(--danger)',
                            boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                        }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                        padding: '10px', borderRadius: '12px', color: 'var(--text-secondary)',
                        background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                    {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                </button>
            </div>
        </header>
    );
};

export default Navbar;
