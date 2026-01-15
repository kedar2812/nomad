import React from 'react';
import TableCard from './TableCard';
import { useTables } from '../hooks/useTables';

export default function TableGrid({ onTableClick, filters = {} }) {
    const { tables } = useTables(filters);

    if (tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-stone-500">
                <span className="text-4xl mb-4">🔍</span>
                <p className="text-sm font-medium">No tables match your filters</p>
                <p className="text-xs text-stone-600 mt-1">Try adjusting your filter criteria</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => (
                <TableCard
                    key={table.id}
                    table={table}
                    onClick={onTableClick}
                />
            ))}
        </div>
    );
}
