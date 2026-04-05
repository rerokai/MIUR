import React, { useState, useMemo } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colours'
import { usePrometheus } from '../hooks/usePrometheus'
import { useServers } from '../hooks/useServers'
import { calculateBaseline, detectAnomaly, calculateHealthScore, generateDigest, predictTimeToThreshold } from '../utils/analytics'
import { config } from '../constants/config'

const getScoreColor = (score: number) => {
  if (score < 50) return colors.semantic.threat
  if (score < 75) return colors.semantic.warning
  return colors.semantic.stable
}

const ServerAnalytics = ({ serverUrl, serverName }: { serverUrl: string, serverName: string }) => {
  const { cpu, ram, disk } = usePrometheus(serverUrl, 1)

  const baseline = useMemo(() => calculateBaseline(cpu), [cpu])
  const anomalyType = useMemo(() => detectAnomaly(cpu, baseline), [cpu, baseline])

  const healthScore = useMemo(() => {
    if (!cpu.length || !ram.length || !disk.length) return 0
    return calculateHealthScore({
      cpu: cpu[cpu.length - 1].value,
      ram: ram[ram.length - 1].value,
      disk: disk[disk.length - 1].value,
      hasAnomaly: anomalyType !== null,
    })
  }, [cpu, ram, disk, anomalyType])

  const baselineVal = baseline.length > 0 ? baseline[baseline.length - 1].value : 0
  const currentVal = cpu.length > 0 ? cpu[cpu.length - 1].value : 0
  const deviation = baselineVal > 0 ? ((currentVal - baselineVal) / baselineVal * 100) : 0

  const timeToThreshold = useMemo(() => predictTimeToThreshold(cpu, 90), [cpu])

  return { healthScore, anomalyType, deviation, timeToThreshold, serverName }
}

export const AnalyticsScreen = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'modelling'>('summary')
  const { servers } = useServers()

  const server = servers[0]
  const { cpu, ram, disk } = usePrometheus(server?.url ?? config.prometheusUrl, 1)

  const baseline = useMemo(() => calculateBaseline(cpu), [cpu])
  const anomalyType = useMemo(() => detectAnomaly(cpu, baseline), [cpu, baseline])

  const healthScore = useMemo(() => {
    if (!cpu.length || !ram.length || !disk.length) return 0
    return calculateHealthScore({
      cpu: cpu[cpu.length - 1].value,
      ram: ram[ram.length - 1].value,
      disk: disk[disk.length - 1].value,
      hasAnomaly: anomalyType !== null,
    })
  }, [cpu, ram, disk, anomalyType])

  const baselineVal = useMemo(() =>
    baseline.length > 0 ? baseline[baseline.length - 1].value : 0,
    [baseline]
  )

  const currentCpu = cpu.length > 0 ? cpu[cpu.length - 1].value : 0
  const deviation = baselineVal > 0 ? ((currentCpu - baselineVal) / baselineVal * 100).toFixed(0) : '0'

  const timeToThreshold = useMemo(() => predictTimeToThreshold(cpu, 90), [cpu])

  const digest = useMemo(() => generateDigest([
    { name: 'PROD', score: healthScore, anomalyCount: anomalyType !== null ? 1 : 0 },
  ]), [healthScore, anomalyType])

  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const scoreColor = getScoreColor(healthScore)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
      }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text.primary }}>Analytics</Text>
        <Text style={{ fontSize: 11, color: colors.text.hint }}>update {timeStr}</Text>
      </View>

      {/* Digest card */}
      <View style={{
        backgroundColor: colors.bg.card,
        marginHorizontal: 16,
        borderRadius: 2,
        borderWidth: 0.5,
        borderColor: colors.border,
        padding: 14,
        marginBottom: 12,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1 }}>DIGEST</Text>
          <Text style={{ fontSize: 11, color: colors.text.hint }}>{timeStr}</Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 20, marginBottom: 12 }}>
          {digest}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: scoreColor }} />
            <Text style={{ fontSize: 11, color: colors.text.hint }}>
              {anomalyType !== null ? '1 group degrading' : 'all groups stable'}
            </Text>
          </View>
          <TouchableOpacity style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            borderWidth: 0.5, borderColor: colors.border, borderRadius: 6,
            paddingHorizontal: 8, paddingVertical: 4,
          }}>
            <Feather name="download" size={11} color={colors.text.hint} />
            <Text style={{ fontSize: 11, color: colors.text.hint }}>SVG</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.bg.card,
        marginHorizontal: 16,
        borderRadius: 2,
        padding: 3,
        marginBottom: 14,
        borderWidth: 0.5,
        borderColor: colors.border,
      }}>
        {(['summary', 'modelling'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 2,
              backgroundColor: activeTab === tab ? colors.bg.elevated : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '500',
              color: activeTab === tab ? colors.text.primary : colors.text.hint,
            }}>
              {tab === 'summary' ? 'Сводка' : 'Моделирование'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'summary' && (
        <>
          {/* Groups */}
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>GROUPS</Text>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 }}>
            {[
              { name: 'PROD', score: healthScore },
              { name: 'STAGING', score: 74 },
              { name: 'DEV', score: 91 },
            ].map(g => (
              <View key={g.name} style={{
                flex: 1, backgroundColor: colors.bg.card, borderRadius: 2,
                borderWidth: 0.5, borderColor: colors.border, padding: 10,
                alignItems: 'flex-start',
              }}>
                <Text style={{ fontSize: 9, color: colors.text.hint, marginBottom: 4 }}>{g.name}</Text>
                <Text style={{ fontSize: 22, fontWeight: '500', color: getScoreColor(g.score) }}>
                  {g.score}%
                </Text>
                <Text style={{ fontSize: 9, color: colors.text.hint, marginTop: 2 }}>
                  {g.score < 50 ? 'critical' : g.score < 75 ? 'degrading' : 'stable'}
                </Text>
              </View>
            ))}
          </View>

          {/* Тихая деградация */}
          {anomalyType === 'degradation' && (
            <>
              <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>ТИХАЯ ДЕГРАДАЦИЯ</Text>
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border,
                  }}>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>
                        {server?.name} · CPU
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.text.hint, marginTop: 2 }}>
                        растёт уже 20 мин
                      </Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.semantic.warning }}>
                      +{deviation}%
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Корреляции */}
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>КОРРЕЛЯЦИИ</Text>
          <View style={{
            backgroundColor: colors.bg.card, marginHorizontal: 16,
            borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
            padding: 12, marginBottom: 16,
          }}>
            <Text style={{ fontSize: 10, color: colors.text.hint, marginBottom: 6 }}>
              13:32 — одновременное изменение
            </Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 10 }}>
              3 сервера изменили поведение в течении 2 минут
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {['CPU web-01', 'CPU web-02', 'CPU web-03'].map(tag => (
                <View key={tag} style={{
                  backgroundColor: colors.bg.elevated, borderRadius: 4,
                  paddingHorizontal: 8, paddingVertical: 3,
                }}>
                  <Text style={{ fontSize: 10, color: colors.text.muted }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {activeTab === 'modelling' && (
        <>
          {/* Сценарии */}
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>
            СЦЕНАРИИ — при текущем тренде
          </Text>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            {[
              {
                name: server?.name ?? 'prod-web-01',
                metric: 'CPU',
                description: 'Достигнет порога 90% и вызовет критическую нагрузку',
                time: timeToThreshold ? `~${timeToThreshold} мин` : '—',
                method: 'линейный тренд',
              },
              {
                name: server?.name ?? 'prod-web-01',
                metric: 'RAM',
                description: 'Достигнет порога 90% и вызовет критическую нагрузку',
                time: '~18 мин',
                method: 'линейный тренд',
              },
            ].map((scenario, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border,
              }}>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.text.hint, marginBottom: 4 }}>
                    {scenario.name} · {scenario.metric}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 6 }}>
                    {scenario.description}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.semantic.warning }}>
                      {scenario.time}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.text.hint }}>· {scenario.method}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Паттерны */}
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>
            ПАТТЕРНЫ — повторяемость
          </Text>
          <View style={{
            backgroundColor: colors.bg.card, marginHorizontal: 16,
            borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
            padding: 12,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={{
                width: 28, height: 28, borderRadius: 8,
                backgroundColor: colors.bg.elevated,
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Feather name="clock" size={13} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.text.hint, marginBottom: 4 }}>
                  {server?.name ?? 'prod-web-01'} · CPU
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 6 }}>
                  Похожий всплеск уже происходил — обычно по вторникам около 15:00
                </Text>
                <Text style={{ fontSize: 11, color: colors.accent }}>
                  3 раза за последние 7 дней
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  )
}