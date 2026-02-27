import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Briefcase, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const AlumniDirectoryPage = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ company: '', batch: '', skills: '', jobRole: '' });

    const fetchDirectory = async (p = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: 12 });
            Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
            const { data } = await API.get(`/users/directory?${params}`);
            setUsers(data.users);
            setTotal(data.total);
            setPages(data.pages);
            setPage(data.page);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => { fetchDirectory(); }, []);

    const handleFilter = (e) => {
        e.preventDefault();
        fetchDirectory(1);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Alumni Directory</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{total} members found</p>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary !py-2 text-sm">
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleFilter} className="glass-card p-5 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Company</label>
                            <input value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                                className="input-field !py-2 text-sm" placeholder="e.g. Google" />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Batch</label>
                            <input value={filters.batch} onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                                className="input-field !py-2 text-sm" placeholder="e.g. 2023" />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Skills</label>
                            <input value={filters.skills} onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                                className="input-field !py-2 text-sm" placeholder="e.g. React, Node" />
                        </div>
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Job Role</label>
                            <input value={filters.jobRole} onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}
                                className="input-field !py-2 text-sm" placeholder="e.g. Developer" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="btn-primary !py-2 text-sm"><Search size={14} /> Search</button>
                        <button type="button" onClick={() => { setFilters({ company: '', batch: '', skills: '', jobRole: '' }); fetchDirectory(1); }}
                            className="btn-secondary !py-2 text-sm">Clear</button>
                    </div>
                </motion.form>
            )}

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="spinner" /></div>
            ) : users.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No alumni found</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users.map((u, i) => (
                            <motion.div key={u._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <Link to={`/profile/${u._id}`} className="glass-card p-5 block">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={u.profilePic || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff`}
                                            alt={u.name} className="w-12 h-12 rounded-xl object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{u.jobRole || 'Not specified'}</p>
                                        </div>
                                        <span className="badge badge-primary capitalize text-[10px]">{u.role}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {u.company && <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}><Briefcase size={12} /> {u.company}</p>}
                                        {u.location && <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}><MapPin size={12} /> {u.location}</p>}
                                        {u.batch && <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}><Calendar size={12} /> Batch {u.batch}</p>}
                                    </div>
                                    {u.skills?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {u.skills.slice(0, 3).map((s) => <span key={s} className="badge badge-primary text-[10px] !py-0.5 !px-2">{s}</span>)}
                                            {u.skills.length > 3 && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+{u.skills.length - 3}</span>}
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-8">
                            <button onClick={() => fetchDirectory(page - 1)} disabled={page === 1} className="btn-secondary !py-2 !px-3 text-sm"
                                style={{ opacity: page === 1 ? 0.5 : 1 }}><ChevronLeft size={16} /></button>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Page {page} of {pages}</span>
                            <button onClick={() => fetchDirectory(page + 1)} disabled={page === pages} className="btn-secondary !py-2 !px-3 text-sm"
                                style={{ opacity: page === pages ? 0.5 : 1 }}><ChevronRight size={16} /></button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AlumniDirectoryPage;
