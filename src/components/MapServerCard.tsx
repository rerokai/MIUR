import { colors } from '../constants/colours'
import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'

import { usePrometheus } from '../hooks/usePrometheus'

import { Server } from '../constants/types'
import { calculateHealthScore, calculateBaseline, detectAnomaly } from '../utils/analytics'

interface MapServerCardProps {
  server: Server
  onPress: () => void
}

const getScoreColor = (score: number, colors:any) => {
  if (score < 50) return colors.semantic.threat
  if (score < 75) return colors.semantic.warning
  return colors.semantic.stable
}


const MiniChart = React.memo(({ data, color }: { data: { value: number }[], color: string }) => {
  const width = Dimensions.get('window').width - 56

  if (data.length === 0) return null

  return (
    <View style={{ marginLeft: -10 }}>
      <LineChart
        data={data}
        width={width}
        height={80}
        color={color}
        thickness={2}
        thickness2={1.2}
        hideDataPoints2
        hideDataPoints
        hideRules={false}
        rulesColor={colors.text.secondary}
        rulesThickness={0.5}
        xAxisColor="transparent"
        yAxisColor="transparent"
        hideYAxisText
        backgroundColor="transparent"
        noOfSections={3}
        maxValue={100}
        curved
        disableScroll
        areaChart
        data3={data.map(() => ({ value: data.reduce((s, p) => s + p.value, 0) / data.length }))}
        color3={colors.text.secondary}
        thickness3={0.8}
        hideDataPoints3
        startFillColor={color}
        endFillColor={color}
        startOpacity={0.2}
        endOpacity={0}
        startFillColor2="transparent"
        endFillColor2="transparent"
        startOpacity2={0}
        endOpacity2={0}
      />
    </View>
  )
})

export const MapServerCard = React.memo(({ server, onPress }: MapServerCardProps) => {
  const { cpu, ram, disk, loading } = usePrometheus(server.url)
  const ramData = useMemo(() =>
    ram.slice(-20).map(p => ({ value: parseFloat(p.value.toFixed(1)) })),
    [ram]
  )

  const healthScore = useMemo(() => {
    if (!cpu.length || !ram.length || !disk.length) return 0
    const baseline = calculateBaseline(cpu)
    const anomalyType = detectAnomaly(cpu, baseline)
    return calculateHealthScore({
      cpu: cpu[cpu.length - 1].value,
      ram: ram[ram.length - 1].value,
      disk: disk[disk.length - 1].value,
      hasAnomaly: anomalyType !== null,
    })
  }, [cpu, ram, disk])

  const scoreColor = getScoreColor(healthScore, colors)

  const chartData = useMemo(() =>
    cpu.slice(-20).map(p => ({ value: parseFloat(p.value.toFixed(1)) })),
    [cpu]
  )

  const currentCpu = cpu.length > 0 ? cpu[cpu.length - 1].value : null
  const currentRam = ram.length > 0 ? ram[ram.length - 1].value : null
  const currentDisk = disk.length > 0 ? disk[disk.length - 1].value : null

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.bg.card,
        borderRadius: 2,
        borderWidth: 0.5,
        borderColor: colors.border,
        borderLeftWidth: 2.5,
        borderLeftColor: scoreColor,
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 12,
        paddingBottom: 6,
      }}>
        <View>
          <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '500', marginBottom: 2 }}>
            {server.name}
          </Text>
          <Text style={{ color: colors.text.hint, fontSize: 10 }}>
            last update: just now
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: scoreColor, fontSize: 18, fontWeight: '500' }}>
            {loading ? '—' : `${healthScore}%`}
          </Text>
          <Text style={{ color: colors.text.hint, fontSize: 9 }}>health score</Text>
        </View>
      </View>

      {!loading && chartData.length > 0 && (
        <MiniChart data={chartData} color={scoreColor} />
      )}

      <View style={{ flexDirection: 'row', gap: 16, padding: 12, paddingTop: 6 }}>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>CPU</Text>
          <Text style={{
            fontSize: 13, fontWeight: '500',
            color: currentCpu && currentCpu > 80 ? colors.semantic.threat : colors.text.secondary,
          }}>
            {currentCpu ? `${currentCpu.toFixed(1)}%` : '—'}
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>RAM</Text>
          <Text style={{
            fontSize: 13, fontWeight: '500',
            color: currentRam && currentRam > 70 ? colors.semantic.warning : colors.text.secondary,
          }}>
            {currentRam ? `${currentRam.toFixed(1)}%` : '—'}
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>Disk</Text>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.semantic.stable }}>
            {currentDisk ? `${currentDisk.toFixed(1)}%` : '—'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})