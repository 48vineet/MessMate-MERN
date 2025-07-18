// src/context/ThemeContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');
  const [animations, setAnimations] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Available themes
  const themes = {
    light: {
      name: 'Light',
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      shadow: 'shadow-lg'
    },
    dark: {
      name: 'Dark',
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
      shadow: 'shadow-2xl'
    },
    system: {
      name: 'System',
      primary: 'bg-white dark:bg-gray-900',
      secondary: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-900 dark:text-white',
      textSecondary: 'text-gray-600 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
      shadow: 'shadow-lg dark:shadow-2xl'
    }
  };

  // Available primary colors
  const primaryColors = {
    blue: {
      name: 'Blue',
      50: 'bg-blue-50',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      text: 'text-blue-600'
    },
    purple: {
      name: 'Purple',
      50: 'bg-purple-50',
      500: 'bg-purple-500',
      600: 'bg-purple-600',
      700: 'bg-purple-700',
      text: 'text-purple-600'
    },
    green: {
      name: 'Green',
      50: 'bg-green-50',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
      text: 'text-green-600'
    },
    orange: {
      name: 'Orange',
      50: 'bg-orange-50',
      500: 'bg-orange-500',
      600: 'bg-orange-600',
      700: 'bg-orange-700',
      text: 'text-orange-600'
    },
    red: {
      name: 'Red',
      50: 'bg-red-50',
      500: 'bg-red-500',
      600: 'bg-red-600',
      700: 'bg-red-700',
      text: 'text-red-600'
    }
  };

  // Font sizes
  const fontSizes = {
    small: {
      name: 'Small',
      base: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
      '2xl': 'text-xl'
    },
    medium: {
      name: 'Medium',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl'
    },
    large: {
      name: 'Large',
      base: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
      '2xl': 'text-3xl'
    }
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    const savedFontSize = localStorage.getItem('fontSize');
    const savedAnimations = localStorage.getItem('animations');
    const savedCompactMode = localStorage.getItem('compactMode');

    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }

    if (savedPrimaryColor && primaryColors[savedPrimaryColor]) {
      setPrimaryColor(savedPrimaryColor);
    }

    if (savedFontSize && fontSizes[savedFontSize]) {
      setFontSize(savedFontSize);
    }

    if (savedAnimations !== null) {
      setAnimations(JSON.parse(savedAnimations));
    }

    if (savedCompactMode !== null) {
      setCompactMode(JSON.parse(savedCompactMode));
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme class
    root.classList.remove('light', 'dark', 'system');
    root.classList.add(theme);
    
    // Apply primary color CSS custom properties
    const colorScheme = primaryColors[primaryColor];
    root.style.setProperty('--color-primary-50', colorScheme[50]);
    root.style.setProperty('--color-primary-500', colorScheme[500]);
    root.style.setProperty('--color-primary-600', colorScheme[600]);
    root.style.setProperty('--color-primary-700', colorScheme[700]);
    
    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
    
    // Apply animations preference
    if (!animations) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // Apply compact mode
    if (compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [theme, primaryColor, fontSize, animations, compactMode]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Change theme
  const changeTheme = useCallback((newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  // Change primary color
  const changePrimaryColor = useCallback((color) => {
    if (primaryColors[color]) {
      setPrimaryColor(color);
      localStorage.setItem('primaryColor', color);
    }
  }, []);

  // Change font size
  const changeFontSize = useCallback((size) => {
    if (fontSizes[size]) {
      setFontSize(size);
      localStorage.setItem('fontSize', size);
    }
  }, []);

  // Toggle animations
  const toggleAnimations = useCallback(() => {
    const newAnimations = !animations;
    setAnimations(newAnimations);
    localStorage.setItem('animations', JSON.stringify(newAnimations));
  }, [animations]);

  // Toggle compact mode
  const toggleCompactMode = useCallback(() => {
    const newCompactMode = !compactMode;
    setCompactMode(newCompactMode);
    localStorage.setItem('compactMode', JSON.stringify(newCompactMode));
  }, [compactMode]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setTheme('light');
    setPrimaryColor('blue');
    setFontSize('medium');
    setAnimations(true);
    setCompactMode(false);
    
    localStorage.removeItem('theme');
    localStorage.removeItem('primaryColor');
    localStorage.removeItem('fontSize');
    localStorage.removeItem('animations');
    localStorage.removeItem('compactMode');
  }, []);

  // Get current theme styles
  const getThemeStyles = useCallback(() => {
    return themes[theme];
  }, [theme]);

  // Get current primary color styles
  const getPrimaryColorStyles = useCallback(() => {
    return primaryColors[primaryColor];
  }, [primaryColor]);

  // Get current font size styles
  const getFontSizeStyles = useCallback(() => {
    return fontSizes[fontSize];
  }, [fontSize]);

  const value = {
    // Current settings
    theme,
    primaryColor,
    fontSize,
    animations,
    compactMode,
    
    // Available options
    themes,
    primaryColors,
    fontSizes,
    
    // Functions
    toggleTheme,
    changeTheme,
    changePrimaryColor,
    changeFontSize,
    toggleAnimations,
    toggleCompactMode,
    resetToDefaults,
    
    // Getters
    getThemeStyles,
    getPrimaryColorStyles,
    getFontSizeStyles,
    
    // Computed values
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isSystem: theme === 'system',
    currentThemeStyles: themes[theme],
    currentPrimaryColorStyles: primaryColors[primaryColor],
    currentFontSizeStyles: fontSizes[fontSize]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
