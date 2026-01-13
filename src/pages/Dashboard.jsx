import React, { useState } from 'react';
import TableGrid from '../components/TableGrid';
import CheckInModal from '../components/CheckInModal';
import TableDetailsModal from '../components/TableDetailsModal';
import { useOffline } from '../context/OfflineContext';
import { Wifi, WifiOff } from 'lucide-react';

export default function Dashboard() {
    const [selectedTable, setSelectedTable] = useState(null);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { isOnline } = useOffline();

    const handleTableClick = (table) => {
        setSelectedTable(table);
        if (table.status === 'occupied') {
            setIsDetailsOpen(true);
        } else {
            setIsCheckInOpen(true);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400 drop-shadow-sm tracking-tight">Floor Plan</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-[10px] font-bold uppercase`}>
                            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                            {isOnline ? 'System Online' : 'Offline Mode'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-4 text-sm font-medium text-stone-400 bg-black/20 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-2 rounded-full bg-stone-600 shadow-[0_0_8px_rgba(87,83,78,0.6)]"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 border-l border-white/10">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                        <span>Occupied</span>
                    </div>
                </div>
            </div>

            <TableGrid onTableClick={handleTableClick} />

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
