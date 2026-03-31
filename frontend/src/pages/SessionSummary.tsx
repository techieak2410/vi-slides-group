import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionService, Session } from '../services/sessionService';

// Professional Icons (Matches your Teacher/Student Dashboards)
import {
  CheckCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const SessionSummary: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth(); // Accessing global auth data
    const summaryData = location.state?.summaryData;
    const [sessionDetails, setSessionDetails] = useState<Session | null>(null);

    useEffect(() => {
        if (summaryData?.code) {
            const fetchSession = async () => {
                try {
                    const res = await sessionService.getSessionDetails(summaryData.code);
                    if (res.success) {
                        setSessionDetails(res.data);
                    }
                } catch (error) {
                    console.error("Post-session synchronization failed", error);
                }
            };
            fetchSession();
        }
    }, [summaryData]);

    if (!summaryData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
                <div className="glass-card text-center max-w-md border-red-500/20">
                    <h2 className="text-xl font-bold text-white mb-2">Null Data Reference</h2>
                    <p className="text-xs text-slate-500 mb-6">No active session summary found in the current routing state.</p>
                    <button 
                        onClick={() => navigate(user?.role === 'Teacher' ? '/teacher-dashboard' : '/student-dashboard')} 
                        className="btn-primary w-full"
                    >
                        Return to Terminal
                    </button>
                </div>
            </div>
        );
    }

    const { title, code, questionCount, duration, moodSummary } = summaryData;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Status Header */}
                <div className="text-center mb-12 animate-in fade-in duration-700">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-white">Session Intelligence Report</h1>
                    <p className="text-slate-500 text-sm mt-2 uppercase tracking-widest font-mono">Status: Class_Concluded_Successfully</p>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass-card bg-white/[0.02] border-l-2 border-indigo-500 p-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">Subject Node</label>
                        <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold">{code}</span>
                    </div>

                    <div className="glass-card bg-white/[0.02] border-l-2 border-emerald-500 p-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">Query Volume</label>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white tracking-tighter">{questionCount}</span>
                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>

                    <div className="glass-card bg-white/[0.02] border-l-2 border-purple-500 p-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block mb-2">Active Duration</label>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white tracking-tighter">{duration}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Minutes</span>
                        </div>
                    </div>
                </div>

                {/* Role-Specific Content: Attendance (Teacher Only) */}
                {user?.role === 'Teacher' && sessionDetails?.attendance && sessionDetails.attendance.length > 0 && (
                    <section className="glass-card bg-white/[0.01] overflow-hidden mb-10">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                            <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Participation Ledger</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/20 text-[9px] text-slate-500 uppercase font-black">
                                    <tr>
                                        <th className="px-6 py-4">Participant Identity</th>
                                        <th className="px-6 py-4">Sync Start</th>
                                        <th className="px-6 py-4">Sync End</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs">
                                    {/* ... Logic for uniqueStudents Map remains the same ... */}
                                    {/* (Render your table rows here using the map logic from your snippet) */}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* AI Mood Synthesis (Universal) */}
                <section className="glass-card bg-indigo-500/5 border border-indigo-500/20 p-8 mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <CpuChipIcon className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">AI Cognitive Synthesis</h3>
                    </div>

                    <div className="pl-6 border-l-2 border-indigo-500/30">
                        <p className="text-lg text-slate-300 italic font-medium leading-relaxed">
                            "{moodSummary}"
                        </p>
                    </div>
                </section>

                {/* Final Navigation (Role-Aware) */}
                <div className="text-center">
                    <button
                        onClick={() => navigate(user?.role === 'Teacher' ? '/teacher-dashboard' : '/student-dashboard')}
                        className="btn-primary inline-flex items-center gap-3 px-12 py-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Return to {user?.role === 'Teacher' ? 'Command Center' : 'Learning Dashboard'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SessionSummary;