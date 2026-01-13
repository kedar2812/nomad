import React from 'react';
import { Search, Command } from 'lucide-react';

export default function Header({ onSearchClick }) {
    const handleSearchClick = () => {
        // Trigger Cmd+K event to open command palette
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            code: 'KeyK',
            ctrlKey: true,
            metaKey: true,
            bubbles: true
        });
        window.dispatchEvent(event);
    };

    return (
        <header className="fixed top-4 left-24 right-8 h-16 rounded-2xl bg-stone-900/40 backdrop-blur-xl border border-white/5 flex items-center justify-between px-8 z-40 shadow-xl shadow-black/20 transition-all duration-300">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-200 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">nomad</h1>
                <p className="text-[10px] text-stone-400 font-medium tracking-[0.2em] uppercase opacity-80">Space Management</p>
            </div>

            {/* Search Bar */}
            <button
                onClick={handleSearchClick}
                className="flex items-center gap-3 px-4 py-2 bg-black/30 hover:bg-black/40 border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer group"
            >
                <Search size={16} className="text-stone-500 group-hover:text-stone-400" />
                <span className="text-sm text-stone-500 group-hover:text-stone-400">Search...</span>
                <div className="flex items-center gap-1 ml-4">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-600 bg-white/5 rounded border border-white/10">
                        ⌘
                    </kbd>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-600 bg-white/5 rounded border border-white/10">
                        K
                    </kbd>
                </div>
            </button>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-stone-800 rounded-full border border-stone-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-stone-300">SYSTEM ACTIVE</span>
                </div>
            </div>
        </header>
    );
}
