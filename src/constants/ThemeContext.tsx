import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { darkTheme, lightTheme } from './themes'
import { applyTheme } from './colours'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('theme').then(val => {
      if (val === 'light') {
        setIsDark(false)
        applyTheme(lightTheme)
      }
    })
  }, [])

  const toggleTheme = async () => {
    const next = !isDark
    setIsDark(next)
    applyTheme(next ? darkTheme : lightTheme)
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)