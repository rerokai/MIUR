import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { ThemeProvider } from './src/constants/ThemeContext'
import { Navigation } from './src/navigation'

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
