import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';
import './Auth.css';

// Original Icons from your Nexus Design
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

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    // Function to route user based on their specific role
    const handleNavigation = (user: any) => {
        if (user.role === 'Teacher') {
            navigate('/teacher-dashboard');
        } else {
            navigate('/student-dashboard');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(formData);
            handleNavigation(user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
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
                handleNavigation(res.user);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google identity verification failed.');
        }
    };

    return (
        <div className="nexus-layout">
            <div className="ambient-orb orb-cyan" />
            <div className="ambient-orb orb-indigo" />
            <div className="ambient-grid" />

            <div className="glass-container fade-in">

                {/* ── Left Panel (Showcase) ── */}
                <div className="glass-showcase">
                    <div className="showcase-inner">

                        <div className="logo-badge">
                            <BrainIcon />
                            <span>Vi-SlideS Unified</span>
                        </div>

                        <h2 className="showcase-big-text">
                            Classroom<br />
                            <em>Redefined.</em>
                        </h2>

                        <p className="showcase-tagline">
                            Adaptive Q&A and cognitive<br />insights for all participants
                        </p>

                        <div className="feature-list">
                            {[
                                'Universal Q&A Triage',
                                'Real-time Classroom Analytics',
                                'AI-Powered Topic Synthesis',
                            ].map((f) => (
                                <div className="feature-item" key={f}>
                                    <span className="feature-dot" />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>

                        <div className="stat-strip">
                            <div className="stat-item">
                                <span className="stat-value font-mono">24/7</span>
                                <span className="stat-label">Uptime</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value font-mono">PROD</span>
                                <span className="stat-label">Ready</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value font-mono">AIv4</span>
                                <span className="stat-label">Model</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Right Panel (Form) ── */}
                <div className="glass-form-area">
                    <div className="form-header">
                        <h1>Access Portal</h1>
                        <p>Authenticate to initialize your session</p>
                    </div>

                    {error && (
                        <div className="alert-box" role="alert">
                            <AlertIcon />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="nexus-form" noValidate>
                        <div className="input-group">
                            <label htmlFor="email">Identity Identifier</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="name@institution.edu"
                                value={formData.email}
                                onChange={onChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label htmlFor="password">Access Key</label>
                                <Link to="/forgot-password" style={{fontSize: '0.75rem', color: 'var(--color-primary)'}}>Forgot?</Link>
                            </div>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={onChange}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="neon-btn" disabled={loading}>
                            {loading ? <span className="spinner-mini" /> : 'Establish Link'}
                        </button>
                    </form>

                    <div className="nexus-divider">
                        <span>or federated login</span>
                    </div>

                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google authentication failed.')}
                            theme="filled_black"
                            shape="pill"
                            width="100%"
                        />
                    </div>

                    <p className="bottom-text" style={{fontSize: '0.8rem'}}>
                        Unregistered Node?{' '}
                        <Link to="/register" style={{color: 'white', fontWeight: 'bold'}}>Create Profile</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;