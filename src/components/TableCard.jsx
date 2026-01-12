import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Clock, User, Phone, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

export default function TableCard({ table, onClick }) {
    const sessions = useStore((state) => state.sessions);
    const session = table.currentSessionId ? sessions[table.currentSessionId] : null;
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!session || session.status !== 'active') {
            setTimeLeft(null);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const end = session.startTime + session.duration;
            const remaining = end - now;
            setTimeLeft(remaining > 0 ? remaining : 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [session]);

    const formatTime = (ms) => {
        if (ms === null) return '--:--';
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isOccupied = table.status === 'occupied';
    const isUrgent = timeLeft !== null && timeLeft < 5 * 60 * 1000; // Less than 5 mins

    return (
        <div
            onClick={() => onClick(table)}
            className={`
        relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group
        hover:-translate-y-1 hover:shadow-2xl
        ${isOccupied
                    ? isUrgent
                        ? 'bg-rose-950/30 border-rose-500/50 hover:shadow-rose-900/50 hover:border-rose-400'
                        : 'bg-orange-950/20 border-orange-500/30 hover:shadow-orange-900/40 hover:border-orange-400'
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-white/5'
                }
        backdrop-blur-sm
      `}
        >
            <div className="flex justify-between items-start mb-6">
                <h3 className={`text-2xl font-bold tracking-tight ${isOccupied ? 'text-orange-100 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]' : 'text-stone-400 group-hover:text-stone-200 transition-colors'}`}>
                    {table.name}
                </h3>
                {isOccupied && (
                    <div className={`
            px-3 py-1 rounded-full text-xs font-mono font-bold border
            ${isUrgent
                            ? 'bg-rose-500/20 border-rose-500 text-rose-200 animate-pulse-glow shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                            : 'bg-orange-500/10 border-orange-500/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.2)]'}
          `}>
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {isOccupied && session ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-stone-300 text-sm p-2 rounded-lg bg-black/20">
                        <User size={16} className="text-orange-400" />
                        <span className="truncate font-medium">{session.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-400 text-xs font-mono p-2 rounded-lg bg-black/20">
                        <Phone size={14} className="text-stone-500" />
                        <span>{session.phone}</span>
                    </div>
                </div>
            ) : (
                <div className="h-20 flex items-center justify-center text-stone-600 text-sm font-medium tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                    Available
                </div>
            )}

            {/* Hover Glow Effect */}
            <div className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-xl -z-10 
                ${isOccupied ? (isUrgent ? 'bg-rose-600/20' : 'bg-orange-600/20') : 'bg-white/5'}`} />
        </div>
    );
}
