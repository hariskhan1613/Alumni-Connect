import { useState, useEffect } from 'react';
import API from '../services/api';
import { motion } from 'framer-motion';
import { Users, FileText, Briefcase, Link2, Trash2, BarChart3, TrendingUp, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchData(); }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'overview' || !stats) {
                const { data } = await API.get('/admin/stats');
                setStats(data);
            }
            if (activeTab === 'users') {
                const { data } = await API.get('/admin/users');
                setUsers(data.users);
            }
            if (activeTab === 'posts') {
                const { data } = await API.get('/admin/posts');
                setPosts(data.posts);
            }
            if (activeTab === 'jobs') {
                const { data } = await API.get('/admin/jobs');
                setJobs(data);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load admin data';
            setError(msg);
            toast.error(msg);
        }
        setLoading(false);
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user and all their data?')) return;
        try {
            await API.delete(`/admin/users/${id}`);
            setUsers(users.filter((u) => u._id !== id));
            if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
            toast.success('User deleted');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete user'); }
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Delete this post?')) return;
        try {
            await API.delete(`/admin/posts/${id}`);
            setPosts(posts.filter((p) => p._id !== id));
            if (stats) setStats({ ...stats, totalPosts: stats.totalPosts - 1 });
            toast.success('Post deleted');
        } catch { toast.error('Failed to delete post'); }
    };

    const handleDeleteJob = async (id) => {
        if (!confirm('Delete this job listing?')) return;
        try {
            await API.delete(`/admin/jobs/${id}`);
            setJobs(jobs.filter((j) => j._id !== id));
            if (stats) setStats({ ...stats, totalJobs: stats.totalJobs - 1 });
            toast.success('Job deleted');
        } catch { toast.error('Failed to delete job'); }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'posts', label: 'Posts', icon: FileText },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
    ];

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
        { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
        { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Connections', value: stats.totalConnections, icon: Link2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    ] : [];

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px',
    };

    const btnDangerStyle = {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '12px', border: 'none',
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
        transition: 'all 0.15s',
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div style={{
                    width: '52px', height: '52px', borderRadius: '16px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                }}>
                    <Shield size={24} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>Manage the Alumni Connect platform</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: '600',
                            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            background: activeTab === id ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--bg-card)',
                            color: activeTab === id ? 'white' : 'var(--text-secondary)',
                            boxShadow: activeTab === id ? '0 4px 15px rgba(99,102,241,0.3)' : 'var(--shadow-xs)',
                            border: `1px solid ${activeTab === id ? 'transparent' : 'var(--border)'}`,
                        }}
                    >
                        <Icon size={16} /> {label}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div style={{
                    ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px',
                    marginBottom: '20px', background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)',
                }}>
                    <AlertTriangle size={20} color="#ef4444" />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>Error loading data</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{error}</p>
                    </div>
                    <button onClick={fetchData} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '12px', border: 'none',
                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        background: 'var(--primary)', color: 'white',
                    }}>
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
            ) : (
                <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && stats && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                                {statCards.map((card, i) => (
                                    <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        style={cardStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '14px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', background: card.bg,
                                            }}>
                                                <card.icon size={20} style={{ color: card.color }} />
                                            </div>
                                            <TrendingUp size={16} style={{ color: '#10b981' }} />
                                        </div>
                                        <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{card.value}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{card.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Role Distribution */}
                            {stats.roleStats && (
                                <div style={cardStyle}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '18px' }}>User Distribution</h3>
                                    <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
                                        {stats.roleStats.map((r) => (
                                            <div key={r._id} style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '24px', fontWeight: '800', color: '#6366f1' }}>{r.count}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '4px' }}>{r._id}s</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>All Users ({users.length})</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
                                            {['User', 'Email', 'Role', 'Batch', 'Company', 'Actions'].map((h) => (
                                                <th key={h} style={{
                                                    textAlign: 'left', padding: '12px 20px', fontSize: '11px',
                                                    fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    color: 'var(--text-muted)',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img src={u.profilePic || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff&size=34`}
                                                            alt="" style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover' }} />
                                                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                                                        textTransform: 'capitalize',
                                                        background: u.role === 'admin' ? 'rgba(239,68,68,0.1)' : u.role === 'alumni' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                                                        color: u.role === 'admin' ? '#ef4444' : u.role === 'alumni' ? '#6366f1' : '#10b981',
                                                    }}>{u.role}</span>
                                                </td>
                                                <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{u.batch || '—'}</td>
                                                <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{u.company || '—'}</td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    {u.role !== 'admin' && (
                                                        <button onClick={() => handleDeleteUser(u._id)} style={btnDangerStyle}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}>
                                                            <Trash2 size={13} /> Delete
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && (
                                    <p style={{ textAlign: 'center', padding: '40px 20px', fontSize: '14px', color: 'var(--text-muted)' }}>No users found</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Posts Tab */}
                    {activeTab === 'posts' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {posts.length === 0 ? (
                                    <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
                                        <FileText size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                        <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' }}>No posts found</p>
                                    </div>
                                ) : posts.map((post) => (
                                    <div key={post._id} style={{
                                        ...cardStyle, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <img src={post.user?.profilePic || `https://ui-avatars.com/api/?name=${post.user?.name}&background=6366f1&color=fff&size=28`}
                                                    alt="" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} />
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{post.user?.name || 'Unknown'}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.content}</p>
                                            <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>❤️ {post.likes?.length || 0}</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>💬 {post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeletePost(post._id)} style={{ ...btnDangerStyle, flexShrink: 0 }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}>
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Jobs Tab */}
                    {activeTab === 'jobs' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {jobs.length === 0 ? (
                                    <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 24px' }}>
                                        <Briefcase size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                                        <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)' }}>No job listings found</p>
                                    </div>
                                ) : jobs.map((job) => (
                                    <div key={job._id} style={{
                                        ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{job.title}</p>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {job.company} · {job.type} · Posted by {job.postedBy?.name || 'Unknown'} · {job.applicants?.length || 0} applicants
                                            </p>
                                        </div>
                                        <button onClick={() => handleDeleteJob(job._id)} style={{ ...btnDangerStyle, flexShrink: 0 }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}>
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}

            <div style={{ height: '32px' }} />
        </div>
    );
};

export default AdminDashboardPage;
