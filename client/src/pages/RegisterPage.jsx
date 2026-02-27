import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, GraduationCap, ArrowRight, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        const result = await dispatch(registerUser(form));
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Account created successfully!');
            navigate('/');
        } else {
            toast.error(result.payload || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left - Branding */}
            <div
                className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-16 relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #7c3aed 0%, #8b5cf6 30%, #06b6d4 60%, #4f46e5 100%)' }}
            >
                <div className="absolute inset-0">
                    <div className="absolute top-24 right-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/8 rounded-full blur-3xl" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center text-white max-w-md"
                >
                    <div className="w-24 h-24 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-10 backdrop-blur-md border border-white/20 shadow-lg">
                        <GraduationCap size={44} />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Join the Network</h1>
                    <p className="text-xl font-medium opacity-90 mb-3">Be part of the LPU Alumni Community</p>
                    <p className="text-base opacity-70 leading-relaxed">
                        Connect, collaborate, and grow with thousands of LPU graduates across the globe.
                    </p>
                </motion.div>
            </div>

            {/* Right - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[440px]"
                >
                    <div className="lg:hidden flex items-center gap-3.5 mb-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'var(--primary-gradient)' }}>
                            <GraduationCap size={24} color="white" />
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Alumni Connect</h2>
                    </div>

                    <h2 className="text-3xl font-extrabold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
                    <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>Join the LPU alumni network today</p>

                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-field pl-11" placeholder="Enter your full name" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field pl-11" placeholder="Enter your email" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input type={showPassword ? 'text' : 'password'} value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field pl-11 pr-11" placeholder="Min. 6 characters" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5" style={{ color: 'var(--text-muted)' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>I am a</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['student', 'alumni'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setForm({ ...form, role })}
                                        className="flex items-center gap-3 p-4 rounded-xl text-sm font-semibold transition-all duration-250"
                                        style={{
                                            background: form.role === role ? 'var(--primary-gradient)' : 'var(--bg-secondary)',
                                            color: form.role === role ? 'white' : 'var(--text-secondary)',
                                            border: `1.5px solid ${form.role === role ? 'transparent' : 'var(--border)'}`,
                                            boxShadow: form.role === role ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                                        }}
                                    >
                                        {role === 'student' ? <GraduationCap size={20} /> : <Briefcase size={20} />}
                                        <span className="capitalize">{role}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center !py-3.5 text-[15px] !mt-8">
                            {isLoading ? <div className="spinner !w-5 !h-5 !border-white/30 !border-t-white" /> : <>Create Account <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
