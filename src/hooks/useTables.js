import { useOffline } from '../context/OfflineContext';

// Static config for 12 tables
const INITIAL_TABLES = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `T${i + 1}`,
    x: (i % 4) * 100,
    y: Math.floor(i / 4) * 100,
    status: 'available',
}));

export function useTables() {
    const { sessions } = useOffline();

    // FAIL-SAFE LOGIC: 
    // Merge static table definitions with active sessions from Dexie/Context
    // If a session exists for a table, that table is OCCUPIED.
    // This derived state ensures we never have a "ghost" table status.

    const tables = INITIAL_TABLES.map(table => {
        const activeSession = sessions.find(s =>
            s.tableId === table.id &&
            s.status === 'active'
        );

        if (activeSession) {
            return {
                ...table,
                status: 'occupied',
                currentSessionId: activeSession.id,
                session: activeSession // Attach full session object for easy access
            };
        }
        return table;
    });

    return { tables };
}
