import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all hover:scale-110 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border border-slate-700 dark:border-slate-700 light:border-slate-300"
            title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        >
            {theme === 'light' ? (
                <Moon size={20} className="text-slate-700" />
            ) : (
                <Sun size={20} className="text-yellow-400" />
            )}
        </button>
    );
};

export default ThemeToggle;
