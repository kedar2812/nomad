import React from 'react';
import { Search, Command } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

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
        <header className="fixed top-4 left-24 right-8 h-16 rounded-2xl bg-secondary/70 backdrop-blur-xl border border-light/50 flex items-center justify-between px-8 z-40 shadow-lg shadow-stone-200/40 dark:shadow-black/40 transition-all duration-300">
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">nomad</h1>
                <p className="text-[10px] text-tertiary font-medium tracking-[0.2em] uppercase">Space Management</p>
            </div>

            {/* Search Bar */}
            <button
                onClick={handleSearchClick}
                className="flex items-center gap-3 px-4 py-2 bg-tertiary/80 hover:bg-tertiary border border-light hover:border-medium rounded-xl transition-all cursor-pointer group"
            >
                <Search size={16} className="text-tertiary group-hover:text-secondary" />
                <span className="text-sm text-tertiary group-hover:text-secondary">Search...</span>
                <div className="flex items-center gap-1 ml-4">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-tertiary bg-secondary rounded border border-light shadow-sm">
                        ⌘
                    </kbd>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-tertiary bg-secondary rounded border border-light shadow-sm">
                        K
                    </kbd>
                </div>
            </button>

            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">SYSTEM ACTIVE</span>
                </div>
            </div>
        </header>
    );
}
