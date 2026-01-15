import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className="flex items-center gap-1 p-1 bg-tertiary/30 dark:bg-stone-800/50 backdrop-blur-xl rounded-full border border-light/50 dark:border-stone-700/50">
            {themes.map(({ value, icon: Icon, label }) => {
                const isActive = theme === value;

                return (
                    <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={cn(
                            "relative p-2.5 rounded-full transition-all duration-200 ease-out",
                            isActive
                                ? "text-white"
                                : "text-tertiary hover:text-secondary hover:scale-110 active:scale-95"
                        )}
                        title={label}
                        aria-label={`Switch to ${label} mode`}
                    >
                        {/* Glowing Orb Background - uses layoutId for smooth position transition */}
                        {isActive && (
                            <motion.div
                                layoutId="theme-orb"
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, #007FFF 0%, #2A52BE 100%)',
                                    boxShadow: '0 0 16px rgba(0, 127, 255, 0.5), 0 0 32px rgba(42, 82, 190, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30
                                }}
                            />
                        )}

                        {/* Icon */}
                        <span className={cn(
                            "relative z-10 block transition-transform duration-200",
                            isActive && "scale-105"
                        )}>
                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
