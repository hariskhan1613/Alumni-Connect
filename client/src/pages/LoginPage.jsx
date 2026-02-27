import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginUser(form));
        if (result.meta.requestStatus === 'fulfilled') {
            toast.success('Welcome back!');
            navigate('/');
        } else {
            toast.error(result.payload || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left - Branding Panel */}
            <div
                className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-16 relative overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #4338ca 0%, #6366f1 30%, #8b5cf6 60%, #06b6d4 100%)' }}
            >
                <div className="absolute inset-0">
                    <div className="absolute top-16 left-16 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-16 right-16 w-96 h-96 bg-white/8 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
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
                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Alumni Connect</h1>
                    <p className="text-xl font-medium opacity-90 mb-3">Lovely Professional University</p>
                    <p className="text-base opacity-70 leading-relaxed max-w-sm mx-auto">
                        Connect with fellow alumni, discover career opportunities, and grow your professional network.
                    </p>
                    <div className="mt-12 flex items-center justify-center gap-10">
                        {[
                            { num: '10K+', label: 'Alumni' },
                            { num: '500+', label: 'Companies' },
                            { num: '2K+', label: 'Jobs' },
                        ].map(({ num, label }) => (
                            <div key={label} className="text-center">
                                <p className="text-4xl font-extrabold">{num}</p>
                                <p className="text-xs opacity-60 mt-1 uppercase tracking-wider">{label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[440px]"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3.5 mb-10">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                            style={{ background: 'var(--primary-gradient)' }}
                        >
                            <GraduationCap size={24} color="white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Alumni Connect</h2>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>LPU Network</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                    <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>

                    {error && (
                        <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field pl-11"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field pl-11 pr-11"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full justify-center !py-3.5 text-[15px] !mt-8"
                        >
                            {isLoading ? (
                                <div className="spinner !w-5 !h-5 !border-white/30 !border-t-white" />
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold hover:underline" style={{ color: 'var(--primary)' }}>
                            Create account
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
