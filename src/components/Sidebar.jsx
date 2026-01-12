import React from 'react';
import { LayoutDashboard, History, Settings, Coffee } from 'lucide-react';

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-20 bg-stone-900 border-r border-stone-800 flex flex-col items-center py-6 gap-8 z-50">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                <Coffee size={28} />
            </div>

            <nav className="flex flex-col gap-6 w-full px-2">
                <NavLink icon={<LayoutDashboard size={24} />} label="Board" active />
                <NavLink icon={<History size={24} />} label="History" />
                <NavLink icon={<Settings size={24} />} label="Settings" />
            </nav>
        </aside>
    );
}

function NavLink({ icon, label, active }) {
    return (
        <button
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${active
                    ? 'bg-stone-800 text-orange-400'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'
                }`}
        >
            {icon}
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
        </button>
    );
}
