import { colors } from '../constants/colours'
import React from 'react'
import { View, Text } from 'react-native'


interface CountersBlockProps {
  stable: number
  unstable: number
}

export const CountersBlock = React.memo(({ stable, unstable }: CountersBlockProps) => {
  return (
    <View style={{ marginHorizontal: 18, marginTop: 4 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
      }}>
        <Text style={{ color: colors.text.muted, fontSize: 14 }}>Stable</Text>
        <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '500' }}>
          {stable}
        </Text>
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
      }}>
        <Text style={{ color: colors.text.muted, fontSize: 14 }}>Unstable</Text>
        <Text style={{
          color: unstable > 0 ? colors.semantic.threat : colors.text.primary,
          fontSize: 16,
          fontWeight: '500',
        }}>
          {unstable}
        </Text>
      </View>
    </View>
  )
})