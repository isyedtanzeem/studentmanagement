import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'luxury_gold' | 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  effectiveTheme: 'luxury_gold' | 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('scholarcore_theme') as ThemeMode | null;
    return saved || 'luxury_gold';
  });

  const getEffectiveTheme = (mode: ThemeMode): 'luxury_gold' | 'dark' | 'light' => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return mode;
  };

  const [effectiveTheme, setEffectiveTheme] = useState<'luxury_gold' | 'dark' | 'light'>(
    getEffectiveTheme(theme)
  );

  const applyThemeToDOM = (mode: ThemeMode) => {
    const eff = getEffectiveTheme(mode);
    setEffectiveTheme(eff);

    const root = document.documentElement;
    root.classList.remove('theme-luxury_gold', 'theme-dark', 'theme-light');
    root.classList.add(`theme-${eff}`);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    localStorage.setItem('scholarcore_theme', theme);
  }, [theme]);

  // Listen for system media query changes if mode is 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyThemeToDOM('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeToDOM(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
