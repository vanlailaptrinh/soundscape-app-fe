import { useEffect, useState } from 'react';
import './ThemeToggle.sass';

const THEME_KEY = 'soundscape-theme';

const getInitialTheme = () => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem(THEME_KEY) || 'dark';
};

const ThemeToggle = () => {
    const [theme, setTheme] = useState(getInitialTheme);
    const isLight = theme === 'light';

    useEffect(() => {
        document.documentElement.classList.toggle('theme-light', isLight);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme, isLight]);

    return (
        <button
            type="button"
            className="themeToggle"
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            title={isLight ? 'Dark mode' : 'Light mode'}
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}>
            <span className={`themeToggleIcon ${isLight ? 'sun' : 'moon'}`} />
        </button>
    );
};

export default ThemeToggle;
