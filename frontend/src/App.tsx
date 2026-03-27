import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import SessionView from './pages/SessionView';
import SessionSummary from './pages/SessionSummary';
import Assignments from './pages/Assignments';
import AssignmentDetails from './pages/AssignmentDetails';
import GuestJoinForm from './pages/GuestJoinForm';
import QueryPPTView from './pages/QueryPPTView';
import QueryAsk from './pages/QueryAsk';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TestComponent from './components/TestComponent';
import RootRedirect from './components/RootRedirect';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Public / Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/join/:code" element={<GuestJoinForm />} />
                    <Route path="/ask/:code" element={<QueryAsk />} />
                    <Route path="/test" element={<TestComponent />} />

                    {/* Teacher Protected Routes */}
                    <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
                    <Route path="/query-mode" element={<ProtectedRoute><QueryPPTView /></ProtectedRoute>} />

                    {/* Student Protected Routes */}
                    <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

                    {/* Shared Protected Routes */}
                    <Route path="/session/:code" element={<ProtectedRoute><SessionView /></ProtectedRoute>} />
                    <Route path="/session/:code/summary" element={<ProtectedRoute><SessionSummary /></ProtectedRoute>} />
                    <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
                    <Route path="/assignments/:id" element={<ProtectedRoute><AssignmentDetails /></ProtectedRoute>} />

                    {/* Root & Catch-all */}
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;