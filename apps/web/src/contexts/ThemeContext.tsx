'use client';
import React, { createContext, useEffect, useState } from 'react';
import { saveToStorage, loadFromStorage } from '@/utils/localStorage';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  handleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  handleTheme() {},
});
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    initialTheme();
  }, []);

  const initialTheme = async () => {
    const value = loadFromStorage('@themeMedical') as Promise<Theme>;
    if ((await value) === 'dark') {
      setTheme('dark');
    } else {
      saveToStorage('@themeMedical', 'light');
      setTheme('light');
    }
  };

  const handleTheme = () => {
    if (theme === 'dark') {
      saveToStorage('@themeMedical', 'light');
      setTheme('light');
    } else {
      saveToStorage('@themeMedical', 'dark');
      setTheme('dark');
    }
  };

  const value = {
    handleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeContext;
