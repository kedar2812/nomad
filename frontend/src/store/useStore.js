import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_TABLES = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `T${i + 1}`,
    x: (i % 4) * 100, // Placeholder for grid positioning
    y: Math.floor(i / 4) * 100,
    status: 'available', // available, occupied, reserved
    currentSessionId: null,
}));

const INITIAL_MENU = [
    { id: 1, name: 'Espresso', price: 50, category: 'Coffee' },
    { id: 2, name: 'Cappuccino', price: 70, category: 'Coffee' },
    { id: 3, name: 'Latte', price: 80, category: 'Coffee' },
    { id: 4, name: 'Iced Tea', price: 60, category: 'Beverage' },
    { id: 5, name: 'Club Sandwich', price: 120, category: 'Food' },
];

export const useStore = create(
    persist(
        (set, get) => ({
            tables: INITIAL_TABLES,
            menu: INITIAL_MENU,
            sessions: {}, // Keyed by session ID
            history: [],

            // Actions
            startSession: (tableId, customerDetails) => {
                const sessionId = Date.now().toString();
                const newSession = {
                    id: sessionId,
                    tableId,
                    customerName: customerDetails.name,
                    phone: customerDetails.phone,
                    startTime: Date.now(),
                    duration: customerDetails.duration * 60 * 60 * 1000, // hours to ms
                    pax: customerDetails.pax,
                    orders: [],
                    status: 'active',
                };

                set((state) => ({
                    sessions: { ...state.sessions, [sessionId]: newSession },
                    tables: state.tables.map((t) =>
                        t.id === tableId ? { ...t, status: 'occupied', currentSessionId: sessionId } : t
                    ),
                }));
            },

            endSession: (tableId) => {
                const state = get();
                const table = state.tables.find((t) => t.id === tableId);
                if (!table || !table.currentSessionId) return;

                const session = state.sessions[table.currentSessionId];
                const completedSession = { ...session, endTime: Date.now(), status: 'completed' };

                set((state) => {
                    const { [table.currentSessionId]: _, ...remainingSessions } = state.sessions;
                    return {
                        sessions: remainingSessions,
                        history: [completedSession, ...state.history],
                        tables: state.tables.map((t) =>
                            t.id === tableId ? { ...t, status: 'available', currentSessionId: null } : t
                        ),
                    };
                });
            },

            addOrder: (tableId, menuItemId) => {
                const state = get();
                const table = state.tables.find((t) => t.id === tableId);
                if (!table || !table.currentSessionId) return;

                const item = state.menu.find((m) => m.id === menuItemId);
                if (!item) return;

                set((state) => {
                    const session = state.sessions[table.currentSessionId];
                    return {
                        sessions: {
                            ...state.sessions,
                            [table.currentSessionId]: {
                                ...session,
                                orders: [...session.orders, item],
                            },
                        },
                    };
                });
            },
        }),
        {
            name: 'nomad-storage',
        }
    )
);
