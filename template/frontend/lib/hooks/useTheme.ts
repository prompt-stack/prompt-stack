'use client'

import { useState, useEffect } from 'react'

export type ThemeColor = 'orange' | 'blue' | 'purple' | 'green' | 'rose'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [themeColor, setThemeColorState] = useState<ThemeColor>('orange')

  useEffect(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system'
    const savedColor = localStorage.getItem('themeColor') as ThemeColor || 'orange'
    setTheme(savedTheme)
    setThemeColorState(savedColor)

    // Function to update dark mode based on theme
    const updateDarkMode = (currentTheme: 'light' | 'dark' | 'system') => {
      if (currentTheme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(systemDark)
        document.documentElement.classList.toggle('dark', systemDark)
      } else {
        const isDark = currentTheme === 'dark'
        setIsDarkMode(isDark)
        document.documentElement.classList.toggle('dark', isDark)
      }
    }

    updateDarkMode(savedTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateDarkMode('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setAndSaveTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setAndSaveTheme(newTheme)
  }

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color)
    localStorage.setItem('themeColor', color)
  }

  return {
    theme,
    isDarkMode,
    themeColor,
    setTheme: setAndSaveTheme,
    toggleTheme,
    setThemeColor,
  }
}