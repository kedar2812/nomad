import React from 'react';
import TableCard from './TableCard';
import { useTables } from '../hooks/useTables';

export default function TableGrid({ onTableClick }) {
    const { tables } = useTables();

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
