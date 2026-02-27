import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generateResume, getATSScore, getTargetRoles, getAIProfile } from '../store/slices/profileAISlice';
import { motion } from 'framer-motion';
import { FileText, Target, AlertTriangle, CheckCircle, TrendingUp, Lightbulb, ChevronDown, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ProgressBar = ({ value, color = 'var(--primary)', height = 8 }) => (
    <div style={{ width: '100%', height, borderRadius: '999px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: '999px', background: color }} />
    </div>
);

const ResumeOptimizerPage = () => {
    const dispatch = useDispatch();
    const { resume, atsScore, roles, profile, isLoading } = useSelector((state) => state.profileAI);
    const [selectedRole, setSelectedRole] = useState('');
    const [showRoles, setShowRoles] = useState(false);

    useEffect(() => {
        dispatch(getTargetRoles());
        dispatch(getAIProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile?.targetRole) setSelectedRole(profile.targetRole);
    }, [profile]);

    const handleGenerate = async () => {
        if (!selectedRole) return toast.error('Please select a target role');
        await dispatch(generateResume(selectedRole));
        await dispatch(getATSScore(selectedRole));
        toast.success('Resume generated & ATS score calculated!');
    };

    return (
        <div className="page-container animate-fade-in">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(6,182,212,0.3)' }}>
                        <FileText size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>Resume Optimizer</h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Generate ATS-optimized resumes for your target role</p>
                    </div>
                </div>
            </motion.div>

            {/* Role Select + Generate */}
            <div className="glass-card" style={{ marginBottom: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Target Role</label>
                        <button onClick={() => setShowRoles(!showRoles)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{selectedRole || 'Select a role...'}</span>
                            <ChevronDown size={16} />
                        </button>
                        {showRoles && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-lg)', maxHeight: '250px', overflowY: 'auto', marginTop: '4px' }}>
                                {(roles || []).map(role => (
                                    <button key={role} onClick={() => { setSelectedRole(role); setShowRoles(false); }}
                                        style={{ width: '100%', padding: '10px 16px', border: 'none', background: selectedRole === role ? 'rgba(99,102,241,0.1)' : 'transparent', color: selectedRole === role ? 'var(--primary)' : 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}
                                        onMouseEnter={e => { if (selectedRole !== role) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                        onMouseLeave={e => { if (selectedRole !== role) e.currentTarget.style.background = 'transparent'; }}>
                                        {role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="btn-primary" onClick={handleGenerate} disabled={isLoading || !selectedRole} style={{ minWidth: '200px' }}>
                        <Zap size={16} /> {isLoading ? 'Generating...' : 'Generate & Analyze'}
                    </button>
                </div>
            </div>

            {/* ATS Score Dashboard */}
            {atsScore && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    {/* Overall ATS Score */}
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '20px' }}>ATS Compatibility Score</h3>
                        <div style={{ width: '140px', height: '140px', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `conic-gradient(${atsScore.atsScore >= 70 ? 'var(--success)' : atsScore.atsScore >= 40 ? 'var(--warning)' : 'var(--danger)'} ${atsScore.atsScore * 3.6}deg, var(--border) 0)` }}>
                            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>{atsScore.atsScore}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 100</span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
                                <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{atsScore.formatScore}%</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Format Score</p>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
                                <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>{atsScore.skillMatchScore}%</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Skill Match</p>
                            </div>
                        </div>
                    </div>

                    {/* Skills Analysis */}
                    <div className="glass-card">
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Target size={18} /> Skill Analysis
                        </h3>
                        {atsScore.matchedSkills?.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle size={14} /> Matched Skills
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {atsScore.matchedSkills.map((s, i) => (
                                        <span key={i} style={{ padding: '4px 12px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '12px', fontWeight: '500' }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {atsScore.missingSkills?.length > 0 && (
                            <div>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertTriangle size={14} /> Missing Skills
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {atsScore.missingSkills.map((s, i) => (
                                        <span key={i} style={{ padding: '4px 12px', borderRadius: '999px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: '12px', fontWeight: '500' }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Improvements + Keywords */}
            {atsScore && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} /> Improvement Suggestions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(atsScore.improvements || []).map((imp, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
                                    <span style={{ color: 'var(--warning)', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>💡</span>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{imp}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lightbulb size={18} /> Suggested ATS Keywords
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Add these keywords to improve your ATS pass rate:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(atsScore.suggestedKeywords || []).map((kw, i) => (
                                <span key={i} style={{ padding: '6px 14px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontSize: '13px', fontWeight: '600', border: '1px dashed rgba(99,102,241,0.3)' }}>
                                    + {kw}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Generated Resume Preview */}
            {resume?.resume && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card">
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} /> Generated Resume Preview
                    </h3>
                    <div style={{ padding: '28px', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid var(--border)' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>{resume.resume.header?.name}</h2>
                            <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>{resume.resume.header?.targetRole}</p>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {resume.resume.header?.email} • {resume.resume.header?.location}
                                {resume.resume.header?.linkedIn && ` • ${resume.resume.header.linkedIn}`}
                            </p>
                        </div>

                        {/* Summary */}
                        {resume.resume.summary && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Professional Summary</h4>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{resume.resume.summary}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {resume.resume.skills?.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {resume.resume.skills.map((s, i) => (
                                        <span key={i} className="badge badge-primary">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {resume.resume.projects?.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Projects</h4>
                                {resume.resume.projects.map((p, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{p.title}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.description}</p>
                                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                            {(p.technologies || []).map((t, j) => (
                                                <span key={j} style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '600' }}>{t}{j < p.technologies.length - 1 ? ',' : ''}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Internships */}
                        {resume.resume.internships?.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Experience</h4>
                                {resume.resume.internships.map((int, i) => (
                                    <div key={i} style={{ marginBottom: '12px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{int.role} — {int.company}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500' }}>{int.duration}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{int.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Education */}
                        {resume.resume.education?.course && (
                            <div>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Education</h4>
                                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{resume.resume.education.course}</p>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Batch: {resume.resume.education.batch}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ResumeOptimizerPage;
