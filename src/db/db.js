import Dexie from 'dexie';

export const db = new Dexie('NomadLocalDB');

// Define schema
db.version(1).stores({
    sessions: 'id, tableId, startTime, status, synced', // Primary key + indexed props
    logs: '++id, action, timestamp', // Audit trail
    tables: 'id, status' // Persist table status locally
});

// Helper to log actions
export const logAction = async (action, details = {}) => {
    try {
        await db.logs.add({
            action,
            details,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Failed to log action:', error);
    }
};
