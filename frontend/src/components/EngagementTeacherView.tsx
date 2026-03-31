import React, { useEffect, useState, useRef } from 'react';
import { socketService } from '../services/socketService';

interface StudentStatus {
    userId?: string;
    socketId: string;
    understanding: 'confused' | 'neutral' | 'understanding';
    user: any;
}

interface HandRaiseStatus {
    userId?: string;
    socketId: string;
    isRaised: boolean;
    user: any;
}

interface Notification {
    id: string;
    userId?: string;
    message: string;
    emoji: string;
    color: string;
    name: string;
    timestamp: Date;
    seq?: number;
}

interface EngagementTeacherViewProps {
    students?: any[];
    questions?: any[];
    onHandRaiseChange?: (count: number, lastRaiser?: string) => void;
}

const UNDERSTANDING_CONFIG = {
    confused: { emoji: '😕', label: 'Lost', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    neutral: { emoji: '😐', label: 'Ok', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    understanding: { emoji: '🙂', label: 'Got it', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
};

const MAX_NOTIFICATIONS = 15;
const NOTIFICATION_TTL_MS = 60000; // 60 seconds

const EngagementTeacherView: React.FC<EngagementTeacherViewProps> = ({ students = [], questions = [], onHandRaiseChange }) => {
    const [understandingMap, setUnderstandingMap] = useState<Map<string, StudentStatus>>(new Map());
    const [handRaisedMap, setHandRaisedMap] = useState<Map<string, HandRaiseStatus>>(new Map());
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeView, setActiveView] = useState<'dashboard' | 'student-detail'>('dashboard');
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [, setNotifCount] = useState(0);
    
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const pushNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'seq'>) => {
        setNotifCount(prev => {
            const nextCount = prev + 1;
            const entry: Notification = {
                ...notif,
                id: Math.random().toString(36).slice(2),
                timestamp: new Date(),
                seq: nextCount
            };
            setNotifications(all => [entry, ...all].slice(0, MAX_NOTIFICATIONS));
            return nextCount;
        });
    };

    const handleShowStudentDetail = (userId: string) => {
        setSelectedStudentId(userId);
        setActiveView('student-detail');
        
        // Also scroll to it if we were in dashboard
        const element = scrollRefs.current.get(userId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    // Auto-expire notifications older than TTL
    useEffect(() => {
        timerRef.current = setInterval(() => {
            const cutoff = Date.now() - NOTIFICATION_TTL_MS;
            setNotifications(prev => prev.filter(n => n.timestamp.getTime() > cutoff));
        }, 5000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    useEffect(() => {
        socketService.onTeacherUnderstandingUpdate((data) => {
            const key = data.user?._id || data.user?.id || data.socketId;
            const name = data.user?.name || 'Student';
            const cfg = UNDERSTANDING_CONFIG[data.understanding as keyof typeof UNDERSTANDING_CONFIG];

            setUnderstandingMap(prev => {
                const newMap = new Map(prev);
                newMap.set(key, { ...data, userId: key });
                return newMap;
            });

            if (cfg) {
                pushNotification({
                    userId: key,
                    emoji: cfg.emoji,
                    message: `reported feeling ${cfg.label}`,
                    color: cfg.color,
                    name,
                });
            }
        });

        socketService.onTeacherHandRaise((data) => {
            const key = data.user?._id || data.user?.id || data.socketId;
            const name = data.user?.name || 'Student';

            setHandRaisedMap(prev => {
                const newMap = new Map(prev);
                if (data.isRaised) {
                    newMap.set(key, { ...data, userId: key });
                } else {
                    newMap.delete(key);
                }
                onHandRaiseChange?.(newMap.size, data.isRaised ? name : undefined);
                return newMap;
            });

            // ALWAYS notify on hand RAISE
            if (data.isRaised) {
                pushNotification({
                    userId: key,
                    emoji: '✋',
                    message: 'raised their hand',
                    color: '#f59e0b',
                    name,
                });
            }
        });

        socketService.onStreamEmoji((data: any) => {
            const key = data.user?._id || data.user?.id || data.socketId;
            const name = data.user?.name || 'Student';
            pushNotification({
                userId: key,
                emoji: data.emoji,
                message: `sent a reaction`,
                color: 'var(--color-primary-light)',
                name,
            });
        });

        return () => {
            socketService.offEngagementEvents();
            socketService.offStreamEmoji();
        };
    }, []);

    const stats = {
        confused: Array.from(understandingMap.values()).filter(u => u.understanding === 'confused').length,
        neutral: Array.from(understandingMap.values()).filter(u => u.understanding === 'neutral').length,
        understanding: Array.from(understandingMap.values()).filter(u => u.understanding === 'understanding').length,
    };
    const totalReporting = stats.confused + stats.neutral + stats.understanding;

    const formatTime = (date: Date) => {
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 5) return 'just now';
        if (diff < 60) return `${diff}s ago`;
        return `${Math.floor(diff / 60)}m ago`;
    };

    if (activeView === 'student-detail' && selectedStudentId) {
        const student = students.find(s => (s._id || s.id) === selectedStudentId);
        const understanding = understandingMap.get(selectedStudentId);
        const handStatus = handRaisedMap.get(selectedStudentId);
        const studentQuestions = questions.filter(q => q.user?._id === selectedStudentId);
        const cfg = understanding ? UNDERSTANDING_CONFIG[understanding.understanding as keyof typeof UNDERSTANDING_CONFIG] : null;

        return (
            <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'var(--gradient-primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800
                    }}>
                        {student?.name?.charAt(0)}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{student?.name || 'Unknown Student'}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Engagement Metrics</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Current Status</span>
                            {handStatus?.isRaised && <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>HAND RAISED ✋</span>}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>{cfg?.emoji || '😶'}</span>
                            <div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: cfg?.color || 'var(--color-text-muted)' }}>
                                    {cfg?.label || 'Not Reporting'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Understanding Level</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1.5rem' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{studentQuestions.length}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Questions Asked</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>{student?.points || 0}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Engagement Points</div>
                        </div>
                    </div>
                </div>

                <button 
                    className="btn btn-primary" 
                    onClick={() => setActiveView('dashboard')}
                    style={{ marginTop: 'auto', width: '100%', padding: '0.8rem' }}
                >
                    Done
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ── Live Notifications Feed ── */}
            <div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.5rem'
                }}>
                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Live Activity
                    </span>
                    {notifications.length > 0 && (
                        <button
                            onClick={() => setNotifications([])}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '0.65rem', color: 'var(--color-text-muted)',
                                padding: '0.1rem 0.3rem', borderRadius: '4px'
                            }}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(255,255,255,0.08)',
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted)',
                        textAlign: 'center'
                    }}>
                        Waiting for new activity...
                    </div>
                ) : (
                    <div style={{
                        maxHeight: '180px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        paddingRight: '4px'
                    }}>
                        {notifications.map((n, idx) => (
                            <div
                                key={n.id}
                                onClick={() => n.userId && handleShowStudentDetail(n.userId)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    background: idx === 0 ? `${n.color}15` : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${idx === 0 ? n.color + '33' : 'rgba(255,255,255,0.05)'}`,
                                    transition: 'all 0.2s ease',
                                    animation: idx === 0 ? 'slideInNotif 0.3s ease' : 'none',
                                    opacity: idx === 0 ? 1 : 0.8,
                                    cursor: n.userId ? 'pointer' : 'default',
                                    position: 'relative'
                                }}
                            >
                                <span style={{ fontSize: '0.6rem', position: 'absolute', top: '2px', left: '4px', opacity: 0.4 }}>#{n.seq}</span>
                                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{n.emoji}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.78rem', color: n.color }}>
                                        {n.name}
                                    </span>
                                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginLeft: '0.25rem' }}>
                                        {n.message}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                    {formatTime(n.timestamp)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Class Feeling Bar ── */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ fontWeight: 600 }}>Class Pulse</span>
                    <span>{totalReporting} reporting</span>
                </div>

                <div style={{ height: '10px', display: 'flex', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: '0.6rem' }}>
                    {totalReporting > 0 ? (
                        <>
                            <div style={{ width: `${(stats.confused / totalReporting) * 100}%`, background: '#ef4444', transition: 'width 0.5s ease' }} />
                            <div style={{ width: `${(stats.neutral / totalReporting) * 100}%`, background: '#f59e0b', transition: 'width 0.5s ease' }} />
                            <div style={{ width: `${(stats.understanding / totalReporting) * 100}%`, background: '#10b981', transition: 'width 0.5s ease' }} />
                        </>
                    ) : (
                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }} />
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(Object.entries(UNDERSTANDING_CONFIG) as [keyof typeof UNDERSTANDING_CONFIG, typeof UNDERSTANDING_CONFIG['confused']][]).map(([key, cfg]) => (
                        <div key={key} style={{
                            flex: 1, padding: '0.3rem 0.4rem', borderRadius: '6px',
                            background: cfg.bg, border: `1px solid ${cfg.color}22`,
                            textAlign: 'center', fontSize: '0.7rem'
                        }}>
                            <div style={{ color: cfg.color, fontWeight: 700 }}>{stats[key]} {cfg.emoji}</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.6rem' }}>{cfg.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Student Status Roster ── */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ fontWeight: 600 }}>Individual Roster</span>
                    <span>{students.length} joined</span>
                </div>
                <div style={{
                    maxHeight: '220px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)'
                }}>
                    {students.length === 0 ? (
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: '0.5rem 0' }}>Standing by for students...</p>
                    ) : (
                        students.map((s: any) => {
                            const studentKey = s._id || s.id;
                            const status = understandingMap.get(studentKey);
                            const isHandRaised = handRaisedMap.has(studentKey);
                            const feelingCfg = status ? UNDERSTANDING_CONFIG[status.understanding as keyof typeof UNDERSTANDING_CONFIG] : null;

                            return (
                                <div 
                                    key={studentKey} 
                                    onClick={() => handleShowStudentDetail(studentKey)}
                                    ref={(el) => { if (el) scrollRefs.current.set(studentKey, el); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.55rem 0.75rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{
                                            width: '26px', height: '26px', borderRadius: '50%',
                                            background: 'var(--gradient-primary)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.7rem', fontWeight: 800, color: 'white'
                                        }}>
                                            {s.name?.charAt(0)}
                                        </div>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        {isHandRaised && <span style={{ fontSize: '1rem' }} title="Hand Raised">✋</span>}
                                        {feelingCfg && <span style={{ fontSize: '1.1rem' }} title={feelingCfg.label}>{feelingCfg.emoji}</span>}
                                        {!isHandRaised && !feelingCfg && <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', opacity: 0.5 }}>•</span>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideInNotif {
                    from { opacity: 0; transform: translateX(10px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default EngagementTeacherView;
