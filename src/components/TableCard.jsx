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
        relative p-4 rounded-2xl border-2 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg
        ${isOccupied
                    ? isUrgent ? 'bg-red-950/20 border-red-500/50 hover:border-red-500' : 'bg-stone-800/50 border-orange-500/30 hover:border-orange-500'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-600 hover:bg-stone-800'
                }
      `}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className={`text-2xl font-bold ${isOccupied ? 'text-orange-400' : 'text-stone-600'}`}>
                    {table.name}
                </h3>
                {isOccupied && (
                    <div className={`
            px-2 py-1 rounded-md text-xs font-mono font-bold
            ${isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500/20 text-orange-400'}
          `}>
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {isOccupied && session ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                        <User size={14} />
                        <span className="truncate">{session.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
                        <Phone size={12} />
                        <span>{session.phone}</span>
                    </div>
                </div>
            ) : (
                <div className="h-12 flex items-center justify-center text-stone-700 text-sm">
                    Available
                </div>
            )}
        </div>
    );
}
