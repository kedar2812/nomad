import React, { useEffect, useState } from 'react';
import { Clock, User, Phone, AlertCircle, WifiOff, Pause } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { TABLE_TYPE_ICONS, ATTRIBUTE_ICONS } from '../hooks/useTables';

export default function TableCard({ table, onClick }) {
    const session = table.session;
    const [timeLeft, setTimeLeft] = useState(null);
    const [statusColor, setStatusColor] = useState('green'); // green | yellow | red
    const [isZombie, setIsZombie] = useState(false);

    useEffect(() => {
        if (!session || session.status !== 'active') {
            setTimeLeft(null);
            setStatusColor('green');
            setIsZombie(false);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            // Subtract paused time from elapsed calculation
            const totalPausedMs = session.totalPausedMs || 0;
            const currentPauseMs = session.isPaused ? (now - (session.pausedAt || now)) : 0;
            const elapsed = now - session.startTime - totalPausedMs - currentPauseMs;
            const durationMs = session.duration * 60 * 60 * 1000;
            const remaining = durationMs - elapsed;

            // Traffic Light Logic
            if (remaining <= 0) setStatusColor('red');
            else if (remaining < 10 * 60 * 1000) setStatusColor('yellow');
            else setStatusColor('green');

            // Zombie Logic (> 5 Hours)
            if (elapsed / 1000 / 60 > 300) setIsZombie(true);

            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [session]);

    const formatTime = (ms) => {
        if (ms === null) return '--:--';
        const absMs = Math.abs(ms);
        const h = Math.floor(absMs / 3600000).toString().padStart(2, '0');
        const m = Math.floor((absMs % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((absMs % 60000) / 1000).toString().padStart(2, '0');
        return (ms < 0 ? '-' : '') + `${h}:${m}:${s}`;
    };

    const isOccupied = table.status === 'occupied';

    // Semantic theme styles
    const statusStyles = {
        green: "border-emerald-400 shadow-lg shadow-emerald-100 dark:shadow-emerald-950 bg-secondary",
        yellow: "border-yellow-400 shadow-lg shadow-yellow-100 dark:shadow-yellow-950 bg-secondary",
        red: "border-red-400 shadow-lg shadow-red-100 dark:shadow-red-950 bg-secondary animate-pulse"
    };

    // Get type icon
    const typeInfo = TABLE_TYPE_ICONS[table.type] || { icon: '🪑', label: 'Seat' };

    return (
        <motion.div
            layout
            onClick={() => onClick(table)}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
                "relative p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group",
                isOccupied
                    ? statusStyles[statusColor]
                    : "bg-secondary/70 border-light hover:border-medium hover:bg-secondary hover:shadow-lg"
            )}
        >
            {/* Attribute Icons - Top Right */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                {/* Sync Warning */}
                {isOccupied && session && !session.synced && (
                    <div title="Offline">
                        <WifiOff className="text-orange-500" size={14} />
                    </div>
                )}
                {/* Paused Indicator */}
                {isOccupied && session?.isPaused && (
                    <div title="Session Paused" className="text-yellow-500 animate-pulse">
                        <Pause size={14} />
                    </div>
                )}
                {/* Power Outlet */}
                {table.hasPlug && (
                    <span title={ATTRIBUTE_ICONS.hasPlug.label} className="text-sm opacity-60 hover:opacity-100">
                        {ATTRIBUTE_ICONS.hasPlug.icon}
                    </span>
                )}
                {/* Near Window */}
                {table.nearWindow && (
                    <span title={ATTRIBUTE_ICONS.nearWindow.label} className="text-sm opacity-60 hover:opacity-100">
                        {ATTRIBUTE_ICONS.nearWindow.icon}
                    </span>
                )}
            </div>

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <h3 className={cn(
                        "text-3xl font-black tracking-tighter",
                        isOccupied ? "text-primary" : "text-tertiary group-hover:text-secondary"
                    )}>
                        {table.name}
                    </h3>
                    {/* Seat Type Icon */}
                    <span title={typeInfo.label} className="text-lg opacity-50 group-hover:opacity-80">
                        {typeInfo.icon}
                    </span>
                </div>

                {isOccupied && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-sm flex items-center gap-2",
                        session?.isPaused && "opacity-50",
                        statusColor === 'green' && "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
                        statusColor === 'yellow' && "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700",
                        statusColor === 'red' && "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700"
                    )}>
                        <Clock size={12} strokeWidth={3} />
                        {session?.isPaused ? '⏸️' : formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {isOccupied && session ? (
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 text-secondary p-3 rounded-2xl bg-tertiary border border-light">
                        <div className={cn(
                            "p-2 rounded-xl shadow-sm",
                            statusColor === 'red' ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                        )}>
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="font-bold truncate text-sm block">{session.customerName}</span>
                            {/* Order count badge */}
                            {(session.orders?.length || 0) > 0 && (
                                <span className="text-xs text-orange-600">
                                    🛒 {session.orders.length} item{session.orders.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    {session.phone && (
                        <div className="flex items-center gap-2 text-stone-500 px-2">
                            <Phone size={12} className="opacity-50" />
                            <span className="text-xs font-mono tracking-wider">{session.phone}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-28 flex flex-col items-center justify-center gap-3 text-stone-300 group-hover:text-stone-400 transition-colors">
                    <div className="w-12 h-1.5 rounded-full bg-current opacity-30" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Open</span>
                </div>
            )}

            {/* Zombie Overlay */}
            {isZombie && (
                <div className="absolute inset-x-0 bottom-0 bg-red-500 py-1.5 text-center shadow-lg">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
                        <AlertCircle size={12} /> Verify Presence
                    </span>
                </div>
            )}
        </motion.div>
    );
}
