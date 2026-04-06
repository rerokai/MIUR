import { colors } from '../constants/colours'
import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { RootStackParamList } from '../navigation'

type Nav = NativeStackNavigationProp<RootStackParamList>
const { width, height } = Dimensions.get('window')

const BAR_COUNT = 20
const BAR_WIDTH = (width - 64) / BAR_COUNT

const AnimatedBar = ({ index }: { index: number }) => {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 80),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000 + Math.random() * 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration:1000 + Math.random() * 200,
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const barHeight = 100 + (index % 5) * 70
  const color = index % 3 === 0 ? colors.semantic.threat : index % 3 === 1 ? colors.accent : '#7B61FF'

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  })

  return (
    <Animated.View
      style={{
        width: BAR_WIDTH - 3,
        height: barHeight,
        backgroundColor: color,
        borderRadius: 3,
        opacity: 0.8,
        transform: [{ scaleY: scale }],
      }}
    />
  )
}

export const OnboardingWelcomeScreen = () => {
  const navigation = useNavigation<Nav>()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary, paddingHorizontal: 32 }}>
      {/* Title */}
      <Animated.View style={{ opacity: fadeAnim, paddingTop: 80 }}>
        <Text style={{
          fontSize: 42,
          fontWeight: '500',
          color: colors.text.primary,
          lineHeight: 48,
          marginBottom: 8,
        }}>
          Welcome to{'\n'}MIUR
        </Text>
      </Animated.View>

      {/* Chart bars */}
      <View style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 3,
      }}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <AnimatedBar key={i} index={i} />
        ))}
      </View>

      {/* Subtitle + button */}
      <Animated.View style={{ opacity: fadeAnim, paddingBottom: 60 }}>
        <Text style={{
          fontSize: 14,
          color: colors.text.hint,
          marginBottom: 32,
          textAlign: 'center',
        }}>
          Monitoring Infrastructure, Unified & Reactive
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('OnboardingRole')}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 2,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>Get started</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}