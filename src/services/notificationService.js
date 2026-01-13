export const notificationService = {
    // 1. Browser Notifications
    requestPermission: async () => {
        if (!("Notification" in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === "granted";
    },

    sendBrowserNotification: (title, body) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: '/vite.svg' });
        }
    },

    // 2. WhatsApp Deep Link
    getWhatsAppLink: (phone, message) => {
        // Remove spaces, dashes, ensure country code (default to +91 if missing)
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    },

    // 3. Mock SMS (Placeholder for Backend Integration)
    sendMockSMS: async (phone, message) => {
        console.log(`[SMS Gateway Mock] Sending to ${phone}: "${message}"`);
        // In real backend integration, this would fetch('/api/send-sms', ...)
        return Promise.resolve({ success: true, id: Date.now() });
    }
};
