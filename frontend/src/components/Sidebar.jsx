import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Coffee, Command } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-16 rounded-2xl bg-secondary/70 backdrop-blur-xl border border-light/50 flex flex-col items-center py-6 gap-8 z-50 shadow-lg shadow-stone-200/40 dark:shadow-black/40">
            {/* Logo */}
            <div className="p-3 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 rounded-xl text-brand-primary border border-brand-primary/30 dark:border-brand-secondary/30 shadow-sm">
                <Coffee size={24} />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-4 w-full px-2">
                <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />
            </nav>

            {/* Spacer */}
            <div className="flex-1" />
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
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800'
                    : 'text-tertiary hover:text-secondary hover:bg-tertiary'
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
                "absolute left-14 bg-secondary px-2 py-1 rounded-lg text-xs font-medium text-primary opacity-0 -translate-x-2 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap border border-light shadow-md",
                !isActive && 'group-hover:opacity-100 group-hover:translate-x-0'
            )}>
                {label}
            </span>
        </NavLink>
    );
}
