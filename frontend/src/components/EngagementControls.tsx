import React, { useState } from 'react';
import { socketService } from '../services/socketService';

interface EngagementControlsProps {
    sessionCode: string;
    user: any;
}

type Feeling = 'confused' | 'neutral' | 'understanding';

const FEELINGS: { key: Feeling; emoji: string; label: string; color: string; bg: string; border: string }[] = [
    { key: 'confused',      emoji: '😕', label: 'Lost',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.4)' },
    { key: 'neutral',       emoji: '😐', label: 'Ok',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)' },
    { key: 'understanding', emoji: '🙂', label: 'Got it', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)' },
];

const EngagementControls: React.FC<EngagementControlsProps> = ({ sessionCode, user }) => {
    const [feeling, setFeeling] = useState<Feeling | null>(null);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [justSent, setJustSent] = useState(false);

    const handleFeelingChange = (level: Feeling) => {
        setFeeling(level);
        socketService.emitUnderstandingUpdate(sessionCode, level, user);
        // Brief confirmation flash
        setJustSent(true);
        setTimeout(() => setJustSent(false), 1500);
    };

    const toggleHandRaise = () => {
        const newState = !isHandRaised;
        setIsHandRaised(newState);
        socketService.emitHandRaise(sessionCode, newState, user);
    };

    return (
        <div className="glass-card" style={{ marginBottom: '1rem', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>How are you feeling?</h4>
                {justSent && (
                    <span style={{
                        fontSize: '0.7rem', color: '#10b981',
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '20px',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        ✓ Sent to teacher
                    </span>
                )}
            </div>

            {/* Feeling Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {FEELINGS.map(f => {
                    const isSelected = feeling === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => handleFeelingChange(f.key)}
                            style={{
                                flex: 1,
                                padding: '0.5rem 0.25rem',
                                border: `1.5px solid ${isSelected ? f.border : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: '8px',
                                background: isSelected ? f.bg : 'rgba(255,255,255,0.03)',
                                color: isSelected ? f.color : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'center',
                                fontSize: '0.72rem',
                                fontWeight: isSelected ? 700 : 400,
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isSelected ? `0 0 12px ${f.border}` : 'none'
                            }}
                        >
                            <div style={{ fontSize: '1.3rem', marginBottom: '0.15rem' }}>{f.emoji}</div>
                            {f.label}
                        </button>
                    );
                })}
            </div>

            {/* Raise Hand Button */}
            <button
                onClick={toggleHandRaise}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    border: `1.5px solid ${isHandRaised ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                    background: isHandRaised ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                    color: isHandRaised ? '#f59e0b' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isHandRaised ? 700 : 400,
                    transition: 'all 0.2s ease',
                    boxShadow: isHandRaised ? '0 0 12px rgba(245,158,11,0.3)' : 'none',
                    animation: isHandRaised ? 'pulse 2s infinite' : 'none'
                }}
            >
                <span style={{ fontSize: '1.1rem' }}>{isHandRaised ? '🖐️' : '✋'}</span>
                {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                {isHandRaised && (
                    <span style={{
                        fontSize: '0.65rem',
                        background: '#f59e0b',
                        color: 'white',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '20px',
                        marginLeft: '0.25rem'
                    }}>LIVE</span>
                )}
            </button>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
                    50%       { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
                }
            `}</style>
        </div>
    );
};

export default EngagementControls;
