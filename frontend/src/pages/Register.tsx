import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import './Auth.css';

// --- SVG Icon Components ---
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
);


const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Student' as 'Teacher' | 'Student',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);

    // CENTRAL REDIRECTION LOGIC
    const handleRoleBasedRedirect = (role: string) => {
        if (role === 'Teacher') {
            navigate('/teacher-dashboard');
        } else {
            navigate('/student-dashboard');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleSelect = (role: 'Teacher' | 'Student') =>
        setFormData({ ...formData, role });

    const validatePassword = (password: string) => {
        if (password.length < 8) return 'Protocol error: Minimum 8 characters required';
        if (!/[A-Z]/.test(password)) return 'Protocol error: Uppercase character required';
        if (!/[a-z]/.test(password)) return 'Protocol error: Lowercase character required';
        if (!/[0-9]/.test(password)) return 'Protocol error: Numeric character required';
        if (!/[!@#$%^&*]/.test(password)) return 'Protocol error: Special character required';
        return null;
    };

    // NORMAL EMAIL SIGNUP HANDLER
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Input mismatch: Passwords do not correlate');
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) { setError(passwordError); return; }

        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            
            // 1. Execute registration through AuthContext
            const user = await register(registerData);
            
            // 2. Redirect based on the role stored in the returned user object
            handleRoleBasedRedirect(user.role);
            
        } catch (err: any) {
            setError(err.response?.data?.message || 'Initialization failed. System node error.');
            setLoading(false);
        }
    };

    const handleGoogleSuccess = (credentialResponse: any) => {
        setPendingGoogleToken(credentialResponse.credential);
        setError('');
    };

    // GOOGLE ROLE SELECTION HANDLER
    const completeGoogleSignup = async (selectedRole: string) => {
        if (!pendingGoogleToken) return;
        setLoading(true);
        try {
            const res = await authService.googleLogin(pendingGoogleToken, selectedRole);
            if (res.success) {
                sessionStorage.setItem('token', res.token);
                sessionStorage.setItem('user', JSON.stringify(res.user));
                
                // Redirect based on the role assigned during Google signup
                handleRoleBasedRedirect(res.user.role);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google node integration failed');
            setPendingGoogleToken(null);
            setLoading(false);
        }
    };

    const passwordChecks = [
        { label: '8+ chars',  met: formData.password.length >= 8 },
        { label: 'Upper',     met: /[A-Z]/.test(formData.password) },
        { label: 'Lower',     met: /[a-z]/.test(formData.password) },
        { label: 'Number',    met: /[0-9]/.test(formData.password) },
        { label: 'Special',   met: /[!@#$%^&*]/.test(formData.password) },
    ];

    // ── Google Role Selection UI (Keep your logic, updated text) ──
    if (pendingGoogleToken) {
        return (
            <div className="nexus-layout">
                <div className="ambient-orb orb-cyan" />
                <div className="ambient-orb orb-indigo" />
                <div className="ambient-grid" />
                <div className="glass-container glass-container--centered fade-in">
                    <div className="role-select-panel">
                        <div className="logo-badge"><BrainIcon /><span>Vi-SlideS Unified</span></div>
                        <h2 className="role-select-title">Finalizing <em>Node.</em></h2>
                        <p className="role-select-sub">Select your operational identity</p>
                        <div className="role-cards-container">
                            <button onClick={() => completeGoogleSignup('Student')} className="role-card" disabled={loading}>
                                <span className="role-icon">🎓</span>
                                <h3>Student Participant</h3>
                                <p>Ask questions and access lecture streams</p>
                            </button>
                            <button onClick={() => completeGoogleSignup('Teacher')} className="role-card" disabled={loading}>
                                <span className="role-icon">👨‍🏫</span>
                                <h3>Faculty Instructor</h3>
                                <p>Manage AI triage and class analytics</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="nexus-layout">
            <div className="ambient-orb orb-cyan" />
            <div className="ambient-orb orb-indigo" />
            <div className="ambient-grid" />
            <div className="glass-container fade-in">
                {/* ── Left Panel ── */}
                <div className="glass-showcase">
                    <div className="showcase-inner">
                        <div className="logo-badge"><BrainIcon /><span>Vi-SlideS Unified</span></div>
                        <h2 className="showcase-big-text uppercase tracking-tighter">Establish<br /><em>Presence.</em></h2>
                        <p className="showcase-tagline">Initialize your profile within the<br />unified learning node</p>
                        <div className="stat-strip">
                            <div className="stat-item"><span className="stat-value">Uptime</span><span className="stat-label">99.9%</span></div>
                            <div className="stat-item"><span className="stat-value">Node</span><span className="stat-label">Vi-v4</span></div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div className="glass-form-area glass-form-area--register">
                    <div className="form-header">
                        <h1>Create Profile</h1>
                        <p>Synchronize your identity with the system</p>
                    </div>

                    {error && (
                        <div className="alert-box" role="alert">
                            <AlertIcon />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google verification failed.')}
                            theme="filled_black"
                            shape="pill"
                            width="100%"
                        />
                    </div>

                    <div className="nexus-divider"><span>or use credentials</span></div>

                    <form onSubmit={handleSubmit} className="nexus-form" noValidate>
                        <div className="role-toggle-wrapper">
                            <button
                                type="button"
                                className={`role-toggle-btn ${formData.role === 'Student' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('Student')}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                className={`role-toggle-btn ${formData.role === 'Teacher' ? 'active' : ''}`}
                                onClick={() => handleRoleSelect('Teacher')}
                            >
                                Teacher
                            </button>
                        </div>

                        <div className="input-group">
                            <label htmlFor="name">Full Identity</label>
                            <input type="text" id="name" name="name" placeholder="Full name identifier" value={formData.name} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label htmlFor="reg-email">Identity Endpoint</label>
                            <input type="email" id="reg-email" name="email" placeholder="institution@email.edu" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <label htmlFor="reg-password">Access Key</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? 'text' : 'password'} id="reg-password" name="password" placeholder="Create complex key" value={formData.password} onChange={handleChange} required />
                                <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <div className="password-requirements-dark">
                                {passwordChecks.map((req) => (
                                    <span key={req.label} className={`req-badge ${req.met ? 'met' : ''}`}>{req.label}</span>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Verify Access Key</label>
                            <div className="password-wrapper">
                                <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" placeholder="Confirm access key" value={formData.confirmPassword} onChange={handleChange} required />
                                <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="neon-btn font-black uppercase tracking-widest text-[11px]" disabled={loading}>
                            {loading ? <span className="spinner-mini" /> : 'Initialise Integration'}
                        </button>
                    </form>

                    <p className="bottom-text">
                        Already Synchronized? <Link to="/login" style={{color: 'white', fontWeight: 'bold'}}>Access Portal</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;