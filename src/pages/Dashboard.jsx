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
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-700 to-stone-500 dark:from-stone-200 dark:to-stone-400 tracking-tight">Floor Plan</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase",
                            isOnline
                                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                        )}>
                            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <span className="text-tertiary text-xs">
                            {activeSessions.length} active
                            {pausedSessions.length > 0 && (
                                <span className="text-yellow-600 dark:text-yellow-500 ml-1">({pausedSessions.length} paused)</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-sm font-medium text-tertiary bg-secondary/70 p-2 rounded-xl backdrop-blur-sm border border-light/50 shadow-sm">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 shadow-sm"></div>
                        <span>Open</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 border-l border-light">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span>Active</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 border-l border-light">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
                        <span>Overtime</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-tertiary text-xs font-medium flex items-center gap-1">
                    <Filter size={12} /> Quick Filters:
                </span>

                {/* Power Outlet Filter */}
                <button
                    onClick={() => toggleFilter('hasPlug', true)}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        filters.hasPlug === true
                            ? "bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400"
                            : "bg-secondary/70 border-light text-tertiary hover:border-medium hover:bg-secondary"
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
                            ? "bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400"
                            : "bg-secondary/70 border-light text-tertiary hover:border-medium hover:bg-secondary"
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
                            ? "bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400"
                            : "bg-secondary/70 border-light text-tertiary hover:border-medium hover:bg-secondary"
                    )}
                >
                    🛋️ Sofa
                </button>

                <button
                    onClick={() => toggleFilter('type', 'beanbag')}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                        filters.type === 'beanbag'
                            ? "bg-pink-100 dark:bg-pink-950 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-400"
                            : "bg-secondary/70 border-light text-tertiary hover:border-medium hover:bg-secondary"
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
                            ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                            : "bg-secondary/70 border-light text-tertiary hover:border-medium hover:bg-secondary"
                    )}
                >
                    ✅ Available
                </button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-all flex items-center gap-1"
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
