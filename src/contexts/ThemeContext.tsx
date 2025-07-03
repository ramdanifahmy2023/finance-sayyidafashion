import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get saved theme from localStorage or default to 'system'
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    let currentTheme: 'light' | 'dark' = 'light';

    // If system theme, detect user preference
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      currentTheme = systemTheme;
    } else {
      currentTheme = theme;
    }

    setEffectiveTheme(currentTheme);

    // Apply theme classes
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme);

    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);

        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};