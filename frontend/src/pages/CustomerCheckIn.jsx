import React, { useState, useMemo } from 'react';
import { useTables } from '../hooks/useTables';
import { useOffline } from '../context/OfflineContext';
import { calculatePrice, formatCurrency } from '../config/pricing';
import { Clock, Users, Phone, User, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerCheckIn() {
    const { tables } = useTables();
    const { addSession } = useOffline();

    // Step State
    const [step, setStep] = useState(1);

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
                <h2 className="text-2xl font-bold text-primary">Welcome to Waari Book Cafe</h2>
                <p className="text-tertiary">Let's get you set up. Please enter your details.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-secondary uppercase mb-2">Your Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-secondary border border-light rounded-xl p-4 pl-10 text-primary focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-tertiary"
                            placeholder="Enter name"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-secondary uppercase mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-secondary border border-light rounded-xl p-4 pl-10 text-primary focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-tertiary"
                            placeholder="10 digit phone number"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase mb-2">Guests</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                            <select
                                value={pax}
                                onChange={(e) => setPax(Number(e.target.value))}
                                className="w-full bg-secondary border border-light rounded-xl p-4 pl-10 text-primary focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                            >
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-secondary uppercase mb-2">Duration (Hrs)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                            <select
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                className="w-full bg-secondary border border-light rounded-xl p-4 pl-10 text-primary focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
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
                className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-secondary/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                Select Table <ChevronRight size={20} />
            </button>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Choose a Table</h2>
                    <p className="text-tertiary text-sm">Tap on an available table.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-tertiary uppercase font-semibold">Estimate</p>
                    <p className="text-xl font-bold text-brand-primary">{formatCurrency(priceEstimate)}</p>
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
                                ? "bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary"
                                : t.isAvailable
                                    ? "bg-tertiary/50 border-light hover:bg-secondary"
                                    : "bg-tertiary/30 border-light opacity-60 cursor-not-allowed"
                        )}
                    >
                        <span className="text-lg font-bold text-primary block mb-1">{t.name}</span>
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full inline-block",
                            t.isAvailable ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-tertiary text-tertiary"
                        )}>
                            {t.statusLabel}
                        </span>

                        {selectedTableId === t.id && (
                            <div className="absolute top-2 right-2 text-brand-primary">
                                <CheckCircle size={20} strokeWidth={2.5} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 text-tertiary hover:text-primary transition-colors">Back</button>
                <button
                    onClick={handleConfirm}
                    disabled={!selectedTableId}
                    className="flex-[2] bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95"
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
                <h2 className="text-3xl font-bold text-primary">Checked In!</h2>
                <p className="text-tertiary max-w-[250px] mx-auto">Please proceed to your table. Your timer has started.</p>
            </div>

            <div className="bg-secondary rounded-2xl p-6 max-w-xs mx-auto space-y-4 border border-light">
                <div className="flex justify-between text-sm">
                    <span className="text-tertiary">Table</span>
                    <span className="text-primary font-bold">{tables.find(t => t.id === selectedTableId)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-tertiary">Duration</span>
                    <span className="text-primary font-bold">{hours} Hours</span>
                </div>
                <div className="flex justify-between text-sm pt-4 border-t border-light">
                    <span className="text-tertiary">Est. Total</span>
                    <span className="text-brand-primary font-bold">{formatCurrency(priceEstimate)}</span>
                </div>
            </div>

            <p className="text-xs text-tertiary">Show this screen to the staff if requested.</p>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-primary text-primary p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
                <header className="flex items-center justify-center mb-8 gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center font-bold text-white font-mono text-xl">N</div>
                    <span
                        className="text-[45px] font-brand font-black bg-clip-text text-transparent tracking-tighter leading-none animate-gradient-x"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #007FFF, #2A52BE, #007FFF, #2A52BE)',
                            backgroundSize: '300% 100%',
                        }}
                    >
                        NOMAD
                    </span>
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
