import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLeaderboard, fetchBadges, fetchProgress, checkBadges } from '../store/slices/gamificationSlice';
import { motion } from 'framer-motion';
import { Trophy, Award, TrendingUp, Star, Target, Zap, Medal, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

const ProgressBar = ({ value, color = 'var(--primary)', height = 8, label }) => (
    <div style={{ marginBottom: '12px' }}>
        {label && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color }}>{value}%</span>
            </div>
        )}
        <div style={{ width: '100%', height, borderRadius: '999px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '999px', background: color }} />
        </div>
    </div>
);

const MiniChart = ({ data }) => {
    if (!data || data.length < 2) return <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Need more data for graph. Keep updating your profile!</p>;
    const maxVal = Math.max(...data.map(d => d.profileStrength || 0), 1);
    const chartWidth = 100;
    const chartHeight = 60;
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * chartWidth,
        y: chartHeight - ((d.profileStrength || 0) / maxVal) * chartHeight,
    }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
        <svg width="100%" height="80" viewBox={`-5 -5 ${chartWidth + 10} ${chartHeight + 15}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaD} fill="url(#areaGrad)" />
            <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--primary)" stroke="var(--bg-card)" strokeWidth="1.5" />
            ))}
        </svg>
    );
};

const SkillGrowthPage = () => {
    const dispatch = useDispatch();
    const { leaderboard, badges, progress, isLoading } = useSelector((state) => state.gamification);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchLeaderboard());
        dispatch(fetchBadges());
        dispatch(fetchProgress());
    }, [dispatch]);

    const handleCheckBadges = async () => {
        const result = await dispatch(checkBadges()).unwrap();
        if (result.newBadges?.length > 0) {
            toast.success(result.message);
        } else {
            toast('Keep improving to earn new badges! 🎯');
        }
        dispatch(fetchBadges());
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={20} style={{ color: '#f59e0b' }} />;
        if (rank === 2) return <Medal size={20} style={{ color: '#94a3b8' }} />;
        if (rank === 3) return <Medal size={20} style={{ color: '#d97706' }} />;
        return <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>#{rank}</span>;
    };

    return (
        <div className="page-container animate-fade-in">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(139,92,246,0.3)' }}>
                        <Trophy size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>Skill Growth</h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Track your progress, earn badges, and climb the leaderboard</p>
                    </div>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Score Breakdown */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={18} /> Score Breakdown
                    </h3>
                    <ProgressBar value={progress?.currentScores?.profileStrength || 0} color="#6366f1" label="Profile Strength" />
                    <ProgressBar value={progress?.currentScores?.roleReadiness || 0} color="#f59e0b" label="Role Readiness" />
                    <ProgressBar value={progress?.currentScores?.resumeScore || 0} color="#06b6d4" label="Resume Score" />
                    <ProgressBar value={progress?.currentScores?.skillGrowth || 0} color="#10b981" label="Skill Growth" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
                            <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{progress?.skillCount || 0}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Skills</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
                            <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{progress?.projectCount || 0}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Projects</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
                            <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{progress?.certCount || 0}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Certs</p>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Graph */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={18} /> Progress Over Time
                    </h3>
                    <MiniChart data={progress?.scoreHistory || []} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                            Profile Strength
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} /> Badges ({badges?.earnedCount || 0}/{badges?.total || 0})
                    </h3>
                    <button className="btn-primary" onClick={handleCheckBadges} style={{ padding: '8px 18px', fontSize: '13px' }}>
                        <Zap size={14} /> Check for New
                    </button>
                </div>

                {/* Earned Badges */}
                {badges?.earned?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>🎉 Earned</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                            {(badges.earned || []).map((badge, i) => (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                    style={{ padding: '16px', borderRadius: '14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>{badge.icon}</span>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{badge.name}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{badge.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Badges */}
                {badges?.available?.length > 0 && (
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>🔒 Available</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                            {(badges.available || []).map((badge, i) => (
                                <div key={i} style={{ padding: '16px', borderRadius: '14px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', textAlign: 'center', opacity: 0.6 }}>
                                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px', filter: 'grayscale(1)' }}>{badge.icon}</span>
                                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{badge.name}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{badge.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} /> Leaderboard — Top 10
                </h3>
                {(leaderboard || []).length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>No leaderboard data yet</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(leaderboard || []).map((student, idx) => {
                            const isMe = student._id === user?._id;
                            return (
                                <motion.div key={student._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '14px',
                                        background: isMe ? 'rgba(99,102,241,0.08)' : idx < 3 ? 'var(--bg-tertiary)' : 'transparent',
                                        border: isMe ? '1.5px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                                    }}>
                                    <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                        {getRankIcon(student.rank)}
                                    </div>
                                    <img src={student.profilePic || `https://ui-avatars.com/api/?name=${student.name}&background=6366f1&color=fff`}
                                        alt={student.name} style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {student.name} {isMe && <span className="badge badge-primary" style={{ fontSize: '10px', padding: '2px 8px' }}>You</span>}
                                        </p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {student.badgeCount} badges • PS {student.profileStrength}% • RS {student.resumeScore}%
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>{student.compositeScore}</p>
                                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SkillGrowthPage;
