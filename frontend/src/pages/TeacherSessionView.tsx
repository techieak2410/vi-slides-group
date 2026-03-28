import React from 'react';
import PollCreator from '../components/PollCreator';

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
    onHandRaiseChange?: (count: number, lastRaiser?: string) => void;
}

const TeacherSessionView: React.FC<TeacherSessionViewProps> = ({
    session,
    setActivePoll,
    showPollCreator,
    setShowPollCreator,
    setToast,
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
        </div>
    );
};

export default TeacherSessionView;
