import React, { useState, useMemo } from 'react';
import { useTables } from '../hooks/useTables';
import { useOffline } from '../context/OfflineContext';
import { calculatePrice, formatCurrency } from '../config/pricing';
import { Clock, Users, Phone, User, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerCheckIn() {
    const { tables } = useTables(); // Live table data from Dexie
    const { addSession } = useOffline();

    // Step State
    const [step, setStep] = useState(1); // 1: Details, 2: Table, 3: Success

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [pax, setPax] = useState(1);
    const [hours, setHours] = useState(2);
    const [selectedTableId, setSelectedTableId] = useState(null);

    // Derived State
    const priceEstimate = useMemo(() => calculatePrice(hours), [hours]);

    const availableTables = useMemo(() => {
        return tables.map(t => {
            let statusLabel = 'Available Now';
            let isAvailable = true;

            if (t.status === 'occupied' && t.session) {
                isAvailable = false;
                const endTime = t.session.startTime + (t.session.duration * 3600000);
                statusLabel = `Free at ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }
            return { ...t, statusLabel, isAvailable };
        });
    }, [tables]);

    const handleConfirm = () => {
        if (!name || !phone || !selectedTableId) return;

        addSession({
            tableId: selectedTableId,
            customerName: name,
            phone: phone,
            pax: parseInt(pax),
            duration: parseInt(hours),
            startTime: Date.now()
        });
        setStep(3);
    };

    // UI Components for Steps
    const renderStep1 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Welcome to Nomad</h2>
                <p className="text-stone-400">Let's get you set up. Please enter your details.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Your Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 pl-10 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-stone-600"
                            placeholder="Min 3 characters"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 pl-10 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all placeholder:text-stone-600"
                            placeholder="10 digit number"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Guests</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                            <select
                                value={pax}
                                onChange={(e) => setPax(Number(e.target.value))}
                                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 pl-10 text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
                            >
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase mb-2">Duration (Hrs)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                            <select
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 pl-10 text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} h</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setStep(2)}
                disabled={!name || !phone || name.length < 3 || phone.length < 10}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Select Table <ChevronRight size={20} />
            </button>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Choose a Table</h2>
                    <p className="text-stone-400 text-sm">Tap on an available table.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-stone-500 uppercase font-semibold">Estimate</p>
                    <p className="text-xl font-bold text-orange-400">{formatCurrency(priceEstimate)}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {availableTables.map(t => (
                    <button
                        key={t.id}
                        disabled={!t.isAvailable}
                        onClick={() => setSelectedTableId(t.id)}
                        className={cn(
                            "p-4 rounded-xl border text-left transition-all relative overflow-hidden",
                            selectedTableId === t.id
                                ? "bg-orange-500/20 border-orange-500 ring-1 ring-orange-500"
                                : t.isAvailable
                                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                                    : "bg-black/40 border-white/5 opacity-60 cursor-not-allowed"
                        )}
                    >
                        <span className="text-lg font-bold text-white block mb-1">{t.name}</span>
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full inline-block",
                            t.isAvailable ? "bg-emerald-500/20 text-emerald-300" : "bg-stone-700 text-stone-400"
                        )}>
                            {t.statusLabel}
                        </span>

                        {selectedTableId === t.id && (
                            <div className="absolute top-2 right-2 text-orange-500">
                                <CheckCircle size={18} fill="currentColor" className="text-orange-500" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 text-stone-400 hover:text-white transition-colors">Back</button>
                <button
                    onClick={handleConfirm}
                    disabled={!selectedTableId}
                    className="flex-[2] bg-white text-black dark:bg-stone-200 dark:text-black font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95"
                >
                    Confirm Check-In
                </button>
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-10">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle size={48} />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Checked In!</h2>
                <p className="text-stone-400 max-w-[250px] mx-auto">Please proceed to your table. Your timer has started.</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 max-w-xs mx-auto space-y-4 border border-white/10">
                <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Table</span>
                    <span className="text-white font-bold">{tables.find(t => t.id === selectedTableId)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Duration</span>
                    <span className="text-white font-bold">{hours} Hours</span>
                </div>
                <div className="flex justify-between text-sm pt-4 border-t border-white/10">
                    <span className="text-stone-500">Est. Total</span>
                    <span className="text-orange-400 font-bold">{formatCurrency(priceEstimate)}</span>
                </div>
            </div>

            <p className="text-xs text-stone-500">Show this screen to the staff if requested.</p>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <header className="flex items-center justify-center mb-8 gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-black font-mono">N</div>
                    <span className="text-xl font-bold tracking-tight">NOMAD</span>
                </header>

                <AnimatePresence mode="wait">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </AnimatePresence>
            </div>
        </div>
    );
}
