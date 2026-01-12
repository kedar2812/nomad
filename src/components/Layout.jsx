import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
            <Sidebar />
            <Header />
            <main className="pl-20 pt-16 min-h-screen relative">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
