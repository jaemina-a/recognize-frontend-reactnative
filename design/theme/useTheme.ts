import { useContext } from 'react';
import { lightColorScheme } from '../tokens/colors';
import { ThemeContext, type ThemeContextType } from './ThemeProvider';

// Fallback when ThemeProvider isn't mounted (defensive).
const FALLBACK: ThemeContextType = {
  colors: lightColorScheme,
  isDark: false,
  mode: 'light',
  setMode: () => {},
  toggle: () => {},
};

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  return ctx ?? FALLBACK;
}
