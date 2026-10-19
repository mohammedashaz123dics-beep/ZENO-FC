import { useState, useEffect, useCallback } from 'react';

export const THEMES = [
  { id: 'dark', name: 'Dark', bg: '#020617', card: '#0f172a', accent: '#3b82f6' },
  { id: 'white', name: 'White', bg: '#f8fafc', card: '#ffffff', accent: '#3b82f6' },
  { id: 'grey', name: 'Grey', bg: '#1a1a1a', card: '#2a2a2a', accent: '#737373' },
  { id: 'marine', name: 'Marine', bg: '#051620', card: '#0c3246', accent: '#0ea5e9' },
];

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('zeno-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zeno-theme', theme);
  }, [theme]);

  const setTheme = useCallback((t) => setThemeState(t), []);

  return { theme, setTheme, themes: THEMES };
}