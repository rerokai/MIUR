import { colors } from '../constants/colours'
import React from 'react'
import { View, Text } from 'react-native'


interface InsightCardProps {
  insights: string[]
}

export const InsightCard = React.memo(({ insights }: InsightCardProps) => {
  return (
    <View style={{
      backgroundColor: colors.bg.card,
      marginHorizontal: 14,
      borderRadius: 2,
      padding: 14,
      marginBottom: 14,
      borderWidth: 0.5,
      borderColor: colors.border,
    }}>
      {insights.map((insight, i) => (
        <View key={i} style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
          marginBottom: i < insights.length - 1 ? 8 : 0,
        }}>
          <Text style={{ color: colors.text.muted, fontSize: 12, marginTop: 2 }}>-</Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: 13,
            lineHeight: 18,
            flex: 1,
          }}>
            {insight}
          </Text>
        </View>
      ))}
    </View>
  )
})