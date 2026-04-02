import React from 'react'
import { View, Text } from 'react-native'
import { colors } from '../constants/colours'
import { ServerCard } from './ServerCard'

interface GroupBlockProps {
  name: string
  score: number
  servers: {
    id: string
    name: string
    healthScore: number
    cpu: number | null
    ram: number | null
    disk: number | null
  }[]
}

const getScoreColor = (score: number) => {
  if (score < 50) return colors.semantic.threat
  if (score < 75) return colors.semantic.warning
  return colors.semantic.stable
}

export const GroupBlock = React.memo(({ name, score, servers }: GroupBlockProps) => {
  const scoreColor = getScoreColor(score)

  return (
    <View style={{ marginHorizontal: 14, marginBottom: 14 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
      }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: scoreColor }}>
          {name}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: scoreColor }}>
          {score}%
        </Text>
      </View>

      {servers.map(server => (
        <ServerCard
          key={server.id}
          name={server.name}
          healthScore={server.healthScore}
          cpu={server.cpu}
          ram={server.ram}
          disk={server.disk}
        />
      ))}
    </View>
  )
})