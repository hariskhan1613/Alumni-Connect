import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMatches, applyToReferral, createReferral } from '../store/slices/referralSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, TrendingUp, Send, Plus, X, Award, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ReferralMatchPage = () => {
    const dispatch = useDispatch();
    const { matches, isLoading } = useSelector((state) => state.referrals);
    const { user } = useSelector((state) => state.auth);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ company: '', role: '', description: '', requiredSkills: '', minProfileScore: 30, maxApplicants: 10 });

    useEffect(() => { dispatch(fetchMatches()); }, [dispatch]);

    const handleApply = async (id) => {
        try {
            await dispatch(applyToReferral(id)).unwrap();
            toast.success('Application submitted!');
        } catch (err) {
            toast.error(err || 'Failed to apply');
        }
    };

    const handleCreate = async () => {
        if (!form.company || !form.role) return toast.error('Company and role are required');
        await dispatch(createReferral({ ...form, requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) }));
        setShowCreate(false);
        setForm({ company: '', role: '', description: '', requiredSkills: '', minProfileScore: 30, maxApplicants: 10 });
        toast.success('Referral posted!');
    };

    const getScoreColor = (score) => score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
    const isAlumni = user?.role === 'alumni' || user?.role === 'admin';

    return (
        <div className="page-container animate-fade-in">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(245,158,11,0.3)' }}>
                            <Users size={22} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>Referral Matches</h1>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                {isAlumni ? 'Post referrals and find top candidates' : 'AI-ranked referral opportunities matching your profile'}
                            </p>
                        </div>
                    </div>
                    {isAlumni && (
                        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
                            {showCreate ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Post Referral</>}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Create Referral Form (Alumni) */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Post a Referral</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <input className="input-field" placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                            <input className="input-field" placeholder="Role (e.g., Backend Developer)" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                        </div>
                        <textarea className="input-field" placeholder="Job description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ marginBottom: '12px', resize: 'vertical' }} />
                        <input className="input-field" placeholder="Required skills (comma separated)" value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })} style={{ marginBottom: '12px' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Min Profile Score</label>
                                <input className="input-field" type="number" min="0" max="100" value={form.minProfileScore} onChange={e => setForm({ ...form, minProfileScore: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Max Applicants</label>
                                <input className="input-field" type="number" min="1" max="50" value={form.maxApplicants} onChange={e => setForm({ ...form, maxApplicants: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleCreate} style={{ width: '100%' }}><Send size={16} /> Post Referral</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Matches List */}
            {isLoading && !matches.length && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            )}

            {!isLoading && matches.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Users size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
                    <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>No referral opportunities available</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Check back later — alumni will post referral opportunities soon.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {matches.map((match, idx) => (
                    <motion.div key={match._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                        className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'stretch' }}>
                            {/* Rank Strip */}
                            <div style={{ width: '70px', background: getScoreColor(match.matchScore), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', color: 'white', flexShrink: 0 }}>
                                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.05em' }}>Rank</span>
                                <span style={{ fontSize: '28px', fontWeight: '900' }}>#{match.rank}</span>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>{match.role}</h3>
                                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            {match.company} • Posted by {match.postedBy?.name}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '900', color: getScoreColor(match.matchScore), lineHeight: 1 }}>{match.matchScore}%</div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Match Score</p>
                                    </div>
                                </div>

                                {match.description && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{match.description}</p>
                                )}

                                {/* Required Skills */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                    {(match.requiredSkills || []).map((skill, i) => (
                                        <span key={i} className="badge badge-primary" style={{ fontSize: '11px', padding: '3px 10px' }}>{skill}</span>
                                    ))}
                                </div>

                                {/* Meta + Apply */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12} /> Min Score: {match.minProfileScore}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {match.applicantCount || 0}/{match.maxApplicants} Applied</span>
                                    </div>
                                    {match.hasApplied ? (
                                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Award size={12} /> Applied
                                        </span>
                                    ) : match.meetsMinScore ? (
                                        <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }} onClick={() => handleApply(match._id)}>
                                            Apply <ChevronRight size={14} />
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '600' }}>Profile score too low</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ReferralMatchPage;
