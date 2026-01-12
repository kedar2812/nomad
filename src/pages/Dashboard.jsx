import React, { useState } from 'react';
import TableGrid from '../components/TableGrid';
import CheckInModal from '../components/CheckInModal';
import TableDetailsModal from '../components/TableDetailsModal';

export default function Dashboard() {
    const [selectedTable, setSelectedTable] = useState(null);
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400 drop-shadow-sm tracking-tight">Floor Plan</h2>
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
