import { useOffline } from '../context/OfflineContext';

// Static config for 12 tables with seat attributes
const INITIAL_TABLES = [
    { id: 1, name: 'T1', x: 0, y: 0, hasPlug: true, type: 'desk', nearWindow: true },
    { id: 2, name: 'T2', x: 100, y: 0, hasPlug: true, type: 'desk', nearWindow: false },
    { id: 3, name: 'T3', x: 200, y: 0, hasPlug: false, type: 'sofa', nearWindow: true },
    { id: 4, name: 'T4', x: 300, y: 0, hasPlug: true, type: 'desk', nearWindow: false },
    { id: 5, name: 'T5', x: 0, y: 100, hasPlug: false, type: 'beanbag', nearWindow: false },
    { id: 6, name: 'T6', x: 100, y: 100, hasPlug: true, type: 'desk', nearWindow: true },
    { id: 7, name: 'T7', x: 200, y: 100, hasPlug: false, type: 'sofa', nearWindow: false },
    { id: 8, name: 'T8', x: 300, y: 100, hasPlug: true, type: 'desk', nearWindow: true },
    { id: 9, name: 'T9', x: 0, y: 200, hasPlug: false, type: 'beanbag', nearWindow: false },
    { id: 10, name: 'T10', x: 100, y: 200, hasPlug: true, type: 'desk', nearWindow: false },
    { id: 11, name: 'T11', x: 200, y: 200, hasPlug: false, type: 'sofa', nearWindow: true },
    { id: 12, name: 'T12', x: 300, y: 200, hasPlug: true, type: 'desk', nearWindow: false },
];

// Table type icons mapping
export const TABLE_TYPE_ICONS = {
    desk: { icon: '🪑', label: 'Desk' },
    sofa: { icon: '🛋️', label: 'Sofa' },
    beanbag: { icon: '🫘', label: 'Beanbag' },
};

// Attribute icons
export const ATTRIBUTE_ICONS = {
    hasPlug: { icon: '⚡', label: 'Power Outlet' },
    nearWindow: { icon: '☀️', label: 'Near Window' },
};

export function useTables(filters = {}) {
    const { sessions } = useOffline();

    // FAIL-SAFE LOGIC: 
    // Merge static table definitions with active sessions from Dexie/Context
    // If a session exists for a table, that table is OCCUPIED.
    // This derived state ensures we never have a "ghost" table status.

    let tables = INITIAL_TABLES.map(table => {
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
        return { ...table, status: 'available' };
    });

    // Apply filters if provided
    if (filters.hasPlug !== undefined) {
        tables = tables.filter(t => t.hasPlug === filters.hasPlug);
    }
    if (filters.type) {
        tables = tables.filter(t => t.type === filters.type);
    }
    if (filters.nearWindow !== undefined) {
        tables = tables.filter(t => t.nearWindow === filters.nearWindow);
    }
    if (filters.status) {
        tables = tables.filter(t => t.status === filters.status);
    }

    // Get available filter options
    const filterOptions = {
        types: [...new Set(INITIAL_TABLES.map(t => t.type))],
        hasPlugCount: INITIAL_TABLES.filter(t => t.hasPlug).length,
        nearWindowCount: INITIAL_TABLES.filter(t => t.nearWindow).length,
    };

    return { tables, filterOptions, allTables: INITIAL_TABLES };
}
