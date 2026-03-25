import api from './api';

export interface Poll {
    _id: string;
    question: string;
    type: 'mcq' | 'boolean';
    options: {
        text: string;
        votes: number;
    }[];
    session: string;
    isActive: boolean;
    resultsVisible: boolean;
    createdAt: string;
}

export interface CreatePollData {
    question: string;
    type: 'mcq' | 'boolean';
    options: string[];
    sessionId: string;
}

export const pollService = {
    // Create a new poll
    createPoll: async (data: CreatePollData): Promise<{ success: boolean; data: Poll }> => {
        const response = await api.post('/polls', data);
        return response.data;
    },

   getActivePoll: async (sessionId: string): Promise<{ success: boolean; data: Poll | null }> => {
        const response = await api.get(`/polls/session/${sessionId}`);
        return response.data;
    },

    votePoll: async (pollId: string, optionIndex: number): Promise<{ success: boolean; data: Poll }> => {
        const response = await api.patch(`/polls/${pollId}/vote`, { optionIndex });
        return response.data;
    },

    closePoll: async (pollId: string): Promise<{ success: boolean; data: Poll }> => {
        const response = await api.patch(`/polls/${pollId}/close`);
        return response.data;
    },

    declareWinner: async (pollId: string, optionIndex: number): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/polls/${pollId}/declare-winner`, { optionIndex });
        return response.data;
    }
};