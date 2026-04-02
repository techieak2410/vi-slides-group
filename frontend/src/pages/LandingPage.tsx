import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CommandLineIcon, 
  CpuChipIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">
            {/* ── TOP NAVIGATION ── */}
            <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                        <CommandLineIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Vi-SlideS Unified</span>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={() => navigate('/login')} className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Portal_Access</button>
                    <button onClick={() => navigate('/register')} className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded transition-all">Establish_Presence</button>
                </div>
            </nav>

            {/* ── HERO SECTION ── */}
            <header className="relative pt-32 pb-20 px-8 border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`, backgroundSize: '48px 48px' }} />
                
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="h-[1px] w-12 bg-indigo-500"></span>
                        <span className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.4em]">Protocol v4.0 Active</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white mb-8 leading-[0.9]">
                        ADAPTIVE<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-slate-500 italic">COGNITIVE</span><br />
                        SYSTEMS.
                    </h1>
                    
                    <p className="max-w-xl text-slate-500 text-lg leading-relaxed mb-12 font-medium">
                        Vi-SlideS revolutionizes pedagogical delivery through real-time question-driven triage and AI-synthesized class sentiment analysis.
                    </p>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/register')}
                            className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full hover:bg-indigo-500 hover:text-white transition-all shadow-2xl shadow-indigo-500/10"
                        >
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Deploy Now</span>
                            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-3 px-6 py-4 border border-white/10 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono uppercase tracking-widest">Network_Uptime: 99.9%</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── CORE MODULES (Vi-SlideS & Vi-Notes) ── */}
            <section className="py-24 px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Vi-SlideS Card */}
                <div className="glass-card bg-white/[0.01] border border-white/5 p-10 rounded-3xl group hover:bg-indigo-600/[0.02] transition-all">
                    <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <CpuChipIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.4em] mb-4">Module_01</h3>
                    <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Vi-SlideS</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Intelligent question triage system. Automatically addresses factual queries while prioritizing complex conceptual gaps for instructor intervention.
                    </p>
                    <ul className="space-y-3 border-t border-white/5 pt-8">
                        {['Real-time Sentiment Analysis', 'Smart Triage Algorithm', 'Cognitive Complexity Mapping'].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Vi-Notes Card */}
                <div className="glass-card bg-white/[0.01] border border-white/5 p-10 rounded-3xl group hover:bg-purple-600/[0.02] transition-all">
                    <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <ShieldCheckIcon className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-[10px] font-mono text-purple-500 uppercase tracking-[0.4em] mb-4">Module_02</h3>
                    <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Vi-Notes</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Authorship verification platform. Monitors keystroke dynamics and statistical signatures to validate genuine human-written composition.
                    </p>
                    <ul className="space-y-3 border-t border-white/5 pt-8">
                        {['Keystroke Rhythm Analysis', 'Pattern Authenticity Scoring', 'Silent Background Monitoring'].map((item) => (
                            <li key={item} className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                                <div className="w-1 h-1 bg-purple-500 rounded-full" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── TECHNICAL STATS BLOCK ── */}
            <section className="bg-slate-950 border-y border-white/5 py-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-12">
                    {[
                        { label: 'Network Throughput', value: '12.4k req/sec' },
                        { label: 'AI Synthesis Delay', value: '< 180ms' },
                        { label: 'Active Learning Nodes', value: '840+' },
                        { label: 'Data Encryption', value: 'AES-256' }
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2">{stat.label}</span>
                            <span className="text-2xl font-mono text-white font-bold tracking-tighter">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER TERMINAL ── */}
            <footer className="py-20 px-8 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Ready for System Integration?</h2>
                    <p className="text-slate-500 text-sm mb-10">Initialise your operational profile and connect to the unified cognitive node.</p>
                    <button 
                        onClick={() => navigate('/register')}
                        className="border border-white/10 hover:bg-white hover:text-black transition-all px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        Execute_Signup_Protocol
                    </button>
                    <p className="mt-12 text-[9px] font-mono text-slate-700 uppercase tracking-widest">
                        © 2026 Vi-SlideS Unified Node. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;