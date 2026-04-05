import React, { useMemo } from 'react'
import { ScrollView, View, Text } from 'react-native'
import { colors } from '../constants/colours'
import { usePrometheus } from '../hooks/usePrometheus'
import { calculateBaseline, detectAnomaly, calculateHealthScore } from '../utils/analytics'
import { StabilityHeader } from '../components/StabilityHeader'
import { InsightCard } from '../components/InsightCard'
import { GroupBlock } from '../components/GroupBlock'
import { CountersBlock } from '../components/CountersBlock'
import { MetricChart } from '../components/MetricChart'
import { ServerMiniChart } from '../components/ServerMiniChart'

export const MainScreen = () => {
  const { cpu, ram, disk, loading, error } = usePrometheus()

  const baseline = useMemo(() => calculateBaseline(cpu), [cpu])

  const anomalyType = useMemo(
    () => detectAnomaly(cpu, baseline),
    [cpu, baseline]
  )

  const healthScore = useMemo(() => {
    if (!cpu.length || !ram.length || !disk.length) return 0
    return calculateHealthScore({
      cpu: cpu[cpu.length - 1].value,
      ram: ram[ram.length - 1].value,
      disk: disk[disk.length - 1].value,
      hasAnomaly: anomalyType !== null,
    })
  }, [cpu, ram, disk, anomalyType])

  const currentCpu = useMemo(() =>
    cpu.length > 0 ? cpu[cpu.length - 1].value : null, [cpu])

  const currentRam = useMemo(() =>
    ram.length > 0 ? ram[ram.length - 1].value : null, [ram])

  const currentDisk = useMemo(() =>
    disk.length > 0 ? disk[disk.length - 1].value : null, [disk])

  const insights = useMemo(() => {
    const list: string[] = []
    if (currentCpu && currentCpu > 80)
      list.push(`CPU spike (+${(currentCpu - 55).toFixed(0)}% above baseline)`)
    if (currentRam && currentRam > 70)
      list.push(`RAM degradation detected — rising steadily`)
    if (anomalyType === 'degradation')
      list.push(`Anomaly density above normal for last 20 min`)
    if (list.length === 0)
      list.push('All systems operating normally')
    return list
  }, [currentCpu, currentRam, anomalyType])

  const servers = useMemo(() => ([
    {
      id: '1',
      name: 'prod-web-01',
      healthScore,
      cpu: currentCpu,
      ram: currentRam,
      disk: currentDisk,
    }
  ]), [healthScore, currentCpu, currentRam, currentDisk])

  const stableCount = anomalyType === null ? 1 : 0
  const unstableCount = anomalyType !== null ? 1 : 0

  const getScoreColor = (score: number) => {
    if (score < 50) return colors.semantic.threat
    if (score < 75) return colors.semantic.warning
    return colors.semantic.stable
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <StabilityHeader stability={healthScore} />

      {loading && (
        <View style={{ padding: 18 }}>
          <Text style={{ color: colors.text.muted }}>Loading metrics...</Text>
        </View>
      )}

      {error && (
        <View style={{ margin: 18, padding: 14, backgroundColor: colors.bg.card, borderRadius: 12, borderWidth: 0.5, borderColor: colors.semantic.threat }}>
          <Text style={{ color: colors.semantic.threat }}>{error}</Text>
        </View>
      )}

      {!loading && !error && (
        <>
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
            <MetricChart
              data={cpu}
              height={160}
            />
          </View>

          <InsightCard insights={insights} />

          <View style={{ marginHorizontal: 14, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: getScoreColor(healthScore) }}>
                PROD
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '500', color: getScoreColor(healthScore) }}>
                {healthScore}%
              </Text>
            </View>

            <ServerMiniChart
              name="prod-web-01"
              healthScore={healthScore}
              cpu={cpu}
              ram={ram}
              disk={disk}
            />
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