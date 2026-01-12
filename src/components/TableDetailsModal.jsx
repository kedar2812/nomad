import React, { useState } from 'react';
import { X, Clock, Coffee, Bell, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function TableDetailsModal({ isOpen, onClose, table }) {
    const { sessions, menu, addOrder, endSession } = useStore();
    const session = table.currentSessionId ? sessions[table.currentSessionId] : null;

    if (!isOpen || !session) return null;

    const handleCheckout = () => {
        if (confirm(`Checkout ${session.customerName}?`)) {
            endSession(table.id);
            onClose();
        }
    };

    const handleNotify = () => {
        if (!session.phone) {
            alert("No phone number recorded.");
            return;
        }
        const msg = `Hi ${session.customerName}, your time at Nomad is almost up!`;
        const url = `https://wa.me/${session.phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col md:flex-row gap-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 z-10">
                    <X size={20} />
                </button>

                {/* Left Col: Session Info */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-200">{session.customerName}</h2>
                        <p className="text-orange-500 text-sm font-mono">Table {table.name}</p>
                    </div>

                    <div className="bg-stone-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-stone-500">Duration</span>
                            <span className="text-stone-300">{(session.duration / 3600000).toFixed(1)} hrs</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-stone-500">Started</span>
                            <span className="text-stone-300">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleNotify}
                            className="flex items-center justify-center gap-2 py-3 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-400 font-medium transition-all"
                        >
                            <Bell size={18} /> Notify
                        </button>
                        <button
                            onClick={handleCheckout}
                            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-all"
                        >
                            <LogOut size={18} /> Checkout
                        </button>
                    </div>
                </div>

                {/* Right Col: Orders */}
                <div className="flex-1 bg-stone-950 rounded-xl p-4 border border-stone-800">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Coffee size={16} /> Orders
                    </h3>

                    <div className="h-48 overflow-y-auto space-y-2 mb-4 pr-2 scrollbar-thin">
                        {session.orders.length === 0 ? (
                            <p className="text-stone-600 text-sm italic text-center py-8">No orders yet</p>
                        ) : (
                            session.orders.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-stone-300 p-2 bg-stone-900 rounded-lg">
                                    <span>{item.name}</span>
                                    <span className="text-stone-500">₹{item.price}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {menu.slice(0, 4).map((item) => (
                            <button
                                key={item.id}
                                onClick={() => addOrder(table.id, item.id)}
                                className="text-xs py-2 bg-stone-800 hover:bg-stone-700 text-stone-400 rounded-lg transition-all"
                            >
                                + {item.name}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
