import React from 'react';
import { LayoutDashboard, History, Settings, Coffee } from 'lucide-react';

export default function Sidebar() {
    return (
        <aside className="fixed left-4 top-4 bottom-4 w-16 rounded-2xl bg-stone-900/60 backdrop-blur-xl border border-white/5 flex flex-col items-center py-6 gap-8 z-50 shadow-2xl shadow-black/40">
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-xl text-orange-400 border border-white/5 shadow-inner shadow-orange-500/20">
                <Coffee size={24} />
            </div>

            <nav className="flex flex-col gap-4 w-full px-2">
                <NavLink icon={<LayoutDashboard size={20} />} label="Board" active />
                <NavLink icon={<History size={20} />} label="History" />
                <NavLink icon={<Settings size={20} />} label="Settings" />
            </nav>
        </aside>
    );
}

function NavLink({ icon, label, active }) {
    return (
        <button
            className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${active
                ? 'bg-white/10 text-orange-200 shadow-[0_0_15px_rgba(251,146,60,0.1)]'
                : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
                }`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>

            {/* Tooltip-style label for cleaner look */}
            <span className={`absolute left-14 bg-stone-800 px-2 py-1 rounded text-xs font-medium text-stone-200 opacity-0 -translate-x-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap border border-white/10 ${!active && 'group-hover:opacity-100 group-hover:translate-x-0'}`}>
                {label}
            </span>
        </button>
    );
}
