import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Plus, X, Send, Building, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const JobsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState('');
    const [form, setForm] = useState({ title: '', description: '', company: '', location: '', type: 'job' });
    const [creating, setCreating] = useState(false);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = filter ? `?type=${filter}` : '';
            const { data } = await API.get(`/jobs${params}`);
            setJobs(data.jobs || data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchJobs(); }, [filter]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await API.post('/jobs', form);
            toast.success('Posted successfully!');
            setShowCreate(false);
            setForm({ title: '', description: '', company: '', location: '', type: 'job' });
            fetchJobs();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
        setCreating(false);
    };

    const handleApply = async (jobId) => {
        try {
            await API.post(`/jobs/${jobId}/apply`);
            toast.success('Applied successfully!');
            fetchJobs();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    };

    const typeColors = {
        job: { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' },
        internship: { bg: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)' },
        referral: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' },
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Jobs & Opportunities</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>Discover opportunities from the alumni network</p>
                </div>
                {(user?.role === 'alumni' || user?.role === 'admin') && (
                    <button onClick={() => setShowCreate(!showCreate)} className="btn-primary" style={{ fontSize: '14px' }}>
                        {showCreate ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Post Opportunity</>}
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
                {['', 'job', 'internship', 'referral'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        style={{
                            padding: '10px 22px',
                            borderRadius: '14px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            border: `1.5px solid ${filter === t ? 'var(--primary)' : 'var(--border)'}`,
                            background: filter === t ? 'var(--primary-gradient)' : 'var(--bg-card)',
                            color: filter === t ? 'white' : 'var(--text-secondary)',
                            boxShadow: filter === t ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
                    </button>
                ))}
            </div>

            {/* Create Form */}
            {showCreate && (
                <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCreate}
                    style={{ ...cardStyle, padding: '28px', marginBottom: '28px' }}
                >
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Post New Opportunity</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Title</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="input-field" style={{ fontSize: '14px' }} placeholder="e.g. Frontend Developer" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Company</label>
                            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                                className="input-field" style={{ fontSize: '14px' }} placeholder="e.g. Google" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Location</label>
                            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                className="input-field" style={{ fontSize: '14px' }} placeholder="e.g. Bangalore, India" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Type</label>
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="input-field" style={{ fontSize: '14px' }}>
                                <option value="job">Job</option>
                                <option value="internship">Internship</option>
                                <option value="referral">Referral</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="input-field" style={{ fontSize: '14px', resize: 'vertical' }} rows={4} placeholder="Describe the role, requirements..." required />
                        </div>
                    </div>
                    <button type="submit" disabled={creating} className="btn-primary" style={{ marginTop: '20px', fontSize: '14px' }}>
                        {creating ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <><Send size={15} /> Post Opportunity</>}
                    </button>
                </motion.form>
            )}

            {/* Jobs List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
            ) : jobs.length === 0 ? (
                <div style={{ ...cardStyle, padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-tertiary)', boxShadow: 'var(--shadow-sm)',
                    }}>
                        <Briefcase size={28} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-secondary)' }}>No opportunities found</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>Check back later or post one yourself!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {jobs.map((job, i) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            style={{ ...cardStyle, padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{job.title}</h3>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
                                            textTransform: 'capitalize', background: typeColors[job.type]?.bg, color: typeColors[job.type]?.color,
                                        }}>{job.type}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '14px', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            <Building size={15} style={{ flexShrink: 0 }} /> {job.company}
                                        </span>
                                        {job.location && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>
                                                <MapPin size={15} style={{ flexShrink: 0 }} /> {job.location}
                                            </span>
                                        )}
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            <Clock size={14} style={{ flexShrink: 0 }} /> {new Date(job.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>{job.description}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                                        <img
                                            src={job.postedBy?.profilePic || `https://ui-avatars.com/api/?name=${job.postedBy?.name}&background=6366f1&color=fff&size=24`}
                                            alt="" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
                                        />
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Posted by <strong style={{ color: 'var(--text-secondary)' }}>{job.postedBy?.name}</strong></span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'flex-start' }}>
                                    {user?.role === 'student' && (
                                        <button
                                            onClick={() => handleApply(job._id)}
                                            disabled={job.applicants?.includes(user?._id)}
                                            className={job.applicants?.includes(user?._id) ? 'btn-secondary' : 'btn-primary'}
                                            style={{ padding: '10px 24px', fontSize: '13px' }}
                                        >
                                            {job.applicants?.includes(user?._id) ? 'Applied ✓' : 'Apply Now'}
                                        </button>
                                    )}
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {job.applicants?.length || 0} applicants
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Bottom spacer */}
            <div style={{ height: '32px' }} />
        </div>
    );
};

export default JobsPage;
