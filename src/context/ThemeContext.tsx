import React, { createContext, useContext, useEffect } from 'react';

export type ThemeMode = 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  effectiveTheme: 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-luxury_gold', 'theme-dark');
    root.classList.add('theme-light');
    localStorage.setItem('scholarcore_theme', 'light');
  }, []);

  const setTheme = () => {
    const root = document.documentElement;
    root.classList.remove('theme-luxury_gold', 'theme-dark');
    root.classList.add('theme-light');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme, effectiveTheme: 'light' }}>
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

