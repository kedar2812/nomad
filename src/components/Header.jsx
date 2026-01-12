import React from 'react';

export default function Header() {
    return (
        <header className="fixed top-4 left-24 right-8 h-16 rounded-2xl bg-stone-900/40 backdrop-blur-xl border border-white/5 flex items-center justify-between px-8 z-40 shadow-xl shadow-black/20 transition-all duration-300">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-200 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">nomad</h1>
                <p className="text-[10px] text-stone-400 font-medium tracking-[0.2em] uppercase opacity-80">Space Management</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-800 rounded-full border border-stone-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-stone-300">SYSTEM ACTIVE</span>
                </div>
            </div>
        </header>
    );
}
