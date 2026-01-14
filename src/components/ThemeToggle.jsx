import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-light">
            {themes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                        "p-2 rounded-md transition-all duration-200",
                        theme === value
                            ? "bg-orange-500 text-white shadow-sm"
                            : "text-tertiary hover:text-secondary hover:bg-tertiary/50"
                    )}
                    title={label}
                    aria-label={`Switch to ${label} mode`}
                >
                    <Icon size={16} />
                </button>
            ))}
        </div>
    );
}
