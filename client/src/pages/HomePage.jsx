import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, createPost, likePost, commentOnPost, deletePost } from '../store/slices/postSlice';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Image, Trash2, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

const HomePage = () => {
    const dispatch = useDispatch();
    const { posts, isLoading } = useSelector((state) => state.posts);
    const { user } = useSelector((state) => state.auth);
    const [newPost, setNewPost] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [posting, setPosting] = useState(false);
    const [commentText, setCommentText] = useState({});
    const [showComments, setShowComments] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreate = async () => {
        if (!newPost.trim() && !selectedImage) return;
        setPosting(true);
        const formData = new FormData();
        formData.append('content', newPost);
        if (selectedImage) formData.append('image', selectedImage);
        const result = await dispatch(createPost(formData));
        if (result.meta.requestStatus === 'fulfilled') {
            setNewPost('');
            removeImage();
            toast.success('Post shared!');
        }
        setPosting(false);
    };

    const handleLike = (postId) => dispatch(likePost(postId));

    const handleComment = async (postId) => {
        if (!commentText[postId]?.trim()) return;
        await dispatch(commentOnPost({ postId, text: commentText[postId] }));
        setCommentText({ ...commentText, [postId]: '' });
    };

    const handleDelete = async (postId) => {
        await dispatch(deletePost(postId));
        toast.success('Post deleted');
    };

    const timeAgo = (date) => {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60) return 'Just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
    };

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Create Post Card */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ ...cardStyle, padding: '24px', marginBottom: '28px' }}
            >
                <div style={{ display: 'flex', gap: '16px' }}>
                    <img
                        src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                        alt=""
                        style={{ width: '46px', height: '46px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Share something with the community..."
                            rows={3}
                            style={{
                                width: '100%', border: 'none', background: 'transparent', color: 'var(--text-primary)',
                                fontSize: '15px', lineHeight: '1.7', resize: 'none', outline: 'none',
                                fontFamily: 'Inter, sans-serif', padding: '0',
                            }}
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <div style={{ position: 'relative', marginTop: '12px' }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--border)' }}
                                />
                                <button
                                    onClick={removeImage}
                                    style={{
                                        position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px',
                                        borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: 'white',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)',
                        }}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                                    borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none',
                                    background: imagePreview ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    color: imagePreview ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { if (!imagePreview) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                onMouseLeave={(e) => { if (!imagePreview) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <Image size={18} /> Photo
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={(!newPost.trim() && !selectedImage) || posting}
                                className="btn-primary"
                                style={{ padding: '10px 24px', fontSize: '14px', opacity: posting ? 0.7 : 1 }}
                            >
                                {posting ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : <><Send size={15} /> Post</>}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Posts Feed */}
            {isLoading && posts.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner" /></div>
            ) : posts.length === 0 ? (
                <div style={{ ...cardStyle, padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-tertiary)', boxShadow: 'var(--shadow-sm)',
                    }}>
                        <MessageCircle size={28} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-secondary)' }}>No posts yet</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>Be the first to share something!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {posts.map((post, i) => {
                        const isLiked = post.likes?.includes(user?._id);
                        return (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}
                            >
                                {/* Post Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <img
                                            src={post.user?.profilePic || `https://ui-avatars.com/api/?name=${post.user?.name}&background=6366f1&color=fff`}
                                            alt=""
                                            style={{ width: '46px', height: '46px', borderRadius: '14px', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{post.user?.name}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {post.user?.jobRole}{post.user?.company ? ` • ${post.user.company}` : ''} · {timeAgo(post.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    {post.user?._id === user?._id && (
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            style={{
                                                padding: '8px', borderRadius: '12px', border: 'none', background: 'transparent',
                                                color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    )}
                                </div>

                                {/* Post Content */}
                                <div style={{ padding: '16px 24px' }}>
                                    <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                                </div>

                                {post.image && (
                                    <div style={{ padding: '0 24px 12px' }}>
                                        <img src={post.image} alt="" style={{ borderRadius: '14px', width: '100%', maxHeight: '420px', objectFit: 'cover' }} />
                                    </div>
                                )}

                                {/* Engagement Bar */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
                                    borderTop: '1px solid var(--border)',
                                }}>
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                                            borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none',
                                            background: 'transparent', cursor: 'pointer', transition: 'all 0.15s',
                                            color: isLiked ? 'var(--danger)' : 'var(--text-muted)',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = isLiked ? 'rgba(239,68,68,0.06)' : 'var(--bg-tertiary)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                                        <span>{post.likes?.length || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                                            borderRadius: '12px', fontSize: '14px', fontWeight: '500', border: 'none',
                                            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <MessageCircle size={18} />
                                        <span>{post.comments?.length || 0}</span>
                                        <ChevronDown size={14} style={{ transform: showComments[post._id] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {showComments[post._id] && (
                                    <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--border)' }}>
                                        {post.comments?.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px', marginBottom: '16px' }}>
                                                {post.comments.map((c) => (
                                                    <div key={c._id} style={{ display: 'flex', gap: '12px' }}>
                                                        <img
                                                            src={c.user?.profilePic || `https://ui-avatars.com/api/?name=${c.user?.name}&background=6366f1&color=fff&size=28`}
                                                            alt=""
                                                            style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, marginTop: '2px' }}
                                                        />
                                                        <div style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', background: 'var(--bg-tertiary)' }}>
                                                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{c.user?.name}</p>
                                                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>{c.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{
                                            display: 'flex', gap: '12px', paddingTop: '12px',
                                            borderTop: post.comments?.length > 0 ? '1px solid var(--border)' : 'none',
                                        }}>
                                            <img
                                                src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=28`}
                                                alt=""
                                                style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                                            />
                                            <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                                                <input
                                                    value={commentText[post._id] || ''}
                                                    onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                                    placeholder="Write a comment..."
                                                    className="input-field"
                                                    style={{ padding: '10px 16px', fontSize: '13px', minWidth: 0 }}
                                                />
                                                <button
                                                    onClick={() => handleComment(post._id)}
                                                    className="btn-primary"
                                                    style={{ padding: '10px 16px', flexShrink: 0 }}
                                                >
                                                    <Send size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <div style={{ height: '32px' }} />
        </div>
    );
};

export default HomePage;
