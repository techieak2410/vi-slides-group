import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { sessionService } from '../../services/sessionService';

// Icons
import { 
  PlusIcon, 
  ArrowTrendingUpIcon, 
  CalendarDaysIcon, 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BoltIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const { toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [sessionTitle, setSessionTitle] = useState('');
    const [, setActiveSession] = useState<any>(null);
    const [pastSessions, setPastSessions] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [activeRes, historyRes] = await Promise.all([
                    sessionService.getActiveSession(),
                    sessionService.getTeacherSessions()
                ]);
                if (activeRes.success) setActiveSession(activeRes.data);
                if (historyRes.success) setPastSessions(historyRes.data);
            } catch (err) {
                console.error('Data load failed', err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionTitle.trim()) return;
        try {
            const response = await sessionService.createSession({ title: sessionTitle });
            if (response.success) navigate(`/session/${response.data.code}`);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-var-bg"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Header / Navigation */}
            <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                            VI-SLIDES
                        </span>
                        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                            <span className="text-slate-100 border-b-2 border-indigo-500 py-5">Overview</span>
                            <span className="hover:text-slate-200 cursor-pointer transition-colors py-5">Analytics</span>
                            <span className="hover:text-slate-200 cursor-pointer transition-colors py-5">Resources</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-slate-400 hover:text-white transition-colors">
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-white/10 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                                <p className="text-[10px] text-indigo-400 uppercase tracking-widest">Faculty Access</p>
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: Workspace */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* 1. Header Area */}
                        <section>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Workspace Dashboard</h1>
                            <p className="text-slate-400 max-w-xl">
                                System initialized. You have <span className="text-indigo-400 font-medium">{pastSessions.length} historical records</span> available for review.
                            </p>
                        </section>

                        {/* 2. Primary Action Card */}
                        <section className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <PlusIcon className="w-5 h-5 text-indigo-400" />
                                            Initialize New Session
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1">Ready the AI co-pilot for a new curriculum segment.</p>
                                    </div>
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <BoltIcon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                </div>
                                <form onSubmit={handleCreateSession} className="flex flex-col md:flex-row gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Session Identifier (e.g. Advanced Data Structures)"
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                        value={sessionTitle}
                                        onChange={(e) => setSessionTitle(e.target.value)}
                                    />
                                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                                        Launch
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </section>

                        {/* 3. Session Management */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <CalendarDaysIcon className="w-4 h-4" />
                                    Session Chronicles
                                </h3>
                                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">View full archive</button>
                            </div>

                            <div className="space-y-3">
                                {pastSessions.length > 0 ? (
                                    pastSessions.map(session => (
                                        <div key={session._id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-white/5">
                                                    <PresentationChartLineIcon className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{session.title}</h4>
                                                    <div className="flex gap-4 text-[11px] text-slate-500 mt-0.5">
                                                        <span className="flex items-center gap-1 font-mono"><UserGroupIcon className="w-3 h-3"/> 24 ENROLLED</span>
                                                        <span className="flex items-center gap-1 font-mono"><ChatBubbleLeftRightIcon className="w-3 h-3"/> 12 QUERIES</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                                        <div className="p-3 bg-white/5 rounded-full mb-3">
                                            <CalendarDaysIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm">No historical data segments found.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: AI Insights & Impact */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
                                <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-400" />
                                Curriculum Impact
                            </h3>
                            
                            <div className="space-y-8">
                                <div className="relative pl-6 border-l-2 border-emerald-500/30">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Live Aggregate Mood</p>
                                    <p className="text-2xl font-bold text-emerald-400">Optimal</p>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Students are exhibiting high curiosity markers across the last 3 segments.</p>
                                </div>

                                <div className="relative pl-6 border-l-2 border-indigo-500/30">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Inquiry Throughput</p>
                                    <p className="text-2xl font-bold text-white">412</p>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Total questions analyzed and processed by AI co-pilot this semester.</p>
                                </div>

                                <div className="relative pl-6 border-l-2 border-purple-500/30">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Efficiency Gain</p>
                                    <p className="text-2xl font-bold text-purple-400">18.4 Hrs</p>
                                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Estimated administrative time reclaimed through automated triage.</p>
                                </div>
                            </div>

                            <div className="mt-10 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Suggestion</p>
                                </div>
                                <p className="text-[12px] text-slate-300 italic leading-relaxed">
                                    "Based on recent queries, 40% of students struggle with **Asynchronous Logic**. Consider allocating 10 minutes for a recap."
                                </p>
                            </div>
                        </section>

                        <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-white/5 rounded-2xl">
                            <h4 className="text-xs font-semibold text-slate-200 mb-2">Platform Status</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <p className="text-[11px] text-slate-400">All systems operational</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;