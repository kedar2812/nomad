import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db, logAction } from '../db/db';
import { syncService } from '../services/syncService';
import { v4 as uuidv4 } from 'uuid';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
    // 1. Initialize Query Client
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000,
                // Refetch local DB constantly to keep UI live
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

    // 2. READ: Live Query from Dexie
    const { data: activeSessions = [] } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            // Return all sessions that are NOT 'completed' OR completed today (for history)
            return await db.sessions.toArray();
        },
    });

    // 3. WRITE: Mutation to add Session (Local First -> Background Sync)
    const addSessionMutation = useMutation({
        mutationFn: async (newSession) => {
            // A. Save directly to Local DB (Instant UI update)
            await db.sessions.add({ ...newSession, synced: false });
            await logAction('create_session', { id: newSession.id });

            // B. Try to Sync immediately if online
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

    // 4. WRITE: Mutation to checkout
    const checkoutMutation = useMutation({
        mutationFn: async ({ sessionId, endTime }) => {
            await db.sessions.update(sessionId, {
                status: 'completed',
                endTime: endTime,
                synced: false // Needs to sync this update
            });
            await logAction('checkout_session', { sessionId });
            // Simple sync retry logic could go here
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sessions']);
        }
    });


    // Public API exposed to components
    const value = {
        isOnline,
        sessions: activeSessions,
        addSession: (sessionData) => {
            const id = uuidv4();
            addSessionMutation.mutate({ ...sessionData, id, status: 'active', synced: false });
        },
        checkoutSession: (sessionId) => {
            checkoutMutation.mutate({ sessionId, endTime: Date.now() });
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
