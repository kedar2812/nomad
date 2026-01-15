import React, { useState, useRef } from 'react';
import { useOffline } from '../context/OfflineContext';
import { Download, Upload, CheckCircle, AlertTriangle, Database, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../db/db';
import * as XLSX from 'xlsx';

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
            // Prepare sessions data for Excel
            const sessionsData = sessions.map(s => ({
                'Session ID': s.id,
                'Customer Name': s.customerName,
                'Phone': s.phone || '-',
                'Table ID': s.tableId,
                'Guests (PAX)': s.pax,
                'Duration (Hours)': s.duration,
                'Start Time': new Date(s.startTime).toLocaleString(),
                'End Time': s.endTime ? new Date(s.endTime).toLocaleString() : '-',
                'Status': s.status,
                'Total Orders': s.orders?.length || 0,
                'Paused': s.isPaused ? 'Yes' : 'No',
                // Raw data for import reliability
                '_startTime': s.startTime,
                '_endTime': s.endTime || '',
                '_isPaused': s.isPaused,
                '_pausedAt': s.pausedAt || '',
                '_totalPausedMs': s.totalPausedMs || 0
            }));

            // Prepare orders data for Excel
            const ordersData = [];
            sessions.forEach(s => {
                if (s.orders && s.orders.length > 0) {
                    s.orders.forEach(order => {
                        ordersData.push({
                            'Session ID': s.id,
                            'Customer Name': s.customerName,
                            'Order ID': order.orderId || order.id, // Handle both structures
                            'Item Name': order.name,
                            'Quantity': order.quantity,
                            'Price': order.price,
                            'Total': order.quantity * order.price,
                            'Ordered At': new Date(order.addedAt || order.timestamp).toLocaleString(),
                            // Raw data
                            '_addedAt': order.addedAt || order.timestamp,
                            '_itemId': order.id
                        });
                    });
                }
            });

            // Create workbook with multiple sheets
            const wb = XLSX.utils.book_new();

            // Add Sessions sheet
            const sessionsSheet = XLSX.utils.json_to_sheet(sessionsData);
            XLSX.utils.book_append_sheet(wb, sessionsSheet, 'Sessions');

            // Add Orders sheet if there are orders
            if (ordersData.length > 0) {
                const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
                XLSX.utils.book_append_sheet(wb, ordersSheet, 'Orders');
            }

            // Generate and download file
            const fileName = `nomad-backup-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

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
            const arrayBuffer = await file.arrayBuffer();
            const wb = XLSX.read(arrayBuffer);

            // Reconstruct Sessions
            const sessionsSheet = wb.Sheets['Sessions'];
            if (!sessionsSheet) throw new Error('Invalid Excel file: Missing "Sessions" sheet');

            const rawSessions = XLSX.utils.sheet_to_json(sessionsSheet);

            // Reconstruct Orders if exists
            let rawOrders = [];
            const ordersSheet = wb.Sheets['Orders'];
            if (ordersSheet) {
                rawOrders = XLSX.utils.sheet_to_json(ordersSheet);
            }

            // Map back to application data structure
            const restoredSessions = rawSessions.map(row => {
                const sessionId = row['Session ID'];

                // Find orders for this session
                const sessionOrders = rawOrders
                    .filter(o => o['Session ID'] === sessionId)
                    .map(o => ({
                        id: o['_itemId'], // ID of item from menu
                        orderId: o['Order ID'],
                        name: o['Item Name'],
                        quantity: Number(o['Quantity']),
                        price: Number(o['Price']),
                        addedAt: o['_addedAt'] || new Date(o['Ordered At']).getTime(),
                        // Fallback logic for legacy timestamp
                        timestamp: o['_addedAt'] || new Date(o['Ordered At']).getTime()
                    }));

                return {
                    id: sessionId,
                    customerName: row['Customer Name'],
                    phone: row['Phone'] === '-' ? '' : row['Phone'],
                    tableId: row['Table ID'],
                    pax: Number(row['Guests (PAX)']),
                    duration: Number(row['Duration (Hours)']),
                    startTime: row['_startTime'] || new Date(row['Start Time']).getTime(),
                    endTime: row['_endTime'] || (row['End Time'] !== '-' ? new Date(row['End Time']).getTime() : null),
                    status: row['Status'],
                    isPaused: row['_isPaused'] === true || row['_isPaused'] === 'true' || row['Paused'] === 'Yes',
                    pausedAt: row['_pausedAt'] || null,
                    totalPausedMs: row['_totalPausedMs'] || 0,
                    orders: sessionOrders,
                    synced: false // Mark imported data as unsynced so it gets pushed if backend exists
                };
            });

            if (confirm(`Import ${restoredSessions.length} sessions from Excel? This will replace all existing data.`)) {
                // Convert back to format expected by importData (JSON string)
                const importPayload = JSON.stringify({ sessions: restoredSessions });
                await importData(importPayload);
                setImportStatus('success');
                setTimeout(() => setImportStatus(null), 3000);
            }
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed: ' + error.message);
            setImportStatus('error');
            setTimeout(() => setImportStatus(null), 3000);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            // Check extension
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'xlsx' || ext === 'xls' || ext === 'json') {
                // For JSON legacy support
                if (ext === 'json') {
                    // Legacy JSON import...
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            await importData(e.target.result);
                            setImportStatus('success');
                        } catch (err) {
                            setImportStatus('error');
                        }
                    };
                    reader.readAsText(file);
                } else {
                    handleImport(file);
                }
            } else {
                alert('Please upload an Excel (.xlsx) or JSON file');
            }
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
                <h2
                    className="text-[45px] font-brand font-black bg-clip-text text-transparent tracking-tighter leading-tight pb-1 animate-gradient-x"
                    style={{
                        backgroundImage: 'linear-gradient(90deg, #a8a29e, #57534e, #a8a29e, #57534e)',
                        backgroundSize: '300% 100%',
                    }}
                >
                    Settings
                </h2>
                <p className="text-tertiary text-sm mt-1">Manage your data and preferences</p>
            </div>

            {/* Data Stats */}
            <div className="bg-secondary rounded-2xl p-6 border border-light shadow-sm">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Database size={14} /> Database Stats
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{activeSessions}</div>
                        <div className="text-xs text-tertiary mt-1">Active Sessions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{completedSessions}</div>
                        <div className="text-xs text-tertiary mt-1">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{totalOrders}</div>
                        <div className="text-xs text-tertiary mt-1">Total Orders</div>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-secondary rounded-2xl p-6 border border-light shadow-sm">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Download size={14} /> Export Data
                </h3>
                <p className="text-sm text-tertiary mb-4">
                    Download a complete backup of all sessions and logs as an Excel file.
                </p>
                <button
                    onClick={handleExport}
                    className={cn(
                        "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border",
                        exportStatus === 'success'
                            ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
                            : exportStatus === 'error'
                                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400"
                                : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                    )}
                >
                    {exportStatus === 'success' ? (
                        <><CheckCircle size={18} /> Backup Downloaded!</>
                    ) : exportStatus === 'error' ? (
                        <><AlertTriangle size={18} /> Export Failed</>
                    ) : (
                        <><Download size={18} /> Download Excel</>
                    )}
                </button>
            </div>

            {/* Import Section */}
            <div className="bg-secondary rounded-2xl p-6 border border-light shadow-sm">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Upload size={14} /> Import Data
                </h3>
                <p className="text-sm text-tertiary mb-4">
                    Restore from a previously exported JSON backup file.
                </p>

                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group",
                        isDragging
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-light hover:border-blue-400 hover:bg-secondary"
                    )}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json,.xlsx,.xls"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    {importStatus === 'success' ? (
                        <div className="text-emerald-600">
                            <CheckCircle size={32} className="mx-auto mb-2" />
                            <p className="font-bold">Data Restored Successfully!</p>
                        </div>
                    ) : importStatus === 'error' ? (
                        <div className="text-red-600">
                            <AlertTriangle size={32} className="mx-auto mb-2" />
                            <p className="font-bold">Import Failed</p>
                            <p className="text-xs mt-1">Invalid file format</p>
                        </div>
                    ) : (
                        <div className="text-tertiary">
                            <Upload size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="font-medium">Drop JSON file here</p>
                            <p className="text-xs text-tertiary mt-1">or click to browse</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border border-red-200 dark:border-red-900">
                <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Trash2 size={14} /> Danger Zone
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                    Permanently delete all data. This action cannot be undone.
                </p>
                <button
                    onClick={handleClearData}
                    className="w-full py-3 rounded-xl font-bold bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} /> Clear All Data
                </button>
            </div>
        </div>
    );
}
