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
        <header className="fixed top-4 left-24 right-8 h-16 rounded-2xl bg-white/70 backdrop-blur-xl border border-stone-200/50 flex items-center justify-between px-8 z-40 shadow-lg shadow-stone-200/40 transition-all duration-300">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">nomad</h1>
                <p className="text-[10px] text-stone-500 font-medium tracking-[0.2em] uppercase">Space Management</p>
            </div>

            {/* Search Bar */}
            <button
                onClick={handleSearchClick}
                className="flex items-center gap-3 px-4 py-2 bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 hover:border-stone-300 rounded-xl transition-all cursor-pointer group"
            >
                <Search size={16} className="text-stone-400 group-hover:text-stone-600" />
                <span className="text-sm text-stone-400 group-hover:text-stone-600">Search...</span>
                <div className="flex items-center gap-1 ml-4">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-white rounded border border-stone-200 shadow-sm">
                        ⌘
                    </kbd>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-white rounded border border-stone-200 shadow-sm">
                        K
                    </kbd>
                </div>
            </button>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-700">SYSTEM ACTIVE</span>
                </div>
            </div>
        </header>
    );
}
