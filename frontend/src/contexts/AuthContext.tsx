import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, RegisterData, LoginData } from '../services/authService';

// 1. Define the Context Interface with correct Return Types
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<User>;    // Returns User object
    register: (data: RegisterData) => Promise<User>; // Returns User object
    logout: () => void;
    updateUser: (user: User) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Custom Hook for easy access
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 3. Persistent Session Check
    useEffect(() => {
        const initAuth = async () => {
            const token = sessionStorage.getItem('token');
            const storedUser = sessionStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Verify session with backend
                    const response = await authService.getCurrentUser();
                    setUser(response.user);
                } catch (error) {
                    // Force logout on invalid/expired token
                    sessionStorage.clear();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // 4. Enhanced Login Logic
    const login = async (data: LoginData): Promise<User> => {
        const response = await authService.login(data);
        
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);

        // Hand the user back to Login.tsx for immediate role-checking
        return response.user; 
    };

    // 5. Enhanced Registration Logic
    const register = async (data: RegisterData): Promise<User> => {
        const response = await authService.register(data);
        
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);

        // Hand the user back to Register.tsx for immediate role-checking
        return response.user;
    };

    const logout = () => {
        sessionStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };
    

    const updateUser = (updatedUser: User) => {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    // 6. Provide the values
    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};