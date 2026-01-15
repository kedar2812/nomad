import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, LogOut, Settings, Home, Clock, Pause, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTables } from '../hooks/useTables';
import { useOffline } from '../context/OfflineContext';
import { cn } from '../lib/utils';

export default function CommandPalette({ onTableAction }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { tables } = useTables();
    const { sessions, pauseSession, resumeSession, checkoutSession } = useOffline();

    // Build command list
    const commands = useMemo(() => {
        const cmds = [];

        // Navigation commands
        cmds.push({ id: 'nav-home', label: 'Go to Dashboard', icon: Home, action: () => navigate('/'), category: 'Navigation' });
        cmds.push({ id: 'nav-settings', label: 'Go to Settings', icon: Settings, action: () => navigate('/settings'), category: 'Navigation' });

        // Table commands - Check In
        tables.filter(t => t.status === 'available').forEach(table => {
            cmds.push({
                id: `checkin-${table.id}`,
                label: `Check In → ${table.name}`,
                sublabel: `${table.hasPlug ? '⚡ Power' : ''} ${table.nearWindow ? '☀️ Window' : ''}`.trim(),
                icon: User,
                action: () => onTableAction?.('checkin', table),
                category: 'Check In'
            });
        });

        // Active session commands
        sessions.filter(s => s.status === 'active').forEach(session => {
            const table = tables.find(t => t.id === session.tableId);
            const tableName = table?.name || `Table ${session.tableId}`;

            cmds.push({
                id: `checkout-${session.id}`,
                label: `Checkout → ${session.customerName}`,
                sublabel: tableName,
                icon: LogOut,
                action: () => {
                    if (confirm(`Checkout ${session.customerName}?`)) {
                        checkoutSession(session.id);
                    }
                },
                category: 'Active Sessions'
            });

            if (session.isPaused) {
                cmds.push({
                    id: `resume-${session.id}`,
                    label: `Resume → ${session.customerName}`,
                    sublabel: tableName,
                    icon: Play,
                    action: () => resumeSession(session.id),
                    category: 'Active Sessions'
                });
            } else {
                cmds.push({
                    id: `pause-${session.id}`,
                    label: `Pause → ${session.customerName}`,
                    sublabel: tableName,
                    icon: Pause,
                    action: () => pauseSession(session.id),
                    category: 'Active Sessions'
                });
            }
        });

        return cmds;
    }, [tables, sessions, navigate, onTableAction, checkoutSession, pauseSession, resumeSession]);

    // Filter commands by query
    const filteredCommands = useMemo(() => {
        if (!query) return commands;
        const lowerQuery = query.toLowerCase();
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(lowerQuery) ||
            cmd.sublabel?.toLowerCase().includes(lowerQuery) ||
            cmd.category.toLowerCase().includes(lowerQuery)
        );
    }, [commands, query]);

    // Group by category
    const groupedCommands = useMemo(() => {
        const groups = {};
        filteredCommands.forEach(cmd => {
            if (!groups[cmd.category]) groups[cmd.category] = [];
            groups[cmd.category].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    // Keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
            e.preventDefault();
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[20vh]"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-lg bg-secondary/95 backdrop-blur-2xl border border-light rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-light">
                    <Search size={20} className="text-tertiary" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search commands, tables, guests..."
                        className="flex-1 bg-transparent text-primary placeholder:text-tertiary focus:outline-none text-lg"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-tertiary bg-tertiary rounded border border-light">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {filteredCommands.length === 0 ? (
                        <div className="p-8 text-center text-tertiary">
                            <Search size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No matching commands</p>
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, cmds]) => (
                            <div key={category}>
                                <div className="px-4 py-2 text-xs font-bold text-secondary uppercase tracking-wider bg-tertiary">
                                    {category}
                                </div>
                                {cmds.map((cmd, idx) => {
                                    const globalIdx = filteredCommands.indexOf(cmd);
                                    const Icon = cmd.icon;
                                    return (
                                        <button
                                            key={cmd.id}
                                            onClick={() => { cmd.action(); setIsOpen(false); }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                                globalIdx === selectedIndex
                                                    ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                                                    : "text-secondary hover:bg-tertiary"
                                            )}
                                        >
                                            <Icon size={18} className="opacity-50" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{cmd.label}</div>
                                                {cmd.sublabel && (
                                                    <div className="text-xs text-tertiary truncate">{cmd.sublabel}</div>
                                                )}
                                            </div>
                                            {globalIdx === selectedIndex && (
                                                <kbd className="text-xs text-tertiary bg-secondary px-2 py-0.5 rounded border border-light">↵</kbd>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-light flex items-center justify-center text-xs text-tertiary">
                    <span>
                        <kbd className="px-1.5 py-0.5 bg-tertiary rounded mr-1 border border-light">↑↓</kbd> Navigate
                        <kbd className="px-1.5 py-0.5 bg-tertiary rounded mx-1 ml-3 border border-light">↵</kbd> Select
                    </span>
                </div>
            </div>
        </div>,
        document.body
    );
}
