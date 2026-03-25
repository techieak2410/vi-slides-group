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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRoleSelect = (role: 'Teacher' | 'Student') =>
        setFormData({ ...formData, role });

    const validatePassword = (password: string) => {
        if (password.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain a number';
        if (!/[!@#$%^&*]/.test(password)) return 'Password must contain a special character';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) { setError(passwordError); return; }
        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSuccess = (credentialResponse: any) => {
        setPendingGoogleToken(credentialResponse.credential);
        setError('');
    };

    const completeGoogleSignup = async (selectedRole: string) => {
        if (!pendingGoogleToken) return;
        setLoading(true);
        try {
            const res = await authService.googleLogin(pendingGoogleToken, selectedRole);
            if (res.success) {
                sessionStorage.setItem('token', res.token);
                sessionStorage.setItem('user', JSON.stringify(res.user));
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google signup failed');
            setPendingGoogleToken(null);
            setLoading(false);
        }
    };

    const passwordChecks = [
        { label: '8+ chars',  met: formData.password.length >= 8 },
        { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
        { label: 'Lowercase', met: /[a-z]/.test(formData.password) },
        { label: 'Number',    met: /[0-9]/.test(formData.password) },
        { label: 'Special',   met: /[!@#$%^&*]/.test(formData.password) },
    ];

    // ── Google role-selection screen ──────────────────────────────────
    if (pendingGoogleToken) {
        return (
            <div className="nexus-layout">
                <div className="ambient-orb orb-cyan" />
                <div className="ambient-orb orb-indigo" />
                <div className="ambient-grid" />

                <div className="glass-container glass-container--centered fade-in">
                    <div className="role-select-panel">
                        <div className="logo-badge">
                            <BrainIcon />
                            <span>Vi-SlideS AI</span>
                        </div>

                        <h2 className="role-select-title">
                            One last <em>step.</em>
                        </h2>
                        <p className="role-select-sub">
                            How will you be using Vi-SlideS?
                        </p>

                        {error && (
                            <div className="alert-box" role="alert">
                                <AlertIcon />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="role-cards-container">
                            <button
                                onClick={() => completeGoogleSignup('Student')}
                                className="role-card"
                                disabled={loading}
                            >
                                <span className="role-icon" aria-hidden="true">🎓</span>
                                <h3>Student</h3>
                                <p>Ask questions and learn dynamically</p>
                            </button>
                            <button
                                onClick={() => completeGoogleSignup('Teacher')}
                                className="role-card"
                                disabled={loading}
                            >
                                <span className="role-icon" aria-hidden="true">👨‍🏫</span>
                                <h3>Teacher</h3>
                                <p>Get AI insights and guide the class</p>
                            </button>
                        </div>

                        {loading && (
                            <div className="loading-row">
                                <span className="spinner-mini" aria-hidden="true" />
                                <span>Finalizing your account…</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── Main register screen ──────────────────────────────────────────
    return (
        <div className="nexus-layout">
            <div className="ambient-orb orb-cyan" />
            <div className="ambient-orb orb-indigo" />
            <div className="ambient-grid" />

            <div className="glass-container fade-in">

                {/* ── Left Panel ── */}
                <div className="glass-showcase">
                    <div className="showcase-inner">
                        <div className="logo-badge">
                            <BrainIcon />
                            <span>Vi-SlideS AI</span>
                        </div>

                        <h2 className="showcase-big-text">
                            Join the<br />
                            <em>revolution.</em>
                        </h2>

                        <p className="showcase-tagline">
                            Adaptive learning powered<br />by real cognitive insight
                        </p>

                        <div className="feature-list">
                            {[
                                'AI-powered question analysis',
                                'Real-time classroom feedback',
                                'Adaptive slide generation',
                            ].map((f) => (
                                <div className="feature-item" key={f}>
                                    <span className="feature-dot" />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        <div className="stat-strip">
                            <div className="stat-item">
                                <span className="stat-value">12k+</span>
                                <span className="stat-label">Educators</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">98%</span>
                                <span className="stat-label">Accuracy</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">4.9★</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div className="glass-form-area glass-form-area--register">
                    <div className="form-header">
                        <h1>Create account</h1>
                        <p>Sign up to get started</p>
                    </div>

                    {error && (
                        <div className="alert-box" role="alert">
                            <AlertIcon />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Google first */}
                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google authentication failed.')}
                            theme="filled_black"
                            size="large"
                            shape="rectangular"
                            width="100%"
                            text="signup_with"
                        />
                    </div>

                    <div className="nexus-divider">
                        <span>or register with email</span>
                    </div>

                    <form onSubmit={handleSubmit} className="nexus-form" noValidate>

                        {/* Role toggle */}
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
                            <label htmlFor="name">Full name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Jane Smith"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="reg-email">Email address</label>
                            <input
                                type="email"
                                id="reg-email"
                                name="email"
                                placeholder="name@institution.edu"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="reg-password">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="reg-password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <div className="password-requirements-dark">
                                {passwordChecks.map((req) => (
                                    <span key={req.label} className={`req-badge ${req.met ? 'met' : ''}`}>
                                        {req.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="neon-btn" disabled={loading}>
                            {loading
                                ? <span className="spinner-mini" aria-hidden="true" />
                                : 'Create Account'}
                        </button>
                    </form>

                    <p className="bottom-text">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Register;