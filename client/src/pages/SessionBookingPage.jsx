import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecommended, bookSession, fetchBookings, rateSession, createSession } from '../store/slices/sessionSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Star, Search, Plus, X, Send, MapPin, Filter, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

const SessionBookingPage = () => {
    const dispatch = useDispatch();
    const { recommended, bookings, isLoading } = useSelector((state) => state.sessions);
    const { user } = useSelector((state) => state.auth);
    const [tab, setTab] = useState('browse'); // browse, bookings
    const [domainFilter, setDomainFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [ratingModal, setRatingModal] = useState(null);
    const [rating, setRating] = useState(4);
    const [feedback, setFeedback] = useState('');
    const [form, setForm] = useState({ title: '', description: '', domain: '', type: 'group', dateTime: '', duration: 60, maxParticipants: 30 });

    useEffect(() => {
        dispatch(fetchRecommended());
        dispatch(fetchBookings());
    }, [dispatch]);

    const handleBook = async (id) => {
        try {
            await dispatch(bookSession(id)).unwrap();
            dispatch(fetchBookings());
            toast.success('Session booked!');
        } catch (err) {
            toast.error(err || 'Booking failed');
        }
    };

    const handleRate = async () => {
        await dispatch(rateSession({ id: ratingModal, rating, feedback }));
        setRatingModal(null);
        setRating(4);
        setFeedback('');
        toast.success('Rating submitted!');
    };

    const handleCreate = async () => {
        if (!form.title || !form.domain || !form.dateTime) return toast.error('Fill all required fields');
        await dispatch(createSession(form));
        setShowCreate(false);
        setForm({ title: '', description: '', domain: '', type: 'group', dateTime: '', duration: 60, maxParticipants: 30 });
        dispatch(fetchRecommended());
        toast.success('Session created!');
    };

    const filteredSessions = domainFilter
        ? (recommended || []).filter(s => s.domain?.toLowerCase().includes(domainFilter.toLowerCase()))
        : recommended || [];

    const isAlumni = user?.role === 'alumni' || user?.role === 'admin';

    return (
        <div className="page-container animate-fade-in">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(16,185,129,0.3)' }}>
                            <Calendar size={22} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>Sessions</h1>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Book mentoring sessions with alumni & faculty</p>
                        </div>
                    </div>
                    {isAlumni && (
                        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
                            {showCreate ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Create Session</>}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Create a Session</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <input className="input-field" placeholder="Session title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            <input className="input-field" placeholder="Domain (e.g., Web Dev) *" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} />
                        </div>
                        <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ marginBottom: '12px', resize: 'vertical' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Date & Time *</label>
                                <input className="input-field" type="datetime-local" value={form.dateTime} onChange={e => setForm({ ...form, dateTime: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Type</label>
                                <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="group">Group</option>
                                    <option value="1:1">1:1</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Duration (min)</label>
                                <input className="input-field" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Max Participants</label>
                                <input className="input-field" type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleCreate} style={{ width: '100%' }}><Send size={16} /> Create Session</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs + Filter */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    {['browse', 'bookings'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? 'var(--primary)' : 'transparent', color: tab === t ? 'white' : 'var(--text-secondary)' }}>
                            {t === 'browse' ? 'Browse Sessions' : `My Bookings (${(bookings || []).length})`}
                        </button>
                    ))}
                </div>
                {tab === 'browse' && (
                    <div style={{ position: 'relative', minWidth: '220px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input-field" placeholder="Filter by domain..." value={domainFilter}
                            onChange={e => setDomainFilter(e.target.value)} style={{ paddingLeft: '40px', fontSize: '13px' }} />
                    </div>
                )}
            </div>

            {/* Browse Tab */}
            {tab === 'browse' && (
                <>
                    {isLoading && !recommended.length && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                    )}
                    {filteredSessions.length === 0 && !isLoading && (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Calendar size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>No sessions available</p>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                        {filteredSessions.map((session, idx) => (
                            <motion.div key={session._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                                className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{session.title}</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            by {session.host?.name} {session.host?.company && `• ${session.host.company}`}
                                        </p>
                                    </div>
                                    <div style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', background: session.relevance >= 60 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: session.relevance >= 60 ? 'var(--success)' : 'var(--warning)' }}>
                                        {session.relevance}% match
                                    </div>
                                </div>

                                {session.description && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{session.description}</p>
                                )}

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {new Date(session.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {session.duration} min</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={13} /> {session.spotsLeft} spots left</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span className="badge badge-primary">{session.domain}</span>
                                        <span className="badge" style={{ background: session.type === '1:1' ? 'rgba(245,158,11,0.1)' : 'rgba(6,182,212,0.1)', color: session.type === '1:1' ? 'var(--warning)' : 'var(--accent)' }}>
                                            {session.type}
                                        </span>
                                    </div>
                                    {session.isBooked ? (
                                        <span className="badge badge-success"><Bookmark size={12} /> Booked</span>
                                    ) : session.spotsLeft > 0 ? (
                                        <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={() => handleBook(session._id)}>
                                            Book ({session.creditCost} credit)
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '600' }}>Full</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}

            {/* Bookings Tab */}
            {tab === 'bookings' && (
                <>
                    {(bookings || []).length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Bookmark size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>No bookings yet</p>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Browse sessions to book one</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {(bookings || []).map((session, idx) => {
                                const isPast = new Date(session.dateTime) < new Date();
                                const hasRated = session.ratings?.some(r => r.user?.toString() === user?._id || r.user === user?._id);
                                return (
                                    <motion.div key={session._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                                        className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: isPast ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Calendar size={22} style={{ color: isPast ? 'var(--primary)' : 'var(--success)' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{session.title}</h3>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                {session.host?.name} • {new Date(session.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {session.duration}min
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className="badge" style={{ background: isPast ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)', color: isPast ? 'var(--primary)' : 'var(--success)' }}>
                                                {isPast ? 'Completed' : 'Upcoming'}
                                            </span>
                                            {isPast && !hasRated && (
                                                <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={() => setRatingModal(session._id)}>
                                                    <Star size={14} /> Rate
                                                </button>
                                            )}
                                            {hasRated && <span style={{ fontSize: '12px', color: 'var(--success)' }}>✓ Rated</span>}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Rating Modal */}
            <AnimatePresence>
                {ratingModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                        onClick={() => setRatingModal(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="glass-card" style={{ maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Rate This Session</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} onClick={() => setRating(n)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '32px', color: n <= rating ? '#f59e0b' : 'var(--border)', transition: 'color 0.2s' }}>
                                        ★
                                    </button>
                                ))}
                            </div>
                            <textarea className="input-field" placeholder="Optional feedback..." value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} style={{ marginBottom: '16px', resize: 'vertical' }} />
                            <button className="btn-primary" onClick={handleRate} style={{ width: '100%' }}>Submit Rating</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SessionBookingPage;
