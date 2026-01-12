import React from 'react';

export default function Header() {
    return (
        <header className="fixed top-0 left-20 right-0 h-16 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 flex items-center justify-between px-8 z-40">
            <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-200 to-amber-500 bg-clip-text text-transparent">nomad</h1>
                <p className="text-xs text-stone-500 font-medium tracking-wider uppercase">Space Management</p>
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
