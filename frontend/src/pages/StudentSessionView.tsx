import React from 'react';
import EngagementControls from '../components/EngagementControls';
import QuestionInput from '../components/QuestionInput';

interface StudentSessionViewProps {
    session: any;
    code: string;
    user: any;
}

const StudentSessionView: React.FC<StudentSessionViewProps> = ({ session, code, user }) => {
    return (
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto 2rem auto' }}>
            <div style={{ marginBottom: '1rem' }}>
                <EngagementControls sessionCode={code || ''} user={user} />
                <QuestionInput sessionId={session?._id || ''} sessionStatus={session?.status || 'active'} />
            </div>
        </div>
    );
};

export default StudentSessionView;
