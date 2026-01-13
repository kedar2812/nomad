import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Coffee, Command } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-16 rounded-2xl bg-stone-900/60 backdrop-blur-xl border border-white/5 flex flex-col items-center py-6 gap-8 z-50 shadow-2xl shadow-black/40">
            {/* Logo */}
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-xl text-orange-400 border border-white/5 shadow-inner shadow-orange-500/20">
                <Coffee size={24} />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 w-full px-2">
                <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Command Palette Hint */}
            <div className="px-2 w-full">
                <div className="flex flex-col items-center gap-1 p-2 text-stone-600 hover:text-stone-400 transition-colors cursor-pointer group"
                    title="Press ⌘K to open command palette"
                >
                    <Command size={16} />
                    <span className="text-[8px] font-mono">⌘K</span>
                </div>
            </div>
        </aside>
    );
}

function SidebarLink({ to, icon, label }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <NavLink
            to={to}
            className={cn(
                "group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300",
                isActive
                    ? 'bg-white/10 text-orange-200 shadow-[0_0_15px_rgba(251,146,60,0.1)]'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
            )}
        >
            <div className={cn(
                "transition-transform duration-300",
                isActive ? 'scale-110' : 'group-hover:scale-110'
            )}>
                {icon}
            </div>

            {/* Tooltip */}
            <span className={cn(
                "absolute left-14 bg-stone-800 px-2 py-1 rounded text-xs font-medium text-stone-200 opacity-0 -translate-x-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap border border-white/10",
                !isActive && 'group-hover:opacity-100 group-hover:translate-x-0'
            )}>
                {label}
            </span>
        </NavLink>
    );
}
