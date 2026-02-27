import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, loadUser } from '../store/slices/authSlice';
import API from '../services/api';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, GraduationCap, Linkedin, Calendar, Edit3, Save, X, UserPlus, UserCheck, Clock, MessageSquare, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [uploadingPic, setUploadingPic] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const picInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const isOwnProfile = currentUser?._id === id;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [userRes, postsRes] = await Promise.all([
                    API.get(`/users/profile/${id}`),
                    API.get(`/posts/user/${id}`),
                ]);
                setProfileUser(userRes.data);
                setUserPosts(postsRes.data);
                setEditForm(userRes.data);
                if (!isOwnProfile) {
                    const connRes = await API.get(`/connections/status/${id}`);
                    setConnectionStatus(connRes.data.connection);
                }
            } catch { toast.error('Failed to load profile'); }
            setLoading(false);
        };
        fetchData();
    }, [id, isOwnProfile]);

    const handleSave = async () => {
        const updates = { ...editForm };
        if (typeof updates.skills === 'string') {
            updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
        }
        const result = await dispatch(updateUserProfile(updates));
        if (result.meta.requestStatus === 'fulfilled') {
            setProfileUser(result.payload);
            setEditing(false);
            toast.success('Profile updated!');
        }
    };

    const handleConnect = async () => {
        try {
            await API.post(`/connections/request/${id}`);
            setConnectionStatus({ status: 'pending' });
            toast.success('Connection request sent!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleImageUpload = async (file, type) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

        const setUploading = type === 'cover' ? setUploadingCover : setUploadingPic;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);
            const { data } = await API.post(`/users/upload?type=${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfileUser(data);
            // Also update the current user in localStorage if it's own profile
            if (isOwnProfile) {
                const stored = JSON.parse(localStorage.getItem('user'));
                if (stored) {
                    if (type === 'cover') stored.coverImage = data.coverImage;
                    else stored.profilePic = data.profilePic;
                    localStorage.setItem('user', JSON.stringify(stored));
                }
                dispatch(loadUser());
            }
            toast.success(type === 'cover' ? 'Cover photo updated!' : 'Profile photo updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        }
        setUploading(false);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;
    if (!profileUser) return <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>User not found</div>;

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
    };

    return (
        <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Cover & Avatar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                {/* Cover Image */}
                <div style={{
                    height: '200px', position: 'relative',
                    background: profileUser.coverImage ? `url(${profileUser.coverImage}) center/cover` : 'linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #06b6d4 100%)',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', pointerEvents: 'none' }} />
                    {isOwnProfile && (
                        <>
                            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={(e) => handleImageUpload(e.target.files[0], 'cover')} />
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                disabled={uploadingCover}
                                style={{
                                    position: 'absolute', bottom: '14px', right: '14px', zIndex: 10,
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '8px 16px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: '600',
                                    background: 'rgba(0,0,0,0.5)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(8px)',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
                            >
                                {uploadingCover ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <Camera size={15} />}
                                {uploadingCover ? 'Uploading...' : 'Change Cover'}
                            </button>
                        </>
                    )}
                </div>

                {/* Profile Info */}
                <div style={{ padding: '0 32px 28px', marginTop: '-56px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                        {/* Avatar with Upload */}
                        <div style={{ position: 'relative' }}>
                            <img
                                src={profileUser.profilePic || `https://ui-avatars.com/api/?name=${profileUser.name}&background=6366f1&color=fff&size=128`}
                                alt=""
                                style={{
                                    width: '110px', height: '110px', borderRadius: '20px', objectFit: 'cover',
                                    border: '4px solid var(--bg-card)', boxShadow: 'var(--shadow-md)',
                                }}
                            />
                            {isOwnProfile && (
                                <>
                                    <input ref={picInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={(e) => handleImageUpload(e.target.files[0], 'profilePic')} />
                                    <button
                                        onClick={() => picInputRef.current?.click()}
                                        disabled={uploadingPic}
                                        style={{
                                            position: 'absolute', bottom: '4px', right: '4px', width: '34px', height: '34px',
                                            borderRadius: '50%', border: '3px solid var(--bg-card)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                            background: 'var(--primary)', color: 'white', transition: 'transform 0.15s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        {uploadingPic ? <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : <Camera size={14} />}
                                    </button>
                                </>
                            )}
                        </div>

                        <div style={{ flex: 1, paddingTop: '60px', minWidth: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                                <div>
                                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{profileUser.name}</h1>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {profileUser.jobRole}{profileUser.company ? ` at ${profileUser.company}` : ''}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        {profileUser.location && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                <MapPin size={13} />{profileUser.location}
                                            </span>
                                        )}
                                        {profileUser.batch && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                <Calendar size={13} />Batch {profileUser.batch}
                                            </span>
                                        )}
                                        <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{profileUser.role}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {isOwnProfile ? (
                                        <button onClick={() => setEditing(!editing)} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                                            {editing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit</>}
                                        </button>
                                    ) : (
                                        !connectionStatus ? (
                                            <button onClick={handleConnect} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}><UserPlus size={14} /> Connect</button>
                                        ) : connectionStatus.status === 'accepted' ? (
                                            <>
                                                <span className="btn-secondary" style={{ padding: '10px 16px', fontSize: '13px', cursor: 'default' }}><UserCheck size={14} /> Connected</span>
                                                <button onClick={() => navigate(`/chat/${id}`)} className="btn-primary" style={{ padding: '10px 16px', fontSize: '13px' }}><MessageSquare size={14} /> Message</button>
                                            </>
                                        ) : (
                                            <span className="btn-secondary" style={{ padding: '10px 16px', fontSize: '13px', cursor: 'default' }}><Clock size={14} /> Pending</span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Edit Form */}
            {editing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardStyle, padding: '28px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Edit Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                        {[
                            { key: 'name', label: 'Full Name' },
                            { key: 'bio', label: 'Bio', full: true },
                            { key: 'course', label: 'Course' },
                            { key: 'batch', label: 'Batch Year' },
                            { key: 'company', label: 'Company' },
                            { key: 'jobRole', label: 'Job Role' },
                            { key: 'location', label: 'Location' },
                            { key: 'linkedIn', label: 'LinkedIn URL' },
                            { key: 'skills', label: 'Skills (comma separated)', full: true },
                        ].map(({ key, label, full }) => (
                            <div key={key} style={{ gridColumn: full ? '1 / -1' : undefined }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</label>
                                <input
                                    value={Array.isArray(editForm[key]) ? editForm[key].join(', ') : editForm[key] || ''}
                                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                                    className="input-field"
                                    style={{ padding: '12px 16px', fontSize: '14px' }}
                                />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSave} className="btn-primary" style={{ marginTop: '20px' }}><Save size={16} /> Save Changes</button>
                </motion.div>
            )}

            {/* Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ ...cardStyle, padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>About</h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>{profileUser.bio || 'No bio added yet.'}</p>
                </div>
                <div style={{ ...cardStyle, padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {profileUser.course && <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}><GraduationCap size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {profileUser.course}</p>}
                        {profileUser.company && <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}><Briefcase size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {profileUser.company}</p>}
                        {profileUser.linkedIn && <a href={profileUser.linkedIn} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}><Linkedin size={15} /> LinkedIn Profile</a>}
                    </div>
                </div>
            </div>

            {/* Skills */}
            {profileUser.skills?.length > 0 && (
                <div style={{ ...cardStyle, padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {profileUser.skills.map((skill) => <span key={skill} className="badge badge-primary">{skill}</span>)}
                    </div>
                </div>
            )}

            {/* Connections */}
            {profileUser.connections?.length > 0 && (
                <div style={{ ...cardStyle, padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>{profileUser.connections.length} Connections</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {profileUser.connections.slice(0, 10).map((conn) => (
                            <img key={conn._id} src={conn.profilePic || `https://ui-avatars.com/api/?name=${conn.name}&background=6366f1&color=fff&size=36`}
                                alt={conn.name} title={conn.name}
                                style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', border: '2px solid var(--border)' }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Posts */}
            <div style={{ ...cardStyle, padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '18px' }}>Posts ({userPosts.length})</h3>
                {userPosts.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '24px 0', fontSize: '14px', color: 'var(--text-muted)' }}>No posts yet</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {userPosts.map((post) => (
                            <div key={post._id} style={{ padding: '18px', borderRadius: '14px', background: 'var(--bg-tertiary)' }}>
                                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{post.content}</p>
                                {post.image && <img src={post.image} alt="" style={{ marginTop: '10px', borderRadius: '12px', maxHeight: '200px', objectFit: 'cover' }} />}
                                <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>❤️ {post.likes?.length || 0}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>💬 {post.comments?.length || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ height: '32px' }} />
        </div>
    );
};

export default ProfilePage;
