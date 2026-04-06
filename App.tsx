import { ThemeProvider, useTheme } from './src/constants/ThemeContext'
import { Navigation } from './src/navigation'

const AppContent = () => {
  const { isDark } = useTheme()
  return <Navigation key={isDark ? 'dark' : 'light'} />
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}