import React from 'react';
import PollCreator from '../components/PollCreator';
import EngagementTeacherView from '../components/EngagementTeacherView';
import { FiX } from 'react-icons/fi';

interface TeacherSessionViewProps {
    session: any;
    questions: any[];
    code: string;
    socketService: any;
    activePoll: any;
    setActivePoll: (poll: any) => void;
    showPollCreator: boolean;
    setShowPollCreator: (show: boolean) => void;
    showEngagement: boolean;
    setShowEngagement: (show: boolean) => void;
    pulseCheckResults: any;
    setToast: (toast: any) => void;
}

const TeacherSessionView: React.FC<TeacherSessionViewProps> = ({
    session,
    setActivePoll,
    showPollCreator,
    setShowPollCreator,
    showEngagement,
    setShowEngagement,
    setToast
}) => {
    return (
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
            {showPollCreator && (
                <PollCreator
                    sessionId={session?._id || ''}
                    onPollCreated={(poll) => {
                        setActivePoll(poll);
                        setShowPollCreator(false);
                        setToast({ message: 'Poll created successfully!', type: 'success' });
                    }}
                />
            )}

            {/* In a fuller refactor, PollCard would be rendered here, but right now it is in the container as both could view it in some instances.
                However, only teacher creates.
            */}

            {showEngagement && (
                <div
                    className="anim-slide-down"
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '400px',
                        maxWidth: '90vw',
                        zIndex: 1000,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowEngagement(false)}
                            style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                background: 'rgba(125,125,125,0.1)',
                                border: 'none',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}
                            title="Close"
                        >
                            <FiX size={16} />
                        </button>
                        <EngagementTeacherView />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherSessionView;
