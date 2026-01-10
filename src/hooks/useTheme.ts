import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    root.classList.add('dark')
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme }
}