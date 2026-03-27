import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RootRedirect: React.FC = () => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--color-primary)' }}></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role?.toLowerCase() === 'teacher') {
        return <Navigate to="/teacher-dashboard" replace />;
    }

    // Default authenticated fallback
    return <Navigate to="/student-dashboard" replace />;
};

export default RootRedirect;
