import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colours'
import { MapServerCard } from './MapServerCard'
import { Server } from '../constants/types'

interface MapGroupBlockProps {
  name: string
  servers: Server[]
  onServerPress: (server: Server) => void
  defaultExpanded?: boolean
}

export const MapGroupBlock = React.memo(({
  name,
  servers,
  onServerPress,
  defaultExpanded = true,
}: MapGroupBlockProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const toggle = useCallback(() => setExpanded(prev => !prev), [])

  return (
    <View style={{ marginBottom: 8 }}>
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: colors.bg.card,
          borderWidth: 0.5,
          borderColor: colors.border,
          borderRadius: 2,
          marginBottom: expanded ? 6 : 0,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.muted, letterSpacing: 1 }}>
          {name}
        </Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.text.hint}
        />
      </TouchableOpacity>

      {expanded && servers.map(server => (
        <MapServerCard
          key={server.id}
          server={server}
          onPress={() => onServerPress(server)}
        />
      ))}
    </View>
  )
})