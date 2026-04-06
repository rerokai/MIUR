import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { darkTheme, lightTheme, Theme } from './themes'

interface ThemeContextType {
  colors: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkTheme,
  isDark: true,
  toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('theme').then(val => {
      if (val === 'light') setIsDark(false)
    })
  }, [])

  const toggleTheme = async () => {
    const next = !isDark
    setIsDark(next)
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{
      colors: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)