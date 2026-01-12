import React, { useState } from 'react';
import { X, Users, Clock, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function CheckInModal({ isOpen, onClose, table }) {
    const startSession = useStore((state) => state.startSession);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        duration: 1, // hours
        pax: 1
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        startSession(table.id, formData);
        onClose();
        setFormData({ name: '', phone: '', duration: 1, pax: 1 }); // Reset
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-stone-200 mb-1">Check In</h2>
                <p className="text-stone-500 text-sm mb-6">Table {table.name}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Customer</label>
                            <input
                                type="text"
                                placeholder="Name"
                                required
                                className="w-full bg-stone-800 border-none rounded-lg p-3 text-stone-200 placeholder-stone-600 focus:ring-2 focus:ring-orange-500/50"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <input
                                type="tel"
                                placeholder="Phone Number (Optional)"
                                className="w-full bg-stone-800 border-none rounded-lg p-3 text-stone-200 placeholder-stone-600 focus:ring-2 focus:ring-orange-500/50"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Duration</label>
                            <div className="flex bg-stone-800 rounded-lg p-1 gap-1">
                                {[1, 2, 3].map((h) => (
                                    <button
                                        key={h}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, duration: h })}
                                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${formData.duration === h
                                                ? 'bg-orange-500/20 text-orange-500'
                                                : 'text-stone-500 hover:bg-stone-700'
                                            }`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Guests</label>
                            <div className="flex items-center bg-stone-800 rounded-lg p-1">
                                <button
                                    type="button"
                                    className="p-2 text-stone-500 hover:text-stone-300"
                                    onClick={() => setFormData(p => ({ ...p, pax: Math.max(1, p.pax - 1) }))}
                                >
                                    <Minus size={16} />
                                </button>
                                <div className="flex-1 text-center font-bold text-stone-200">{formData.pax}</div>
                                <button
                                    type="button"
                                    className="p-2 text-stone-500 hover:text-stone-300"
                                    onClick={() => setFormData(p => ({ ...p, pax: Math.min(8, p.pax + 1) }))}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold py-4 rounded-xl transition-all"
                    >
                        Start Session
                    </button>
                </form>
            </div>
        </div>
    );
}
