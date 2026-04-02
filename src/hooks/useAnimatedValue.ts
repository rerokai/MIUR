import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

export const useAnimatedValue = (value: number | null) => {
  const animatedValue = useRef(new Animated.Value(value ?? 0)).current

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ?? 0,
      duration: 600,
      useNativeDriver: false,
    }).start()
  }, [value])

  // Возвращаем и animatedValue и отформатированную версию
  const formatted = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0.0', '100.0'],
  })

  return { animatedValue, formatted }
}