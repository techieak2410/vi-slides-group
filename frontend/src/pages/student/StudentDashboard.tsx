import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sessionService } from '../../services/sessionService';

// Icons
import { 
  ArrowRightIcon,
  HashtagIcon,
  ClockIcon,
  AcademicCapIcon,
  CommandLineIcon,
  CpuChipIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Toast from '../../components/Toast';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [pastSessions, setPastSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await sessionService.getStudentSessions();
                if (response.success) setPastSessions(response.data);
            } catch (err) {
                console.error("Sync error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (joinCode.length < 4) return;
        navigate(`/session/${joinCode.toUpperCase()}`);
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-[10px] text-indigo-500 uppercase tracking-widest">Initialising Environment...</div>;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden relative">
            
            {/* BACKGROUND ARCHITECTURE: Fills space without content */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
            </div>

            <nav className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl h-16 flex items-center px-8">
                <div className="flex-1 flex items-center gap-4">
                    <span className="text-xl font-black tracking-tighter text-white">VI-SLIDES</span>
                    <span className="h-4 w-[1px] bg-white/10" />
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Node ID: 2.4.0-ST</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-100">{user?.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono">ST_TOKEN: {user?.id?.slice(-8) || 'SESSION_01'}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT SIDE: MAIN ACTIONS */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* 1. The Hub Access Card */}
                        <section className="relative group">
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500/50 to-emerald-500/50 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-all" />
                            <div className="relative bg-slate-950 border border-white/10 rounded-2xl p-10 overflow-hidden">
                                {/* Decorative "Code" Background */}
                                <CommandLineIcon className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/[0.02] -rotate-12" />
                                
                                <div className="max-w-md relative z-10">
                                    <h2 className="text-2xl font-bold text-white mb-2">Initialize Session</h2>
                                    <p className="text-sm text-slate-400 mb-8">Enter the unique alphanumeric identifier to establish a real-time connection with the active lecture node.</p>
                                    
                                    <form onSubmit={handleJoin} className="flex gap-4">
                                        <div className="relative flex-1">
                                            <HashtagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                            <input 
                                                type="text" 
                                                placeholder="CODE"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 text-xl font-mono tracking-[0.4em] uppercase focus:border-indigo-500 outline-none transition-all"
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value)}
                                            />
                                        </div>
                                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-3">
                                            CONNECT <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        {/* 2. Structured Learning Log */}
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Historical Participation</h3>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {pastSessions.length > 0 ? (
                                    pastSessions.map(session => (
                                        <div key={session._id} className="group p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                                    <CpuChipIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                                                </div>
                                                <span className="text-[9px] font-mono text-slate-600 bg-black/40 px-2 py-1 rounded">ID: {session.code}</span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1">{session.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{new Date(session.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-10 text-center border-2 border-dashed border-white/5 rounded-2xl text-slate-600 text-xs">
                                        No historical session data detected in current node.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT SIDE: METRICS & STATUS */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Status Card */}
                        <section className="bg-slate-950 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node Status</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] text-emerald-500 font-bold uppercase">Operational</span>
                                </div>
                            </div>
                            
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[9px] text-slate-500 uppercase font-bold mb-2">Verified Participation</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-light text-white">{pastSessions.length}</span>
                                        <span className="text-xs text-indigo-400 font-mono">/ UNITS</span>
                                    </div>
                                </div>
                                
                                <button onClick={() => navigate('/certificates')} className="w-full py-3 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                    <AcademicCapIcon className="w-4 h-4" /> Access Assets
                                </button>
                            </div>
                        </section>

                        {/* System Metadata Info */}
                        <section className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <ShieldCheckIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-300 uppercase mb-2">System Integrity</p>
                                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                                        Note: All submissions are analyzed by the AI Layer to identify conceptual gaps. Your participation improves accuracy.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Fill Element: Visual Activity */}
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex flex-col gap-2">
                            <div className="flex justify-between text-[8px] font-mono text-slate-700">
                                <span>SYSTEM_LOAD</span>
                                <span>2.4ms</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500/40 w-[65%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;