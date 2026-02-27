import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAIProfile, uploadCV, getRoleReadiness, updateAIProfile, getTargetRoles } from '../store/slices/profileAISlice';
import { checkBadges } from '../store/slices/gamificationSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Target, Edit3, Plus, X, Save, Sparkles, Briefcase, Award, Code, ChevronDown, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CircularProgress = ({ value, size = 90, strokeWidth = 6, color = 'var(--primary)' }) => {
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
                {value}
            </text>
        </svg>
    );
};

const AIProfilePage = () => {
    const dispatch = useDispatch();
    const { profile, roles, roleReadiness, isLoading } = useSelector((state) => state.profileAI);
    const [editing, setEditing] = useState(null); // 'skills', 'projects', 'internships', 'certifications'
    const [editData, setEditData] = useState({});
    const [newSkill, setNewSkill] = useState('');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        dispatch(getAIProfile());
        dispatch(getTargetRoles());
    }, [dispatch]);

    const handleUploadCV = async () => {
        if (!selectedFile) return toast.error('Please select a PDF file first');
        const formData = new FormData();
        formData.append('cv', selectedFile);
        const result = await dispatch(uploadCV(formData)).unwrap();
        await dispatch(getAIProfile());
        dispatch(checkBadges());
        toast.success(`CV analyzed! Found ${result.extractedSkills || 0} skills, ${result.extractedProjects || 0} projects`);
        setSelectedFile(null);
    };

    const handleSelectRole = async (role) => {
        await dispatch(getRoleReadiness(role));
        await dispatch(updateAIProfile({ targetRole: role }));
        dispatch(getAIProfile());
        dispatch(checkBadges());
        setShowRoleDropdown(false);
        toast.success(`Target role set: ${role}`);
    };

    const startEdit = (section) => {
        setEditing(section);
        if (section === 'skills') setEditData({ skills: [...(profile?.skills || [])] });
        if (section === 'projects') setEditData({ projects: [...(profile?.projects || [])] });
        if (section === 'internships') setEditData({ internships: [...(profile?.internships || [])] });
        if (section === 'certifications') setEditData({ certifications: [...(profile?.certifications || [])] });
    };

    const saveEdit = async () => {
        await dispatch(updateAIProfile(editData));
        dispatch(checkBadges());
        setEditing(null);
        toast.success('Profile updated!');
    };

    const addSkill = () => {
        if (newSkill.trim() && !editData.skills?.includes(newSkill.trim())) {
            setEditData({ skills: [...(editData.skills || []), newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (idx) => {
        setEditData({ skills: editData.skills.filter((_, i) => i !== idx) });
    };

    const addProject = () => {
        setEditData({ projects: [...(editData.projects || []), { title: '', description: '', technologies: [], link: '' }] });
    };

    const updateProject = (idx, field, value) => {
        const updated = [...editData.projects];
        if (field === 'technologies') {
            updated[idx][field] = value.split(',').map(t => t.trim());
        } else {
            updated[idx][field] = value;
        }
        setEditData({ projects: updated });
    };

    const removeProject = (idx) => {
        setEditData({ projects: editData.projects.filter((_, i) => i !== idx) });
    };

    const addInternship = () => {
        setEditData({ internships: [...(editData.internships || []), { company: '', role: '', duration: '', description: '' }] });
    };

    const updateInternship = (idx, field, value) => {
        const updated = [...editData.internships];
        updated[idx][field] = value;
        setEditData({ internships: updated });
    };

    const removeInternship = (idx) => {
        setEditData({ internships: editData.internships.filter((_, i) => i !== idx) });
    };

    const addCertification = () => {
        setEditData({ certifications: [...(editData.certifications || []), { name: '', issuer: '', date: '', link: '' }] });
    };

    const updateCertification = (idx, field, value) => {
        const updated = [...editData.certifications];
        updated[idx][field] = value;
        setEditData({ certifications: updated });
    };

    const removeCertification = (idx) => {
        setEditData({ certifications: editData.certifications.filter((_, i) => i !== idx) });
    };

    if (isLoading && !profile) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                        <Sparkles size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AI Profile</h1>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Upload your CV and let AI build your profile</p>
                    </div>
                </div>
            </motion.div>

            {/* Score Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                    className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
                    <CircularProgress value={profile?.profileStrengthScore || 0} color="#6366f1" />
                    <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Profile Strength</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
                    <CircularProgress value={profile?.roleReadinessScore || 0} color="#f59e0b" />
                    <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Role Readiness</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    className="glass-card" style={{ textAlign: 'center', padding: '24px' }}>
                    <CircularProgress value={profile?.resumeScore || 0} color="#06b6d4" />
                    <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Resume Score</p>
                </motion.div>
            </div>

            {/* CV Upload + Role Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={18} /> Upload CV
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Upload your CV (PDF) and AI will auto-extract skills, projects, internships, and certifications.
                    </p>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept=".pdf"
                        id="cv-file-input"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.type === 'application/pdf') {
                                setSelectedFile(file);
                            } else if (file) {
                                toast.error('Please select a PDF file');
                                e.target.value = '';
                            }
                        }}
                    />
                    {/* Drop zone / file picker area */}
                    <label htmlFor="cv-file-input"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 16px', borderRadius: '14px', border: '2px dashed var(--border)', background: selectedFile ? 'rgba(16,185,129,0.05)' : 'var(--bg-tertiary)', cursor: 'pointer', marginBottom: '12px', transition: 'all 0.2s' }}>
                        {selectedFile ? (
                            <>
                                <FileText size={28} style={{ color: 'var(--success)' }} />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedFile.name}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
                                </span>
                            </>
                        ) : (
                            <>
                                <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Click to select PDF</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Only .pdf files accepted</span>
                            </>
                        )}
                    </label>
                    <button className="btn-primary" onClick={handleUploadCV} disabled={isLoading || !selectedFile} style={{ width: '100%' }}>
                        <FileText size={16} /> {isLoading ? 'Processing...' : 'Process CV with AI'}
                    </button>
                    {profile?.cvUrl && (
                        <p style={{ fontSize: '12px', color: 'var(--success)', marginTop: '10px' }}>✓ Last processed: {profile.cvUrl}</p>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={18} /> Target Career Role
                    </h3>
                    <button onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{profile?.targetRole || 'Select a role...'}</span>
                        <ChevronDown size={16} />
                    </button>
                    <AnimatePresence>
                        {showRoleDropdown && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                style={{ position: 'absolute', top: '100%', left: '0', right: '0', zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-lg)', maxHeight: '280px', overflowY: 'auto', margin: '8px 24px' }}>
                                {(roles || []).map((role) => (
                                    <button key={role} onClick={() => handleSelectRole(role)}
                                        style={{ width: '100%', padding: '12px 16px', border: 'none', background: profile?.targetRole === role ? 'rgba(99,102,241,0.1)' : 'transparent', color: profile?.targetRole === role ? 'var(--primary)' : 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', textAlign: 'left', fontWeight: profile?.targetRole === role ? '600' : '400' }}
                                        onMouseEnter={e => e.currentTarget.style.background = profile?.targetRole === role ? 'rgba(99,102,241,0.1)' : 'var(--bg-tertiary)'}
                                        onMouseLeave={e => e.currentTarget.style.background = profile?.targetRole === role ? 'rgba(99,102,241,0.1)' : 'transparent'}>
                                        {role}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {roleReadiness && (
                        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {roleReadiness.targetRole}: {roleReadiness.readinessScore}% ready
                            </p>
                            {roleReadiness.missingSkills?.length > 0 && (
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Missing: {roleReadiness.missingSkills.slice(0, 4).join(', ')}
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Skills Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Code size={18} /> Skills ({(profile?.skills || []).length})
                    </h3>
                    <button onClick={() => editing === 'skills' ? saveEdit() : startEdit('skills')}
                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: editing === 'skills' ? 'var(--primary)' : 'transparent', color: editing === 'skills' ? 'white' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {editing === 'skills' ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
                    </button>
                </div>
                {editing === 'skills' ? (
                    <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input className="input-field" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Add a skill..." style={{ flex: 1 }} />
                            <button className="btn-primary" onClick={addSkill} style={{ padding: '10px 16px' }}><Plus size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(editData.skills || []).map((skill, i) => (
                                <span key={i} style={{ padding: '6px 14px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {skill} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSkill(i)} />
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(profile?.skills || []).map((skill, i) => (
                            <span key={i} className="badge badge-primary">{skill}</span>
                        ))}
                        {(profile?.skills || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No skills added yet. Upload your CV or add manually.</p>}
                    </div>
                )}
            </motion.div>

            {/* Projects Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Code size={18} /> Projects ({(profile?.projects || []).length})
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {editing === 'projects' && (
                            <button onClick={addProject} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={14} /> Add
                            </button>
                        )}
                        <button onClick={() => editing === 'projects' ? saveEdit() : startEdit('projects')}
                            style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: editing === 'projects' ? 'var(--primary)' : 'transparent', color: editing === 'projects' ? 'white' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {editing === 'projects' ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
                        </button>
                    </div>
                </div>
                {editing === 'projects' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(editData.projects || []).map((proj, idx) => (
                            <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', position: 'relative' }}>
                                <button onClick={() => removeProject(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                <input className="input-field" value={proj.title} onChange={e => updateProject(idx, 'title', e.target.value)} placeholder="Project title" style={{ marginBottom: '8px' }} />
                                <textarea className="input-field" value={proj.description} onChange={e => updateProject(idx, 'description', e.target.value)} placeholder="Description" rows={2} style={{ marginBottom: '8px', resize: 'vertical' }} />
                                <input className="input-field" value={(proj.technologies || []).join(', ')} onChange={e => updateProject(idx, 'technologies', e.target.value)} placeholder="Technologies (comma separated)" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(profile?.projects || []).map((proj, i) => (
                            <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
                                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{proj.title}</p>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{proj.description}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {(proj.technologies || []).map((tech, j) => (
                                        <span key={j} style={{ padding: '3px 10px', borderRadius: '999px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent)', fontSize: '11px', fontWeight: '600' }}>{tech}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {(profile?.projects || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No projects added yet.</p>}
                    </div>
                )}
            </motion.div>

            {/* Internships Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={18} /> Internships ({(profile?.internships || []).length})
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {editing === 'internships' && (
                            <button onClick={addInternship} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={14} /> Add
                            </button>
                        )}
                        <button onClick={() => editing === 'internships' ? saveEdit() : startEdit('internships')}
                            style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: editing === 'internships' ? 'var(--primary)' : 'transparent', color: editing === 'internships' ? 'white' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {editing === 'internships' ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
                        </button>
                    </div>
                </div>
                {editing === 'internships' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(editData.internships || []).map((intern, idx) => (
                            <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', position: 'relative' }}>
                                <button onClick={() => removeInternship(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                    <input className="input-field" value={intern.company} onChange={e => updateInternship(idx, 'company', e.target.value)} placeholder="Company" />
                                    <input className="input-field" value={intern.role} onChange={e => updateInternship(idx, 'role', e.target.value)} placeholder="Role" />
                                </div>
                                <input className="input-field" value={intern.duration} onChange={e => updateInternship(idx, 'duration', e.target.value)} placeholder="Duration" style={{ marginBottom: '8px' }} />
                                <textarea className="input-field" value={intern.description} onChange={e => updateInternship(idx, 'description', e.target.value)} placeholder="Description" rows={2} style={{ resize: 'vertical' }} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(profile?.internships || []).map((intern, i) => (
                            <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
                                <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{intern.role} at {intern.company}</p>
                                <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>{intern.duration}</p>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{intern.description}</p>
                            </div>
                        ))}
                        {(profile?.internships || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No internships added yet.</p>}
                    </div>
                )}
            </motion.div>

            {/* Certifications Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} /> Certifications ({(profile?.certifications || []).length})
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {editing === 'certifications' && (
                            <button onClick={addCertification} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={14} /> Add
                            </button>
                        )}
                        <button onClick={() => editing === 'certifications' ? saveEdit() : startEdit('certifications')}
                            style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: editing === 'certifications' ? 'var(--primary)' : 'transparent', color: editing === 'certifications' ? 'white' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {editing === 'certifications' ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
                        </button>
                    </div>
                </div>
                {editing === 'certifications' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(editData.certifications || []).map((cert, idx) => (
                            <div key={idx} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', position: 'relative' }}>
                                <button onClick={() => removeCertification(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                    <input className="input-field" value={cert.name} onChange={e => updateCertification(idx, 'name', e.target.value)} placeholder="Certificate name" />
                                    <input className="input-field" value={cert.issuer} onChange={e => updateCertification(idx, 'issuer', e.target.value)} placeholder="Issuer" />
                                </div>
                                <input className="input-field" value={cert.date} onChange={e => updateCertification(idx, 'date', e.target.value)} placeholder="Date (e.g. 2025)" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(profile?.certifications || []).map((cert, i) => (
                            <div key={i} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Award size={18} style={{ color: 'var(--warning)' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{cert.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cert.issuer} • {cert.date}</p>
                                </div>
                            </div>
                        ))}
                        {(profile?.certifications || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No certifications added yet.</p>}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AIProfilePage;
