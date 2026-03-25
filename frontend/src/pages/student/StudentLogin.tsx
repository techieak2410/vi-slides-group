import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
// Professional Icons
import { 
  CommandLineIcon, 
  ShieldCheckIcon, 
  CpuChipIcon, 
  FingerPrintIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const StudentLogin: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData);
            // Redirecting specifically to student-dashboard
            navigate('/student-dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const res = await authService.googleLogin(credentialResponse.credential);
            if (res.success) {
                sessionStorage.setItem('token', res.token);
                sessionStorage.setItem('user', JSON.stringify(res.user));
                window.location.href = '/student-dashboard';
            }
        } catch (err: any) {
            setError('Google identity verification failed.');
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans antialiased selection:bg-indigo-500/30">
            {/* Background Architecture */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,#fff_1px,transparent_0)] bg-[size:40px_40px]" />
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
            </div>

            <div className="relative w-full max-w-5xl grid lg:grid-cols-2 bg-slate-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                
                {/* ── Left Panel: Technical Showcase ── */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-black border-r border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FingerPrintIcon className="w-64 h-64 -mr-20 -mt-20" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-12">
                            <CommandLineIcon className="w-6 h-6 text-indigo-500" />
                            <span className="text-sm font-black tracking-tighter text-white uppercase">Vi-SlideS / ST-NODE</span>
                        </div>

                        <h2 className="text-5xl font-extrabold tracking-tighter text-white leading-none mb-6">
                            Secure <br />
                            <span className="text-indigo-500">Access.</span>
                        </h2>

                        <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-8">
                            Initialize your student identity to sync with live curriculum nodes and AI analysis layers.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: CpuChipIcon, text: 'Real-time Triage Logic' },
                                { icon: ShieldCheckIcon, text: 'Verified Participation Tracking' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                    <item.icon className="w-4 h-4 text-indigo-500" />
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/5">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-600 uppercase mb-1 tracking-widest">Protocol</p>
                                <p className="text-xs font-mono text-slate-400">WSS://SECURE</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-600 uppercase mb-1 tracking-widest">Environment</p>
                                <p className="text-xs font-mono text-slate-400">PROD_V1.4</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel: The Form ── */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-slate-950">
                    <header className="mb-10">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Student Authentication</h1>
                        <p className="text-xs text-slate-500 mt-1">Provide credentials to establish a secure link.</p>
                    </header>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs mb-6 animate-shake">
                            <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Identity Endpoint</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="institution@email.edu"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                value={formData.email}
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Access Key</label>
                                <Link to="/forgot-password" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest">Recover?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                    value={formData.password}
                                    onChange={onChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    Establish Connection
                                    <ArrowRightIcon className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-10 text-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <span className="relative px-4 bg-slate-950 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Federated Identity</span>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google identity verification failed.')}
                            theme="filled_black"
                            size="large"
                            shape="pill"
                            width="100%"
                        />
                    </div>

                    <p className="mt-10 text-center text-[11px] text-slate-500 font-medium">
                        First time at this node?{' '}
                        <Link to="/register" className="text-white hover:text-indigo-400 transition-colors underline underline-offset-4">Initialize Account</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default StudentLogin;