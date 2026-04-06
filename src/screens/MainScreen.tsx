import { colors } from '../constants/colours'
import React, { useMemo } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useServers } from '../hooks/useServers'
import { useGroups } from '../hooks/useGroups'
import { useAllServersHealth } from '../hooks/useAllServersHealth'
import { StabilityHeader } from '../components/StabilityHeader'
import { InsightCard } from '../components/InsightCard'
import { CountersBlock } from '../components/CountersBlock'
import { MetricChart } from '../components/MetricChart'
import { ServerMiniChart } from '../components/ServerMiniChart'
import { RootStackParamList } from '../navigation'
import { MultiServerChart } from '../components/MultiServerChart'

export const MainScreen = () => {
  const { servers } = useServers()
  const { groups } = useGroups()
  const allHealth = useAllServersHealth(servers)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const avgHealthScore = useMemo(() => {
    const loaded = allHealth.filter(h => !h.loading && h.healthScore > 0)
    if (loaded.length === 0) return 0
    return Math.round(loaded.reduce((s, h) => s + h.healthScore, 0) / loaded.length)
  }, [allHealth])

  const worstGroup = useMemo(() => {
    if (groups.length === 0) return null
    return groups
      .map(group => {
        const groupHealth = allHealth.filter(h => group.serverIds.includes(h.server.id))
        const avg = groupHealth.length > 0
          ? groupHealth.reduce((s, h) => s + h.healthScore, 0) / groupHealth.length
          : 100
        return { group, avg }
      })
      .sort((a, b) => a.avg - b.avg)[0]?.group ?? null
  }, [groups, allHealth])

  const displayServers = useMemo(() => {
    if (!worstGroup) return allHealth
    return allHealth.filter(h => worstGroup.serverIds.includes(h.server.id))
  }, [worstGroup, allHealth])

  const firstHealth = allHealth[0]

  const insights = useMemo(() => {
    const list: string[] = []
    const critical = allHealth.filter(h => h.healthScore < 50)
    const degrading = allHealth.filter(h => h.anomalyType !== null)
    if (critical.length > 0)
      list.push(`${critical.map(h => h.server.name).join(', ')} — critical`)
    if (degrading.length > 0)
      list.push(`${degrading.map(h => h.server.name).join(', ')} — anomaly detected`)
    if (list.length === 0)
      list.push('All systems operating normally')
    return list
  }, [allHealth])

  const stableCount = allHealth.filter(h => h.anomalyType === null && h.healthScore >= 75).length
  const unstableCount = allHealth.filter(h => h.anomalyType !== null || h.healthScore < 75).length
  const loading = allHealth.every(h => h.loading)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <StabilityHeader stability={avgHealthScore} />

      {servers.length === 0 && (
        <View style={{ padding: 18, alignItems: 'center', paddingTop: 40 }}>
          <Text style={{ color: colors.text.hint, fontSize: 14 }}>No servers added</Text>
          <Text style={{ color: colors.text.ghost, fontSize: 12, marginTop: 6 }}>
            Add a server in Settings
          </Text>
        </View>
      )}

      {loading && servers.length > 0 && (
        <View style={{ padding: 18 }}>
          <Text style={{ color: colors.text.muted }}>Loading metrics...</Text>
        </View>
      )}

      {!loading && servers.length > 0 && (
        <>
        {allHealth.some(h => h.cpu.length > 0) && (
            <View style={{
              backgroundColor: colors.bg.card,
              marginHorizontal: 14,
              borderRadius: 2,
              paddingVertical: 10,
              marginBottom: 14,
              borderWidth: 0.5,
              borderColor: colors.border,
              overflow: 'hidden',
            }}>
              <MultiServerChart
                height={160}
                servers={allHealth
                  .filter(h => h.cpu.length > 0)
                  .map((h, i) => ({
                    name: h.server.name,
                    data: h.cpu,
                    color: '',
                  }))}
              />
            </View>
          )}

          <InsightCard insights={insights} />

          <View style={{ marginHorizontal: 14, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.hint, letterSpacing: 1 }}>
                {worstGroup ? worstGroup.name : 'SERVERS'}
              </Text>
            </View>

            {displayServers.map(h => (
              <TouchableOpacity
                key={h.server.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Service', {
                  serverId: h.server.id,
                  serverName: h.server.name,
                  serverUrl: h.server.url,
                })}
              >
                <ServerMiniChart
                  name={h.server.name}
                  healthScore={h.healthScore}
                  cpu={h.cpu}
                  ram={h.ram}
                  disk={h.disk}
                />
              </TouchableOpacity>
            ))}
          </View>

          <CountersBlock
            stable={stableCount}
            unstable={unstableCount}
          />
        </>
      )}
    </ScrollView>
  )
}