import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { X, User, Phone, Users, Clock, AlertTriangle } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckInModal({ isOpen, onClose, table }) {
    const { addSession, sessions } = useOffline();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [pax, setPax] = useState('1');
    const [hours, setHours] = useState('2');
    const [error, setError] = useState('');
    const [activeUserAlert, setActiveUserAlert] = useState(null);

    // 1. Entry Flow: Duplicate Check
    useEffect(() => {
        if (name.length >= 3) {
            const existingSession = sessions.find(s =>
                s.customerName && s.customerName.toLowerCase().includes(name.toLowerCase()) &&
                s.status === 'active'
            );

            if (existingSession) {
                setActiveUserAlert({
                    name: existingSession.customerName,
                    startTime: new Date(existingSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            } else {
                setActiveUserAlert(null);
            }
        }
    }, [name, sessions]);


    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (activeUserAlert) {
            setError("Cannot check in active guest. Please checkout previous session first.");
            return;
        }

        if (!name || name.length < 3) {
            setError("Name must be at least 3 characters");
            return;
        }

        if (!phone || phone.length < 10) {
            setError("Phone number must be at least 10 digits");
            return;
        }

        if (name && phone) {
            addSession({
                tableId: table.id,
                customerName: name,
                phone: phone,
                pax: parseInt(pax),
                duration: parseInt(hours),
                startTime: Date.now()
            });

            // Trigger Confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#007FFF', '#2A52BE', '#ffffff'] // Brand colors
            });

            // Reset & Close
            setName('');
            setPhone('');
            setPax('1');
            setHours('2');
            setActiveUserAlert(null);
            setError('');
            onClose();
        }
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="w-full max-w-md bg-secondary/95 backdrop-blur-2xl rounded-2xl border border-light shadow-2xl overflow-hidden"
                >
                    <div className="flex justify-between items-center p-6 border-b border-light bg-tertiary">
                        <div>
                            <h2 className="text-xl font-bold text-primary">Guest Check-In</h2>
                            <p className="text-sm text-tertiary">Table {table?.name}</p>
                        </div>
                        <button onClick={onClose} className="text-tertiary hover:text-secondary transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Duplicate Alert */}
                        {activeUserAlert && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-yellow-500">Already Checked In</p>
                                    <p className="text-xs text-yellow-500/80 mt-1">
                                        {activeUserAlert.name} is active since {activeUserAlert.startTime}.
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-secondary mb-1 uppercase tracking-wider">Guest Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className={cn(
                                            "w-full bg-secondary border border-light rounded-xl py-3 pl-10 pr-4 text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all",
                                            activeUserAlert && "border-yellow-400 focus:ring-yellow-400/30"
                                        )}
                                        placeholder="Enter name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-secondary mb-1 uppercase tracking-wider">Phone <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-secondary border border-light rounded-xl py-3 pl-10 pr-4 text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        placeholder="10 digit phone number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1 uppercase tracking-wider">Pax</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                                        <select
                                            value={pax}
                                            onChange={(e) => setPax(e.target.value)}
                                            className="w-full bg-secondary border border-light rounded-xl py-3 pl-10 pr-4 text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                <option key={n} value={n} className="bg-secondary">{n} Person{n > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1 uppercase tracking-wider">Duration</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
                                        <select
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                            className="w-full bg-secondary border border-light rounded-xl py-3 pl-10 pr-4 text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        >
                                            {[1, 2, 3, 4, 5].map(h => (
                                                <option key={h} value={h} className="bg-secondary">{h} Hour{h > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!!activeUserAlert}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                activeUserAlert
                                    ? "bg-stone-300 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                                    : "bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 shadow-lg"
                            )}
                        >
                            Start Session
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
