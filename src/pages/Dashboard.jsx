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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-stone-200">Floor Plan</h2>
                <div className="flex gap-4 text-sm text-stone-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-stone-800 border border-stone-600"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-stone-800 border border-orange-500"></div>
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
