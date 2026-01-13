import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { X, Clock, Coffee, LogOut, MessageCircle } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { useStore } from '../store/useStore';
import { calculatePrice, formatCurrency } from '../config/pricing';
import { notificationService } from '../services/notificationService';

export default function TableDetailsModal({ isOpen, onClose, table }) {
    const { checkoutSession } = useOffline();
    // eslint-disable-next-line no-unused-vars
    const { menu } = useStore();

    const session = table?.session;

    const price = useMemo(() => {
        if (!session) return 0;
        return calculatePrice(session.duration);
    }, [session]);

    if (!isOpen || !session) return null;

    const handleCheckout = () => {
        if (confirm(`Checkout ${session.customerName} for ${formatCurrency(price)}?`)) {
            checkoutSession(session.id);

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 2000
            });

            onClose();
        }
    };

    const handleWhatsApp = () => {
        if (!session.phone) return alert("No phone number.");

        const msg = `Hi ${session.customerName}, your time is almost up at Nomad! You can extend your session or checkout at the counter.`;
        const link = notificationService.getWhatsAppLink(session.phone, msg);
        window.open(link, '_blank');
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-2xl bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-white transition-colors z-10">
                    <X size={20} />
                </button>

                {/* Left Col: Session Info */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">{session.customerName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-orange-500 font-mono font-bold bg-orange-500/10 px-2 py-0.5 rounded text-sm">Table {table.name}</span>
                            <span className="text-stone-500 text-xs font-mono">{session.id.slice(0, 8)}</span>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-5 space-y-4 border border-white/5">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-stone-400">
                                <Clock size={16} /> Duration
                            </div>
                            <span className="text-white font-bold">{session.duration} Hours</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-stone-400">
                                <Clock size={16} /> Start Time
                            </div>
                            <span className="text-white font-mono">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="text-stone-400">Total Bill</span>
                            <span className="text-2xl font-bold text-orange-400">{formatCurrency(price)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleWhatsApp}
                            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl font-bold transition-all border border-[#25D366]/20"
                        >
                            <MessageCircle size={18} /> WhatsApp
                        </button>
                        <button
                            onClick={handleCheckout}
                            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all border border-red-500/20"
                        >
                            <LogOut size={18} /> Checkout
                        </button>
                    </div>
                </div>

                {/* Right Col: Orders (Visual Only for now) */}
                <div className="flex-1 bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col">
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Coffee size={14} /> Current Orders
                    </h3>

                    <div className="flex-1 flex flex-col items-center justify-center text-stone-600 gap-2 opacity-50">
                        <Coffee size={32} strokeWidth={1} />
                        <p className="text-sm">No orders added</p>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                        <p className="text-xs text-yellow-500/80 leading-relaxed">
                            <strong>Note:</strong> Order management is currently disabled in this simplified check-in demo.
                        </p>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}
