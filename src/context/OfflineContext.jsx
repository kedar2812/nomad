import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db, logAction } from '../db/db';
import { syncService } from '../services/syncService';
import { v4 as uuidv4 } from 'uuid';

const OfflineContext = createContext();

// Menu items configuration (can be fetched from backend later)
export const MENU_ITEMS = [
    { id: 'coffee-1', name: 'Espresso', price: 50, category: 'Coffee', emoji: '☕' },
    { id: 'coffee-2', name: 'Cappuccino', price: 70, category: 'Coffee', emoji: '☕' },
    { id: 'coffee-3', name: 'Latte', price: 80, category: 'Coffee', emoji: '🥛' },
    { id: 'tea-1', name: 'Iced Tea', price: 60, category: 'Beverage', emoji: '🧋' },
    { id: 'tea-2', name: 'Hot Tea', price: 40, category: 'Beverage', emoji: '🍵' },
    { id: 'food-1', name: 'Club Sandwich', price: 120, category: 'Food', emoji: '🥪' },
    { id: 'food-2', name: 'Veg Burger', price: 100, category: 'Food', emoji: '🍔' },
    { id: 'snack-1', name: 'Brownie', price: 60, category: 'Snacks', emoji: '🍫' },
    { id: 'snack-2', name: 'Cookie', price: 30, category: 'Snacks', emoji: '🍪' },
];

export const OfflineProvider = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000,
                refetchInterval: 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <OfflineLogicProvider>
                {children}
            </OfflineLogicProvider>
        </QueryClientProvider>
    );
};

const OfflineLogicProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Monitor Online Status
    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);
        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
    }, []);

    // READ: Live Query from Dexie
    const { data: activeSessions = [] } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            return await db.sessions.toArray();
        },
    });

    // WRITE: Add Session
    const addSessionMutation = useMutation({
        mutationFn: async (newSession) => {
            await db.sessions.add({ ...newSession, synced: false });
            await logAction('create_session', { id: newSession.id });

            if (syncService.isOnline()) {
                try {
                    await syncService.pushSession(newSession);
                    await db.sessions.update(newSession.id, { synced: true });
                } catch (e) {
                    console.warn("Immediate sync failed, queued for later.");
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        },
    });

    // WRITE: Checkout Session
    const checkoutMutation = useMutation({
        mutationFn: async ({ sessionId, endTime }) => {
            await db.sessions.update(sessionId, {
                status: 'completed',
                endTime: endTime,
                synced: false
            });
            await logAction('checkout_session', { sessionId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        }
    });

    // WRITE: Add Order to Session
    const addOrderMutation = useMutation({
        mutationFn: async ({ sessionId, orderItem }) => {
            const session = await db.sessions.get(sessionId);
            if (!session) throw new Error('Session not found');

            const existingOrders = session.orders || [];
            const updatedOrders = [...existingOrders, {
                ...orderItem,
                orderId: uuidv4(),
                addedAt: Date.now()
            }];

            await db.sessions.update(sessionId, {
                orders: updatedOrders,
                synced: false
            });
            await logAction('add_order', { sessionId, item: orderItem.name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        }
    });

    // WRITE: Remove Order from Session
    const removeOrderMutation = useMutation({
        mutationFn: async ({ sessionId, orderId }) => {
            const session = await db.sessions.get(sessionId);
            if (!session) throw new Error('Session not found');

            const updatedOrders = (session.orders || []).filter(o => o.orderId !== orderId);

            await db.sessions.update(sessionId, {
                orders: updatedOrders,
                synced: false
            });
            await logAction('remove_order', { sessionId, orderId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        }
    });

    // WRITE: Pause Session
    const pauseSessionMutation = useMutation({
        mutationFn: async ({ sessionId }) => {
            const session = await db.sessions.get(sessionId);
            if (!session) throw new Error('Session not found');
            if (session.isPaused) return; // Already paused

            await db.sessions.update(sessionId, {
                isPaused: true,
                pausedAt: Date.now(),
                synced: false
            });
            await logAction('pause_session', { sessionId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        }
    });

    // WRITE: Resume Session
    const resumeSessionMutation = useMutation({
        mutationFn: async ({ sessionId }) => {
            const session = await db.sessions.get(sessionId);
            if (!session) throw new Error('Session not found');
            if (!session.isPaused) return; // Not paused

            const pauseDuration = Date.now() - (session.pausedAt || Date.now());
            const totalPausedMs = (session.totalPausedMs || 0) + pauseDuration;

            await db.sessions.update(sessionId, {
                isPaused: false,
                pausedAt: null,
                totalPausedMs: totalPausedMs,
                synced: false
            });
            await logAction('resume_session', { sessionId, pausedFor: pauseDuration });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        }
    });

    // Public API exposed to components
    const value = {
        isOnline,
        sessions: activeSessions,
        menuItems: MENU_ITEMS,

        // Session Management
        addSession: (sessionData) => {
            const id = uuidv4();
            addSessionMutation.mutate({
                ...sessionData,
                id,
                status: 'active',
                orders: [],
                isPaused: false,
                pausedAt: null,
                totalPausedMs: 0,
                synced: false
            });
        },
        checkoutSession: (sessionId) => {
            checkoutMutation.mutate({ sessionId, endTime: Date.now() });
        },

        // Order Management
        addOrder: (sessionId, orderItem) => {
            addOrderMutation.mutate({ sessionId, orderItem });
        },
        removeOrder: (sessionId, orderId) => {
            removeOrderMutation.mutate({ sessionId, orderId });
        },

        // Pause/Resume
        pauseSession: (sessionId) => {
            pauseSessionMutation.mutate({ sessionId });
        },
        resumeSession: (sessionId) => {
            resumeSessionMutation.mutate({ sessionId });
        },

        // Data Export/Import for Backup
        exportData: async () => {
            const sessions = await db.sessions.toArray();
            const logs = await db.logs.toArray();
            return JSON.stringify({ sessions, logs, exportedAt: Date.now() }, null, 2);
        },
        importData: async (jsonData) => {
            const data = JSON.parse(jsonData);
            if (data.sessions) {
                await db.sessions.clear();
                await db.sessions.bulkAdd(data.sessions);
            }
            if (data.logs) {
                await db.logs.clear();
                await db.logs.bulkAdd(data.logs);
            }
            await logAction('data_imported', { count: data.sessions?.length || 0 });
            queryClient.invalidateQueries(['sessions']);
        }
    };

    return (
        <OfflineContext.Provider value={value}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};
