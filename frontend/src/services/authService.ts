import api from './api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Teacher' | 'Student';
    avatar?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'Teacher' | 'Student';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

export const authService = {
    // Register new user
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<{ success: boolean; user: User }> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update user details
    updateDetails: async (data: { name: string; email: string }): Promise<{ success: boolean; user: User }> => {
        // FIX 1: Standardized the casing of the URL to match typical Express routes
        const response = await api.put('/auth/update-details', data); 
        return response.data;
    },

    // Google Login
    googleLogin: async (token: string, role?: string): Promise<AuthResponse> => {
        // FIX 2: Updated to match the typical naming convention we used in the backend
        const response = await api.post<AuthResponse>('/auth/google', { token, role });
        return response.data;
    },

    // FEATURE ADDITION: Centralized Logout
    logout: (): void => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        // If you are using standard Axios instance, it's good practice to clear the header here too:
        // delete api.defaults.headers.common['Authorization'];
    }
};