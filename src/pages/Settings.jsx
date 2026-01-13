import React, { useState, useRef } from 'react';
import { useOffline } from '../context/OfflineContext';
import { Download, Upload, CheckCircle, AlertTriangle, Database, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../db/db';

export default function Settings() {
    const { exportData, importData, sessions } = useOffline();
    const [exportStatus, setExportStatus] = useState(null); // 'success' | 'error'
    const [importStatus, setImportStatus] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Stats
    const activeSessions = sessions.filter(s => s.status === 'active').length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalOrders = sessions.reduce((sum, s) => sum + (s.orders?.length || 0), 0);

    const handleExport = async () => {
        try {
            const data = await exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nomad-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setExportStatus('success');
            setTimeout(() => setExportStatus(null), 3000);
        } catch (error) {
            console.error('Export failed:', error);
            setExportStatus('error');
            setTimeout(() => setExportStatus(null), 3000);
        }
    };

    const handleImport = async (file) => {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate structure
            if (!data.sessions || !Array.isArray(data.sessions)) {
                throw new Error('Invalid backup file format');
            }

            if (confirm(`Import ${data.sessions.length} sessions? This will replace all existing data.`)) {
                await importData(text);
                setImportStatus('success');
                setTimeout(() => setImportStatus(null), 3000);
            }
        } catch (error) {
            console.error('Import failed:', error);
            setImportStatus('error');
            setTimeout(() => setImportStatus(null), 3000);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/json') {
            handleImport(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImport(file);
        }
    };

    const handleClearData = async () => {
        if (confirm('⚠️ This will delete ALL data including active sessions. Are you sure?')) {
            if (confirm('This action cannot be undone. Type "DELETE" to confirm... (Click OK to proceed)')) {
                await db.sessions.clear();
                await db.logs.clear();
                window.location.reload();
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400 tracking-tight">
                    Settings
                </h2>
                <p className="text-stone-500 text-sm mt-1">Manage your data and preferences</p>
            </div>

            {/* Data Stats */}
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Database size={14} /> Database Stats
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">{activeSessions}</div>
                        <div className="text-xs text-stone-500 mt-1">Active Sessions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">{completedSessions}</div>
                        <div className="text-xs text-stone-500 mt-1">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white">{totalOrders}</div>
                        <div className="text-xs text-stone-500 mt-1">Total Orders</div>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Download size={14} /> Export Data
                </h3>
                <p className="text-sm text-stone-400 mb-4">
                    Download a complete backup of all sessions and logs as a JSON file.
                </p>
                <button
                    onClick={handleExport}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border",
                        exportStatus === 'success'
                            ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                            : exportStatus === 'error'
                                ? "bg-red-500/20 border-red-500/30 text-red-400"
                                : "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
                    )}
                >
                    {exportStatus === 'success' ? (
                        <><CheckCircle size={18} /> Backup Downloaded!</>
                    ) : exportStatus === 'error' ? (
                        <><AlertTriangle size={18} /> Export Failed</>
                    ) : (
                        <><Download size={18} /> Download Backup</>
                    )}
                </button>
            </div>

            {/* Import Section */}
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Upload size={14} /> Import Data
                </h3>
                <p className="text-sm text-stone-400 mb-4">
                    Restore from a previously exported JSON backup file.
                </p>

                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                        isDragging
                            ? "border-orange-500 bg-orange-500/10"
                            : importStatus === 'success'
                                ? "border-emerald-500/50 bg-emerald-500/10"
                                : importStatus === 'error'
                                    ? "border-red-500/50 bg-red-500/10"
                                    : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    {importStatus === 'success' ? (
                        <div className="text-emerald-400">
                            <CheckCircle size={32} className="mx-auto mb-2" />
                            <p className="font-bold">Data Restored Successfully!</p>
                        </div>
                    ) : importStatus === 'error' ? (
                        <div className="text-red-400">
                            <AlertTriangle size={32} className="mx-auto mb-2" />
                            <p className="font-bold">Import Failed</p>
                            <p className="text-xs mt-1">Invalid file format</p>
                        </div>
                    ) : (
                        <div className="text-stone-400">
                            <Upload size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="font-medium">Drop JSON file here</p>
                            <p className="text-xs text-stone-500 mt-1">or click to browse</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/10">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Trash2 size={14} /> Danger Zone
                </h3>
                <p className="text-sm text-stone-400 mb-4">
                    Permanently delete all data. This action cannot be undone.
                </p>
                <button
                    onClick={handleClearData}
                    className="w-full py-3 rounded-xl font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} /> Clear All Data
                </button>
            </div>
        </div>
    );
}
