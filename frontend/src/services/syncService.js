// Simulate a network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Sync Service
export const syncService = {
    // Determine if we are online (mocking standard navigator.onLine for now)
    isOnline: () => navigator.onLine,

    // Push a single session to cloud (Mock)
    pushSession: async (session) => {
        await delay(1000); // Simulate network latency

        // Randomly fail to simulate bad network (optional, currently enabled for testing reliability)
        // if (Math.random() < 0.1) throw new Error("Network Flake");

        console.log(`[Cloud Sync] Pushed session ${session.id} to cloud.`);
        return { success: true, syncedAt: Date.now() };
    },

    // Fetch latest sessions from cloud (Mock)
    fetchSessions: async () => {
        await delay(800);
        console.log(`[Cloud Sync] Fetched sessions from cloud.`);
        return []; // Return empty for now as we trust local first
    }
};
