import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen text-stone-800 font-sans">
            <Sidebar />
            <Header />
            <main className="pl-24 pt-20 min-h-screen relative transition-all duration-300">
                <div className="max-w-7xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
