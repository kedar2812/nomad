import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { X, Clock, Coffee, LogOut, MessageCircle, Plus, Minus, Pause, Play, ShoppingBag } from 'lucide-react';
import { useOffline, MENU_ITEMS } from '../context/OfflineContext';
import { useStore } from '../store/useStore';
import { calculatePrice, formatCurrency } from '../config/pricing';
import { notificationService } from '../services/notificationService';
import { cn } from '../lib/utils';

export default function TableDetailsModal({ isOpen, onClose, table }) {
    const { checkoutSession, addOrder, removeOrder, pauseSession, resumeSession } = useOffline();
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'orders'

    const session = table?.session;

    // Calculate time-based price (excluding paused time)
    const timePrice = useMemo(() => {
        if (!session) return 0;
        return calculatePrice(session.duration);
    }, [session]);

    // Calculate orders total
    const ordersTotal = useMemo(() => {
        if (!session?.orders) return 0;
        return session.orders.reduce((sum, order) => sum + order.price, 0);
    }, [session?.orders]);

    // Combined total
    const totalBill = timePrice + ordersTotal;

    // Group menu items by category
    const menuByCategory = useMemo(() => {
        return MENU_ITEMS.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {});
    }, []);

    if (!isOpen || !session) return null;

    const handleCheckout = () => {
        if (confirm(`Checkout ${session.customerName} for ${formatCurrency(totalBill)}?\n\nTime: ${formatCurrency(timePrice)}\nOrders: ${formatCurrency(ordersTotal)}`)) {
            checkoutSession(session.id);

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                zIndex: 10000
            });

            onClose();
        }
    };

    const handleWhatsApp = () => {
        if (!session.phone) return alert("No phone number.");

        const msg = `Hi ${session.customerName}, your time is almost up at Nomad! Current bill: ${formatCurrency(totalBill)}. You can extend your session or checkout at the counter.`;
        const link = notificationService.getWhatsAppLink(session.phone, msg);
        window.open(link, '_blank');
    };

    const handlePauseToggle = () => {
        if (session.isPaused) {
            resumeSession(session.id);
        } else {
            pauseSession(session.id);
        }
    };

    const handleAddItem = (item) => {
        addOrder(session.id, item);
    };

    const handleRemoveItem = (orderId) => {
        removeOrder(session.id, orderId);
    };

    // Count items in cart
    const getItemCount = (itemId) => {
        return (session.orders || []).filter(o => o.id === itemId).length;
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-3xl bg-[#1C1C1E]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.5)] relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{session.customerName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-orange-500 font-mono font-bold bg-orange-500/10 px-2 py-0.5 rounded text-sm">Table {table.name}</span>
                            {session.isPaused && (
                                <span className="text-yellow-500 font-mono font-bold bg-yellow-500/10 px-2 py-0.5 rounded text-sm animate-pulse">
                                    ⏸️ PAUSED
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-all",
                            activeTab === 'details'
                                ? "text-orange-400 border-b-2 border-orange-400"
                                : "text-stone-500 hover:text-white"
                        )}
                    >
                        <Clock size={16} className="inline mr-2" />
                        Session Details
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-all relative",
                            activeTab === 'orders'
                                ? "text-orange-400 border-b-2 border-orange-400"
                                : "text-stone-500 hover:text-white"
                        )}
                    >
                        <ShoppingBag size={16} className="inline mr-2" />
                        Add Items
                        {(session.orders?.length || 0) > 0 && (
                            <span className="absolute -top-1 right-1/4 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {session.orders.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' ? (
                        <div className="space-y-6">
                            {/* Session Info */}
                            <div className="bg-black/20 rounded-xl p-5 space-y-4 border border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-stone-400">
                                        <Clock size={16} /> Booked Duration
                                    </div>
                                    <span className="text-white font-bold">{session.duration} Hours</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-stone-400">
                                        <Clock size={16} /> Start Time
                                    </div>
                                    <span className="text-white font-mono">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {session.totalPausedMs > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-yellow-500">
                                            <Pause size={16} /> Total Paused
                                        </div>
                                        <span className="text-yellow-400 font-mono">
                                            {Math.round(session.totalPausedMs / 60000)} mins
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bill Summary */}
                            <div className="bg-black/20 rounded-xl p-5 space-y-3 border border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-stone-400">Time Charges</span>
                                    <span className="text-white">{formatCurrency(timePrice)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-stone-400">Food & Beverages ({session.orders?.length || 0} items)</span>
                                    <span className="text-white">{formatCurrency(ordersTotal)}</span>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex justify-between items-center">
                                    <span className="text-stone-400 font-bold">Total Bill</span>
                                    <span className="text-3xl font-bold text-orange-400">{formatCurrency(totalBill)}</span>
                                </div>
                            </div>

                            {/* Current Orders List */}
                            {(session.orders?.length || 0) > 0 && (
                                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Current Orders</h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {session.orders.map((order) => (
                                            <div key={order.orderId} className="flex justify-between items-center text-sm">
                                                <span className="text-white">{order.emoji} {order.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-stone-400">{formatCurrency(order.price)}</span>
                                                    <button
                                                        onClick={() => handleRemoveItem(order.orderId)}
                                                        className="text-red-400 hover:text-red-300 p-1"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Orders Tab - Menu Grid */
                        <div className="space-y-6">
                            {Object.entries(menuByCategory).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">{category}</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {items.map((item) => {
                                            const count = getItemCount(item.id);
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleAddItem(item)}
                                                    className={cn(
                                                        "flex flex-col items-center p-3 rounded-xl border transition-all",
                                                        count > 0
                                                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                                            : "bg-black/20 border-white/5 text-white hover:border-orange-500/30"
                                                    )}
                                                >
                                                    <span className="text-2xl mb-1">{item.emoji}</span>
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                    <span className="text-xs text-stone-400">{formatCurrency(item.price)}</span>
                                                    {count > 0 && (
                                                        <span className="mt-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                                            {count}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={handlePauseToggle}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border",
                                session.isPaused
                                    ? "bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20"
                                    : "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
                            )}
                        >
                            {session.isPaused ? <Play size={18} /> : <Pause size={18} />}
                            {session.isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl font-bold transition-all border border-[#25D366]/20"
                        >
                            <MessageCircle size={18} /> Notify
                        </button>
                        <button
                            onClick={handleCheckout}
                            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all border border-red-500/20"
                        >
                            <LogOut size={18} /> Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
