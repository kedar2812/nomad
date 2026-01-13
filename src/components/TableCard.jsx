import React, { useEffect, useState } from 'react';
import { Clock, User, Phone, AlertCircle, WifiOff, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

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
            const elapsed = now - session.startTime;
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

    // Glow Styles (No Glass)
    const neonStyles = {
        green: "border-neon-green shadow-[0_0_15px_rgba(0,255,148,0.4)] bg-stone-900",
        yellow: "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)] bg-stone-900",
        red: "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] bg-stone-900 animate-pulse"
    };

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
                    ? neonStyles[statusColor]
                    : "bg-stone-900/50 border-stone-800 hover:border-stone-700 hover:bg-stone-800"
            )}
        >
            {/* Sync Warning */}
            {isOccupied && session && !session.synced && (
                <div className="absolute top-4 right-4 z-10" title="Offline">
                    <WifiOff className="text-orange-400/80 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" size={16} />
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <h3 className={cn(
                    "text-3xl font-black tracking-tighter",
                    isOccupied ? "text-white drop-shadow-md" : "text-stone-500 group-hover:text-stone-300"
                )}>
                    {table.name}
                </h3>

                {isOccupied && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-lg flex items-center gap-2 backdrop-blur-md",
                        statusColor === 'green' && "bg-neon-green/10 text-neon-green border-neon-green/30",
                        statusColor === 'yellow' && "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
                        statusColor === 'red' && "bg-red-500/10 text-red-500 border-red-500/30"
                    )}>
                        <Clock size={12} strokeWidth={3} />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {isOccupied && session ? (
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 text-stone-100 p-3 rounded-2xl bg-gradient-to-r from-white/10 to-transparent border border-white/5 backdrop-blur-md">
                        <div className={cn(
                            "p-2 rounded-xl shadow-inner",
                            statusColor === 'red' ? "bg-red-500/20 text-red-400" : "bg-neon-blue/20 text-neon-blue"
                        )}>
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold truncate text-sm">{session.customerName}</span>
                    </div>

                    {session.phone && (
                        <div className="flex items-center gap-2 text-stone-400 px-2">
                            <Phone size={12} className="opacity-50" />
                            <span className="text-xs font-mono tracking-wider opacity-70">{session.phone}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-28 flex flex-col items-center justify-center gap-3 text-stone-600 group-hover:text-stone-400 transition-colors">
                    <div className="w-12 h-1.5 rounded-full bg-current opacity-30" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Open</span>
                </div>
            )}

            {/* Glowing Accent Gradient */}
            {isOccupied && (
                <div className={cn(
                    "absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none mix-blend-screen transition-colors duration-1000",
                    statusColor === 'green' && "bg-neon-green",
                    statusColor === 'yellow' && "bg-yellow-400",
                    statusColor === 'red' && "bg-red-600"
                )} />
            )}

            {/* Zombie Overlay */}
            {isZombie && (
                <div className="absolute inset-x-0 bottom-0 bg-red-600/90 py-1.5 text-center shadow-[0_-5px_20px_rgba(220,38,38,0.5)]">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
                        <AlertCircle size={12} /> Verify Presence
                    </span>
                </div>
            )}
        </motion.div>
    );
}

