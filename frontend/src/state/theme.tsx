import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'apple' | 'arctic-glass' | 'botanical' | 'midnight-navy' | 'neon-storm' | 'desert-sand' | 'nordic-frost' | 'paper-map' | 'solar-flare' | 'minimal-mono';

export interface Theme {
  id: ThemeId;
  name: string;
}

export const THEMES: Theme[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'arctic-glass', name: 'Arctic Glass' },
  { id: 'botanical', name: 'Botanical' },
  { id: 'midnight-navy', name: 'Midnight Navy' },
  { id: 'neon-storm', name: 'Neon Storm' },
  { id: 'desert-sand', name: 'Desert Sand' },
  { id: 'nordic-frost', name: 'Nordic Frost' },
  { id: 'paper-map', name: 'Paper Map' },
  { id: 'solar-flare', name: 'Solar Flare' },
  { id: 'minimal-mono', name: 'Minimal Mono' },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'weather-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (THEMES.some((t) => t.id === stored) ? stored : 'apple') as ThemeId;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Set initial theme on mount (handles SSR / first paint)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = (id: ThemeId) => setThemeState(id);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
