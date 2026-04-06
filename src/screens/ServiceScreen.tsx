import { colors } from '../constants/colours'
import React, { useState, useMemo, useCallback } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'

import { usePrometheus } from '../hooks/usePrometheus'
import { calculateBaseline, detectAnomaly, calculateHealthScore } from '../utils/analytics'
import { RootStackParamList } from '../navigation'
import { MetricChart } from '../components/MetricChart'

type ServiceRouteProp = RouteProp<RootStackParamList, 'Service'>

const TIME_RANGES = ['15 m', '1 h', '6 h', '24 h']
const METRIC_TABS = ['CPU', 'RAM', 'Disk', 'Net', 'System']


const getScoreColor = (score: number, colors: any) => {
  if (score < 50) return colors.semantic.threat
  if (score < 75) return colors.semantic.warning
  return colors.semantic.stable
}

export const ServiceScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<ServiceRouteProp>()
  const { serverName, serverUrl } = route.params

  const [activeRange, setActiveRange] = useState('1 h')
  const [activeMetric, setActiveMetric] = useState('CPU')

  const rangeHours = useMemo(() => {
    const map: Record<string, number> = { '15 m': 0.25, '1 h': 1, '6 h': 6, '24 h': 24 }
    return map[activeRange] ?? 1
  }, [activeRange])

  const { cpu, ram, disk, ramUsedGB, loadAvg, uptime, openConnections, processes, loading } = usePrometheus(serverUrl, rangeHours)

  const currentUptime = uptime.length > 0 ? uptime[uptime.length - 1].value : null
  const currentLoad = loadAvg.length > 0 ? loadAvg[loadAvg.length - 1].value : null
  const currentRamGB = ramUsedGB.length > 0 ? ramUsedGB[ramUsedGB.length - 1].value : null
  const currentConnections = openConnections.length > 0 ? openConnections[openConnections.length - 1].value : null
  const currentProcesses = processes.length > 0 ? processes[processes.length - 1].value : null

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return `${days}d ${hours}h`
  }

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

  const scoreColor = getScoreColor(healthScore, colors)

  const currentMetricData = useMemo(() => {
    switch (activeMetric) {
      case 'CPU': return cpu
      case 'RAM': return ram
      case 'Disk': return disk
      default: return cpu
    }
  }, [activeMetric, cpu, ram, disk])

  const currentVal = currentMetricData.length > 0
    ? currentMetricData[currentMetricData.length - 1].value
    : null

  const baselineVal = baseline.length > 0
    ? baseline[baseline.length - 1].value
    : null

  const deviation = currentVal && baselineVal
    ? ((currentVal - baselineVal) / baselineVal * 100).toFixed(0)
    : null

  const insights = useMemo(() => {
    const list: string[] = []
    if (anomalyType === 'spike') list.push(`CPU spike — ${deviation}% above baseline for 12 min`)
    if (anomalyType === 'degradation') list.push('Load avg rising for 20 min — silent degradation')
    return list
  }, [anomalyType, deviation])

  const avg = useMemo(() =>
    currentMetricData.length > 0
      ? (currentMetricData.reduce((s, p) => s + p.value, 0) / currentMetricData.length).toFixed(0)
      : '—',
    [currentMetricData]
  )

  const max = useMemo(() =>
    currentMetricData.length > 0
      ? Math.max(...currentMetricData.map(p => p.value)).toFixed(0)
      : '—',
    [currentMetricData]
  )

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 8,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text.primary }}>
          {serverName}
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 18, fontWeight: '500', color: scoreColor }}>
            {healthScore}%
          </Text>
          <Text style={{ fontSize: 9, color: colors.text.hint }}>health score</Text>
        </View>
      </View>

      {/* Health bar */}
      <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
        <View style={{ height: 2, backgroundColor: colors.bg.elevated, borderRadius: 1 }}>
          <View style={{ height: 2, width: `${healthScore}%`, backgroundColor: scoreColor, borderRadius: 1 }} />
        </View>
      </View>

      {/* Time range */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 16, paddingHorizontal: 16 }}>
        {TIME_RANGES.map((r, i) => (
          <React.Fragment key={r}>
            <TouchableOpacity onPress={() => setActiveRange(r)}>
              <Text style={{
                fontSize: 13,
                fontWeight: activeRange === r ? '500' : '400',
                color: activeRange === r ? colors.text.primary : colors.text.hint,
                paddingHorizontal: 4,
              }}>
                {r}
              </Text>
            </TouchableOpacity>
            {i < TIME_RANGES.length - 1 && (
              <Text style={{ color: colors.text.hint, fontSize: 13, marginHorizontal: 4 }}>/</Text>
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Overview grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, marginBottom: 14 }}>
        {[
          { label: 'Uptime', value: currentUptime ? formatUptime(currentUptime) : '—', color: colors.semantic.stable },
          { label: 'Load avg', value: currentLoad ? currentLoad.toFixed(1) : '—', color: currentLoad && currentLoad > 2 ? colors.semantic.threat : colors.text.secondary },
          { label: 'RAM used', value: currentRamGB ? `${currentRamGB.toFixed(1)} GB` : '—', color: colors.text.secondary },
          { label: 'Connect', value: currentConnections ? Math.round(currentConnections).toString() : '—', color: currentConnections && currentConnections > 1000 ? colors.semantic.warning : colors.text.secondary },
          { label: 'Process', value: currentProcesses ? Math.round(currentProcesses).toString() : '—', color: colors.text.secondary },
          { label: 'Disk', value: disk.length > 0 ? `${disk[disk.length-1].value.toFixed(0)}%` : '—', color: colors.semantic.stable },
        ].map(item => (
          <View key={item.label} style={{
            width: '31%',
            backgroundColor: colors.bg.card,
            borderRadius: 2,
            borderWidth: 0.5,
            borderColor: colors.border,
            padding: 10,
          }}>
            <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 4 }}>{item.label}</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: item.color }}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Metric tabs */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.bg.card,
        marginHorizontal: 16,
        borderRadius: 2,
        padding: 3,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: colors.border,
      }}>
        {METRIC_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveMetric(tab)}
            style={{
              flex: 1,
              paddingVertical: 6,
              borderRadius: 2,
              backgroundColor: activeMetric === tab ? colors.bg.elevated : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 11,
              fontWeight: '500',
              color: activeMetric === tab ? colors.text.primary : colors.text.hint,
            }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart card */}
      <View style={{
        backgroundColor: colors.bg.card,
        marginHorizontal: 16,
        borderRadius: 2,
        borderWidth: 0.5,
        borderColor: colors.border,
        borderLeftWidth: 2.5,
        borderLeftColor: scoreColor,
        overflow: 'hidden',
        marginBottom: 10,
      }}>
        {/* header */}
        <View style={{ padding: 12, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: colors.text.muted, fontSize: 12 }}>{activeMetric} Usage</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 20, fontWeight: '500', color: scoreColor }}>
                {currentVal ? `${currentVal.toFixed(1)}%` : '—'}
              </Text>
              {deviation && (
                <Text style={{ fontSize: 9, color: scoreColor }}>+{deviation}% от baseline</Text>
              )}
            </View>
          </View>
        </View>

        {/* chart — без padding чтобы растянулся */}
        <MetricChart
          data={currentMetricData}
          data2={activeMetric === 'CPU' ? ram : undefined}
          height={120}
        />

        {/* stats */}
        <View style={{ flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12, marginTop:10, }}>
          {[
            { label: 'avg', value: `${avg}%` },
            { label: 'max', value: `${max}%`, color: scoreColor },
            { label: 'baseline', value: baselineVal ? `${baselineVal.toFixed(0)}%` : '—' },
            { label: 'iowait', value: '12%', color: colors.semantic.warning },
          ].map((s, i, arr) => (
            <View key={s.label} style={{
              flex: 1,
              alignItems: 'center',
              borderRightWidth: i < arr.length - 1 ? 0.5 : 0,
              borderRightColor: colors.border,
            }}>
              <Text style={{ fontSize: 9, color: colors.text.hint, marginBottom: 2 }}>{s.label}</Text>
              <Text style={{ fontSize: 12, fontWeight: '500', color: s.color ?? colors.text.secondary }}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Event History button */}
      <TouchableOpacity
        onPress={() => (navigation as any).navigate('History')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.bg.card,
          marginHorizontal: 16,
          borderRadius: 2,
          borderWidth: 0.5,
          borderColor: colors.border,
          padding: 12,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: colors.bg.elevated,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Feather name="clock" size={13} color={colors.accent} />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text.secondary }}>
              Event History
            </Text>
            <Text style={{ fontSize: 10, color: colors.text.hint }}>
              7 events in the last 24 hours
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={14} color={colors.text.hint} />
      </TouchableOpacity>

      {/* Anomaly insights */}
      {insights.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop:10 }}>
          {insights.map((insight, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <Text style={{ color: colors.text.hint, fontSize: 13, marginTop: 1 }}> - </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 13, lineHeight: 18, flex: 1 }}>
                {insight}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}