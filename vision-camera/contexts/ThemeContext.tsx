// /contexts/ThemeContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeState>({} as ThemeState);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sys = useColorScheme();                                      // 'light' | 'dark' | null
  const [theme, setTheme] = useState<ColorSchemeName>(sys ?? 'light');

  const toggleTheme = () => setTheme(p => (p === 'light' ? 'dark' : 'light'));
  const value = useMemo(() => ({ theme: theme as 'light' | 'dark', toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);

  





