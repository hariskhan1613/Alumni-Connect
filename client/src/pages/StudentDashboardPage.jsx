import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboard } from '../store/slices/gamificationSlice';
import { fetchMatches } from '../store/slices/referralSlice';
import { fetchBookings } from '../store/slices/sessionSlice';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Users, Calendar, Trophy, ChevronRight, Zap, Target, Star, Award } from 'lucide-react';

const CircularProgress = ({ value, size = 120, strokeWidth = 8, color = 'var(--primary)' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
            <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
                style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: `${size / 4}px`, fontWeight: '800', fill: 'var(--text-primary)' }}>
                {value}%
            </text>
        </svg>
    );
};

const ScoreCard = ({ title, value, icon: Icon, color, subtitle, delay, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        onClick={onClick}
        className="glass-card"
        style={{ cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '28px 20px', textAlign: 'center' }}
    >
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={24} style={{ color }} />
        </div>
        <CircularProgress value={value || 0} size={100} color={color} />
        <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
        {onClick && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color, fontWeight: '600' }}>
                View Details <ChevronRight size={14} />
            </div>
        )}
    </motion.div>
);

const StudentDashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dashboard } = useSelector((state) => state.gamification);
    const { matches } = useSelector((state) => state.referrals);
    const { bookings } = useSelector((state) => state.sessions);

    useEffect(() => {
        dispatch(fetchDashboard());
        dispatch(fetchMatches());
        dispatch(fetchBookings());
    }, [dispatch]);

    const d = dashboard || {};

    return (
        <div className="page-container animate-fade-in">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                        <Zap size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Student Dashboard</h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            {d.targetRole ? `Target: ${d.targetRole}` : 'Set your target role to get started'} • {d.badgeCount || 0} badges earned • {d.credits || 0} credits
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 5 Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <ScoreCard title="Profile Strength" value={d.profileStrength || 0} icon={Target} color="#6366f1" subtitle="Profile completeness" delay={0.1} onClick={() => navigate('/ai-profile')} />
                <ScoreCard title="Resume Readiness" value={d.resumeScore || 0} icon={FileText} color="#06b6d4" subtitle={d.targetRole || 'Select a role'} delay={0.2} onClick={() => navigate('/resume')} />
                <ScoreCard title="Role Readiness" value={d.roleReadiness || 0} icon={Star} color="#f59e0b" subtitle="Career match" delay={0.3} onClick={() => navigate('/ai-profile')} />
                <ScoreCard title="Skill Growth" value={d.skillGrowth || 0} icon={TrendingUp} color="#10b981" subtitle="Progress over time" delay={0.4} onClick={() => navigate('/skill-growth')} />
                <ScoreCard title="Composite Score" value={d.compositeScore || 0} icon={Award} color="#8b5cf6" subtitle="Overall ranking score" delay={0.5} onClick={() => navigate('/skill-growth')} />
            </div>

            {/* Bottom Row: Referral Matches + Upcoming Sessions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Referral Matches */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} style={{ color: 'var(--primary)' }} />
                            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Referral Matches</h2>
                        </div>
                        <button onClick={() => navigate('/referrals')} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    {(matches || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <Users size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <p>No referral matches yet</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(matches || []).slice(0, 4).map((match, i) => (
                                <div key={match._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{match.role}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{match.company}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: match.matchScore >= 70 ? 'var(--success)' : match.matchScore >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                            {match.matchScore}%
                                        </span>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rank #{match.rank}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Sessions */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={20} style={{ color: 'var(--accent)' }} />
                            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Upcoming Sessions</h2>
                        </div>
                        <button onClick={() => navigate('/sessions')} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Browse <ChevronRight size={14} />
                        </button>
                    </div>
                    {(bookings || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <Calendar size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                            <p>No upcoming sessions</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(bookings || []).slice(0, 4).map((session, i) => (
                                <div key={session._id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Calendar size={18} style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.title}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {new Date(session.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {session.type}
                                        </p>
                                    </div>
                                    <span className="badge badge-primary" style={{ fontSize: '11px' }}>{session.domain}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Stats Row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginTop: '24px' }}>
                {[
                    { label: 'Skills', value: d.skillCount || 0, icon: '🎯' },
                    { label: 'Projects', value: d.projectCount || 0, icon: '🚀' },
                    { label: 'Badges', value: d.badgeCount || 0, icon: '🏆' },
                    { label: 'Credits', value: d.credits || 0, icon: '💎' },
                ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                        <div>
                            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default StudentDashboardPage;
