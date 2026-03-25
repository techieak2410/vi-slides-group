import api from './api';

export interface Session {
    _id: string;
    title: string;
    description?: string;
    code: string;
    qrCodeDataUrl?: string;
    joinUrl?: string;
    teacher: any;
    students: any[];
    attendance?: {
        student: string;
        name: string;
        email: string;
        joinTime: string;
        leaveTime?: string;
    }[];
    status: 'active' | 'inactive' | 'ended' | 'paused';
    endedAt?: string;
    createdAt: string;
}

export interface CreateSessionData {
    title: string;
    description?: string;
}

export const sessionService = {

    createSession: async (data: CreateSessionData): Promise<{ success: boolean; data: Session }> => {
        const response = await api.post('/sessions', data);
        return response.data;
    },


    joinSession: async (code: string): Promise<{ success: boolean; data: Session }> => {
        const response = await api.post('/sessions/join', { code });
        return response.data;
    },

    getActiveSession: async (): Promise<{ success: boolean; data: Session | null }> => {
        const response = await api.get('/sessions/current/active');
        return response.data;
    },

    // Add this inside the sessionService object
    getTeacherSessions: async (): Promise<{ success: boolean; data: Session[] }> => {
        const response = await api.get('/sessions/teacher/history');
        return response.data;
    },

    getSessionDetails: async (code: string): Promise<{ success: boolean; data: Session }> => {
        const response = await api.get(`/sessions/${code}`);
        return response.data;
    },

    endSession: async (id: string): Promise<{
        success: boolean;
        data: {
            _id: string;
            title: string;
            code: string;
            questionCount: number;
            duration: number;
            moodSummary: string;
        };
        message: string
    }> => {
        const response = await api.patch(`/sessions/${id}/end`);
        return response.data;
    },

    pauseSession: async (id: string): Promise<{ success: boolean; status: string; message: string }> => {
        const response = await api.patch(`/sessions/${id}/pause`);
        return response.data;
    },

    leaveSession: async (code: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/sessions/${code}/leave`);
        return response.data;
    },

    getStudentSessions: async (): Promise<{ success: boolean; data: any[] }> => {
        const response = await api.get('/sessions/student/history');
        return response.data;
    },

    getQuerySession: async (): Promise<{ success: boolean; data: Session }> => {
        const response = await api.get('/sessions/query-mode');
        return response.data;
    },

    updateQueryUrl: async (url: string): Promise<{ success: boolean; data: Session }> => {
        const response = await api.patch('/sessions/query-mode/url', { url });
        return response.data;
    }
};