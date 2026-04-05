import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colours'
import { MapGroupBlock } from '../components/MapGroupBlock'
import { useServers } from '../hooks/useServers'

import { Server } from '../constants/types'
import { CompositeNavigationProp } from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { RootStackParamList, TabParamList } from '../navigation'

type NavigationProp = CompositeNavigationProp <
  BottomTabNavigationProp<TabParamList, 'Map'>,
  NativeStackNavigationProp<RootStackParamList>
>

const GROUPS: Record<string, string[]> = {
  PROD: ['prod-web-01'],
  DEV: ['dev-01'],
}

const ALL_GROUPS = ['All Servers', 'PROD', 'DEV']

export const MapScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const { servers } = useServers()
  const [activeFilter, setActiveFilter] = useState('All Servers')

  const handleServerPress = useCallback((server: Server) => {
    navigation.navigate('Service', {
      serverId: server.id,
      serverName: server.name,
      serverUrl: server.url,
    })
  }, [navigation])

  const groups = useMemo(() => {
    return Object.entries(GROUPS).map(([groupName, serverNames]) => ({
      name: groupName,
      servers: servers.filter(s => serverNames.includes(s.name)),
    })).filter(g => g.servers.length > 0)
  }, [servers])

  const ungrouped = useMemo(() =>
    servers.filter(s =>
      !Object.values(GROUPS).flat().includes(s.name)
    ),
    [servers]
  )

  const filteredGroups = useMemo(() => {
    if (activeFilter === 'All Servers') return groups
    return groups.filter(g => g.name === activeFilter)
  }, [groups, activeFilter])

  const totalServers = servers.length

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 }}>
        
        {/* Filter row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, marginTop: 8, }}>
          <Feather name="filter" size={15} color={colors.text.hint} />
          {ALL_GROUPS.map((f, i) => (
            <React.Fragment key={f}>
              <TouchableOpacity onPress={() => setActiveFilter(f)}>
                <Text style={{
                  fontSize: 15,
                  fontWeight: activeFilter === f ? '400' : '400',
                  color: activeFilter === f ? colors.text.primary : colors.text.hint,
                }}>
                  {f}
                </Text>
              </TouchableOpacity>
              {i < ALL_GROUPS.length - 1 && (
                <Text style={{ color: colors.text.hint, fontSize: 13 }}>/</Text>
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
          <View style={{
            flex: 1, backgroundColor: colors.bg.card, borderRadius: 2,
            borderWidth: 0.5, borderColor: colors.border, padding: 10,
          }}>
            <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 4 }}>Servers</Text>
            <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '500' }}>
              {totalServers}
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: colors.bg.card, borderRadius: 2,
            borderWidth: 0.5, borderColor: colors.border, padding: 10,
          }}>
            <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 4 }}>Critical</Text>
            <Text style={{ color: colors.semantic.threat, fontSize: 20, fontWeight: '500' }}>
              0
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: colors.bg.card, borderRadius: 2,
            borderWidth: 0.5, borderColor: colors.border, padding: 10,
          }}>
            <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 4 }}>Degrading</Text>
            <Text style={{ color: colors.semantic.warning, fontSize: 20, fontWeight: '500' }}>
              0
            </Text>
          </View>
        </View>
      </View>

      {/* Groups */}
      <View style={{ paddingHorizontal: 14 }}>
        {filteredGroups.map(group => (
          <MapGroupBlock
            key={group.name}
            name={group.name}
            servers={group.servers}
            onServerPress={handleServerPress}
            defaultExpanded={group.name === 'PROD'}
          />
        ))}
        {ungrouped.length > 0 && activeFilter === 'All Servers' && (
        <MapGroupBlock
          key="other"
          name="OTHER"
          servers={ungrouped}
          onServerPress={handleServerPress}
          defaultExpanded
        />
      )}
      </View>
    </ScrollView>
  )
}