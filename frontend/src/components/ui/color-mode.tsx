import { IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useEffect, useState } from 'react';

export function ColorModeButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleColorMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <IconButton
        aria-label="Toggle color mode"
        variant="ghost"
        size="sm"
      >
        <FiSun />
      </IconButton>
    );
  }

  return (
    <IconButton
      aria-label="Toggle color mode"
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
    >
      {theme === 'light' ? <FiMoon /> : <FiSun />}
    </IconButton>
  );
}

// Export hooks for use in other components
export function useColorMode() {
  const { theme, setTheme } = useTheme();
  return {
    colorMode: theme as 'light' | 'dark',
    toggleColorMode: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    setColorMode: (mode: 'light' | 'dark') => setTheme(mode),
  };
}

export function useColorModeValue<T>(light: T, dark: T): T {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return light;
  return theme === 'dark' ? dark : light;
}
