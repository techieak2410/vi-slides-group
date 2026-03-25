import api from './api';

export interface Assignment {
    _id: string;
    title: string;
    description: string;
    teacher: {
        _id: string;
        name: string;
        email: string;
    };
    maxMarks: number;
    deadline: string;
    status: 'active' | 'closed';
    createdAt: string;
}

export const assignmentService = {

    createAssignment: async (data: {
        title: string;
        description: string;
        maxMarks: number;
        deadline: string;
    }): Promise<{ success: boolean; data: Assignment }> => {
        const response = await api.post('/assignments', data);
        return response.data;
    },

    getAllAssignments: async (): Promise<{ success: boolean; data: Assignment[] }> => {
        const response = await api.get('/assignments');
        return response.data;
    },

    getAssignmentById: async (id: string): Promise<{ success: boolean; data: Assignment }> => {
        const response = await api.get(`/assignments/${id}`);
        return response.data;
    },

    updateAssignment: async (id: string, data: Partial<Assignment>): Promise<{ success: boolean; data: Assignment }> => {
        const response = await api.patch(`/assignments/${id}`, data);
        return response.data;
    },

    deleteAssignment: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/assignments/${id}`);
        return response.data;
    }
};