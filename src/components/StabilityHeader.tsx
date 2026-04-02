import React from 'react'
import { View, Text } from 'react-native'
import { colors } from '../constants/colours'

interface StabilityHeaderProps {
  stability: number
}

export const StabilityHeader = React.memo(({ stability }: StabilityHeaderProps) => {
  const isDegrading = stability < 75

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 22,
      paddingTop: 60,
      paddingBottom: 16,
    }}>
      <View>
        <Text style={{ color: colors.text.muted, fontSize: 14 }}>Stability</Text>
        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '500' }}>
          {stability}%
        </Text>
      </View>
      <Text style={{
        fontSize: 13,
        fontWeight: '500',
        color: isDegrading ? colors.semantic.threat : colors.semantic.stable,
      }}>
        {isDegrading ? 'Degrading ↓' : 'Stable ↑'}
      </Text>
    </View>
  )
})