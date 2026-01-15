import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Default to 'system' on first visit
        return localStorage.getItem('nomad-theme') || 'system';
    });

    // Calculate the effective theme (resolves 'system' to 'light' or 'dark')
    const getEffectiveTheme = () => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    };

    const [effectiveTheme, setEffectiveTheme] = useState(getEffectiveTheme);

    useEffect(() => {
        // Save theme preference to localStorage
        localStorage.setItem('nomad-theme', theme);

        // Update effective theme
        const newEffectiveTheme = getEffectiveTheme();
        setEffectiveTheme(newEffectiveTheme);

        // Apply or remove 'dark' class on <html>
        if (newEffectiveTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        // Listen for OS theme changes when in 'system' mode
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const newEffectiveTheme = mediaQuery.matches ? 'dark' : 'light';
            setEffectiveTheme(newEffectiveTheme);

            if (newEffectiveTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        // Fallback for older browsers
        else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
