import { colors } from '../constants/colours'
import React from 'react'
import { View, Text } from 'react-native'


interface ServerCardProps {
  name: string
  healthScore: number
  cpu: number | null
  ram: number | null
  disk: number | null
}

const getScoreColor = (score: number, colors: any) => {
  if (score < 50) return colors.semantic.threat
  if (score < 75) return colors.semantic.warning
  return colors.semantic.stable
}

export const ServerCard = React.memo(({
  name,
  healthScore,
  cpu,
  ram,
  disk,
}: ServerCardProps) => {
  const scoreColor = getScoreColor(healthScore, colors)

  
  return (
    <View style={{
      backgroundColor: colors.bg.card,
      borderRadius: 2,
      padding: 16,
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderLeftWidth: 2,
      borderLeftColor: scoreColor,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <View>
          <Text style={{
            color: colors.text.secondary,
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 2,
          }}>
            {name}
          </Text>
          <Text style={{ color: colors.text.hint, fontSize: 10 }}>
            last update: just now
          </Text>
        </View>
        <View>
          <Text style={{
            fontSize: 18,
            fontWeight: '500',
            color: scoreColor,
            textAlign: 'right',
          }}>
            {healthScore}%
          </Text>
          <Text style={{
            color: colors.text.hint,
            fontSize: 9,
            textAlign: 'right',
            marginTop: 1,
          }}>
            health score
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>
            CPU
          </Text>
          <Text style={{
            fontSize: 13,
            fontWeight: '500',
            color: cpu && cpu > 80
              ? colors.semantic.threat
              : colors.text.secondary,
          }}>
            {cpu !== null ? `${cpu.toFixed(1)}%` : '—'}
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>
            RAM
          </Text>
          <Text style={{
            fontSize: 13,
            fontWeight: '500',
            color: ram && ram > 70
              ? colors.semantic.warning
              : colors.text.secondary,
          }}>
            {ram !== null ? `${ram.toFixed(1)}%` : '—'}
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>
            Disk
          </Text>
          <Text style={{
            fontSize: 13,
            fontWeight: '500',
            color: colors.semantic.stable,
          }}>
            {disk !== null ? `${disk.toFixed(1)}%` : '—'}
          </Text>
        </View>
      </View>
    </View>
  )
})