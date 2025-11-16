'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'amber' | 'blue' | 'purple' | 'green' | 'rose' | 'brown';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
    return 'system';
  });

  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('colorScheme') as ColorScheme;
      if (saved && ['amber', 'blue', 'purple', 'green', 'rose', 'brown'].includes(saved)) {
        return saved;
      }
    }
    return 'amber';
  });

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme === 'light') return 'light';
      if (savedTheme === 'dark') return 'dark';
      return getSystemTheme();
    }
    return 'light';
  });

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;

    // Remove dark class if exists
    root.classList.remove('dark');
    
    // Add dark class if needed
    if (resolved === 'dark') {
      root.classList.add('dark');
    }

    setResolvedTheme(resolved);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  // Apply color scheme to document
  const applyColorScheme = (scheme: ColorScheme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Add transition animation class
    root.classList.add('color-transition-active');
    
    // Remove all color scheme classes
    root.classList.remove('color-amber', 'color-blue', 'color-purple', 'color-green', 'color-rose', 'color-brown');
    
    // Add new color scheme class
    root.classList.add(`color-${scheme}`);

    // Update CSS variables based on color scheme
    const colorMap: Record<ColorScheme, { primary: string; ring: string }> = {
      amber: { primary: '43 96% 56%', ring: '43 96% 56%' },
      blue: { primary: '217 91% 60%', ring: '217 91% 60%' },
      purple: { primary: '262 83% 58%', ring: '262 83% 58%' },
      green: { primary: '142 71% 45%', ring: '142 71% 45%' },
      rose: { primary: '346 77% 50%', ring: '346 77% 50%' },
      brown: { primary: '25 65% 45%', ring: '25 65% 45%' },
    };

    const colors = colorMap[scheme];
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--ring', colors.ring);
    
    // Remove animation class after animation completes
    setTimeout(() => {
      root.classList.remove('color-transition-active');
    }, 600);
    
    // Save to localStorage
    localStorage.setItem('colorScheme', scheme);
  };

  // Initialize theme and color scheme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Apply saved theme and color scheme immediately
    applyTheme(theme);
    applyColorScheme(colorScheme);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    applyTheme(theme);
  }, [theme]);

  // Apply color scheme when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    applyColorScheme(colorScheme);
  }, [colorScheme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyColorScheme(scheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colorScheme, setColorScheme, resolvedTheme }}>
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
