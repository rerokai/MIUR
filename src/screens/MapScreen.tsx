import { colors } from '../constants/colours'
import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Feather } from '@expo/vector-icons'

import { MapGroupBlock } from '../components/MapGroupBlock'
import { useServers } from '../hooks/useServers'

import { Server } from '../constants/types'
import { CompositeNavigationProp } from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { RootStackParamList, TabParamList } from '../navigation'
import { useGroups } from '../hooks/useGroups'
import { useFocusEffect } from '@react-navigation/native'


type NavigationProp = CompositeNavigationProp <
  BottomTabNavigationProp<TabParamList, 'Map'>,
  NativeStackNavigationProp<RootStackParamList>
>
export const MapScreen = () => {
  const navigation = useNavigation<NavigationProp>()
 
  const [activeFilter, setActiveFilter] = useState('All Servers')

  const { servers, refresh: refreshServers } = useServers()
  const { groups, refresh: refreshGroups } = useGroups()
  
  useFocusEffect(
    useCallback(() => {
      refreshServers()
      refreshGroups()
    }, [])
  )
  
  const mappedGroups = useMemo(() => {
    return groups.map(group => ({
      name: group.name,
      servers: servers.filter(s => group.serverIds.includes(s.id)),
    })).filter(g => g.servers.length > 0)
  }, [groups, servers])

  const ungrouped = useMemo(() =>
    servers.filter(s =>
      !groups.some(g => g.serverIds.includes(s.id))
    ),
    [groups, servers]
  )

  const filteredGroups = useMemo(() => {
    if (activeFilter === 'All Servers') return mappedGroups
    return mappedGroups.filter(g => g.name === activeFilter)
  }, [mappedGroups, activeFilter])

  const allFilterNames = ['All Servers', ...groups.map(g => g.name)]

  const handleServerPress = useCallback((server: Server) => {
    navigation.navigate('Service', {
      serverId: server.id,
      serverName: server.name,
      serverUrl: server.url,
    })
  }, [navigation])

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
          {allFilterNames.map((f, i) => (
          <React.Fragment key={f}>
            <TouchableOpacity onPress={() => setActiveFilter(f)}>
              <Text style={{
                fontSize: 15,
                fontWeight: activeFilter === f ? '500' : '400',
                color: activeFilter === f ? colors.text.primary : colors.text.hint,
              }}>
                {f}
              </Text>
            </TouchableOpacity>
            {i < allFilterNames.length - 1 && (
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

      <View style={{ paddingHorizontal: 14 }}>
        {filteredGroups.map(group => (
          <MapGroupBlock
            key={group.name}
            name={group.name}
            servers={group.servers}
            onServerPress={handleServerPress}
            defaultExpanded
          />
        ))}

        {ungrouped.length > 0 && activeFilter === 'All Servers' && (
          <MapGroupBlock
            key="ungrouped"
            name="UNGROUPED"
            servers={ungrouped}
            onServerPress={handleServerPress}
            defaultExpanded
          />
        )}
      </View>
    </ScrollView>
  )
}