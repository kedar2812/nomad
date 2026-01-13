import React, { useState } from 'react';
import TableGrid from '../components/TableGrid';
import CheckInModal from '../components/CheckInModal';
import TableDetailsModal from '../components/TableDetailsModal';
import { useOffline } from '../context/OfflineContext';
import { Wifi, WifiOff, Zap, Sun, Sofa, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
    const [selectedTable, setSelectedTable] = useState(null);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { isOnline, sessions } = useOffline();

    // Filter State
    const [filters, setFilters] = useState({
        hasPlug: undefined,
        nearWindow: undefined,
        type: undefined,
        status: undefined,
    });

    const handleTableClick = (table) => {
        setSelectedTable(table);
        if (table.status === 'occupied') {
            setIsDetailsOpen(true);
        } else {
            setIsCheckInOpen(true);
        }
    };

    const toggleFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key] === value ? undefined : value
        }));
    };

    const clearFilters = () => {
        setFilters({
            hasPlug: undefined,
            nearWindow: undefined,
            type: undefined,
            status: undefined,
        });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

    // Quick stats
    const activeSessions = sessions.filter(s => s.status === 'active');
    const pausedSessions = activeSessions.filter(s => s.isPaused);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400 drop-shadow-sm tracking-tight">Floor Plan</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase",
                            isOnline
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                        )}>
                            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <span className="text-stone-500 text-xs">
                            {activeSessions.length} active
                            {pausedSessions.length > 0 && (
                                <span className="text-yellow-500 ml-1">({pausedSessions.length} paused)</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-sm font-medium text-stone-400 bg-black/20 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-2 rounded-full bg-stone-600 shadow-[0_0_8px_rgba(87,83,78,0.6)]"></div>
                        <span>Open</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 border-l border-white/10">
                        <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,148,0.6)]"></div>
                        <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 border-l border-white/10">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                        <span>Overtime</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-stone-500 text-xs font-medium flex items-center gap-1">
                    <Filter size={12} /> Quick Filters:
                </span>

                {/* Power Outlet Filter */}
                <button
                    onClick={() => toggleFilter('hasPlug', true)}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        filters.hasPlug === true
                            ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                            : "bg-black/20 border-white/5 text-stone-400 hover:border-white/20"
                    )}
                >
                    <Zap size={12} /> Power
                </button>

                {/* Near Window Filter */}
                <button
                    onClick={() => toggleFilter('nearWindow', true)}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        filters.nearWindow === true
                            ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                            : "bg-black/20 border-white/5 text-stone-400 hover:border-white/20"
                    )}
                >
                    <Sun size={12} /> Window
                </button>

                {/* Seat Type Filters */}
                <button
                    onClick={() => toggleFilter('type', 'sofa')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        filters.type === 'sofa'
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                            : "bg-black/20 border-white/5 text-stone-400 hover:border-white/20"
                    )}
                >
                    🛋️ Sofa
                </button>

                <button
                    onClick={() => toggleFilter('type', 'beanbag')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        filters.type === 'beanbag'
                            ? "bg-pink-500/20 border-pink-500/40 text-pink-400"
                            : "bg-black/20 border-white/5 text-stone-400 hover:border-white/20"
                    )}
                >
                    🫘 Beanbag
                </button>

                {/* Available Only */}
                <button
                    onClick={() => toggleFilter('status', 'available')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        filters.status === 'available'
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-black/20 border-white/5 text-stone-400 hover:border-white/20"
                    )}
                >
                    ✅ Available
                </button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1"
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </div>

            {/* Table Grid */}
            <TableGrid onTableClick={handleTableClick} filters={filters} />

            {/* Modals */}
            {selectedTable && (
                <>
                    <CheckInModal
                        isOpen={isCheckInOpen}
                        onClose={() => setIsCheckInOpen(false)}
                        table={selectedTable}
                    />
                    <TableDetailsModal
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                        table={selectedTable}
                    />
                </>
            )}
        </div>
    );
}
