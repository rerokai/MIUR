import { colors } from '../constants/colours'
import React, { useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { MetricPoint } from '../constants/types'


interface ServerMiniChartProps {
  cpu: MetricPoint[]
  ram: MetricPoint[]
  disk: MetricPoint[]
  name: string
  healthScore: number
  lastUpdate?: string
}

export const ServerMiniChart = React.memo(({
  cpu, ram, disk, name, healthScore, lastUpdate
}: ServerMiniChartProps) => {
  const width = Dimensions.get('window').width - 28

  const getScoreColor = (score: number) => {
    if (score < 50) return colors.semantic.threat
    if (score < 75) return colors.semantic.warning
    return colors.semantic.stable
  }

  const scoreColor = getScoreColor(healthScore)

  const cpuData = useMemo(() =>
    cpu.slice(-20).map(p => ({ value: parseFloat(p.value.toFixed(1)) })),
    [cpu]
  )
  const ramData = useMemo(() =>
    ram.slice(-20).map(p => ({ value: parseFloat(p.value.toFixed(1)) })),
    [ram]
  )
  const diskData = useMemo(() =>
    disk.slice(-20).map(p => ({ value: parseFloat(p.value.toFixed(1)) })),
    [disk]
  )
  
  const currentCpu = cpu.length > 0 ? cpu[cpu.length - 1].value : null
  const currentRam = ram.length > 0 ? ram[ram.length - 1].value : null
  const currentDisk = disk.length > 0 ? disk[disk.length - 1].value : null

  if (cpuData.length === 0) return null

  return (
    <View style={{
      backgroundColor: colors.bg.card,
      borderRadius: 2,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderLeftWidth: 2.5,
      borderLeftColor: scoreColor,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      {/* header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 12,
        paddingBottom: 4,
      }}>
        <View>
          <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
            {name}
          </Text>
          <Text style={{ color: colors.text.hint, fontSize: 10, marginTop: 2 }}>
            {lastUpdate ?? 'just now'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: scoreColor, fontSize: 20, fontWeight: '500' }}>
            {healthScore}%
          </Text>
          <Text style={{ color: colors.text.hint, fontSize: 9 }}>health score</Text>
        </View>
      </View>

      {/* chart */}
      <View style={{ marginLeft: -10 }}>
        <LineChart
          data={cpuData}
          data2={ramData}
          data3={diskData}
          width={width}
          height={100}
          color="#FF4D4D"
          thickness={1.5}
          color2="#F5A623"
          thickness2={1.5}
          color3={colors.semantic.stable}
          thickness3={1.5}
          hideDataPoints
          hideDataPoints2
          hideDataPoints3
          hideRules={false}
          rulesColor={colors.bg.elevated}
          rulesThickness={0.5}
          xAxisColor="transparent"
          yAxisColor="transparent"
          hideYAxisText
          backgroundColor={colors.bg.card}
          noOfSections={4}
          maxValue={100}
          curved
          disableScroll
          scrollToEnd
          areaChart
          startFillColor="#FF4D4D"
          endFillColor="#FF4D4D"
          startOpacity={0.1}
          endOpacity={0}
        />
      </View>

      {/* metrics row */}
      <View style={{
        flexDirection: 'row',
        padding: 12,
        paddingTop: 8,
        gap: 20,
      }}>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>CPU</Text>
          <Text style={{
            fontSize: 14, fontWeight: '500',
            color: currentCpu && currentCpu > 80 ? colors.semantic.threat : colors.text.secondary,
          }}>
            {currentCpu ? `${currentCpu.toFixed(1)}%` : '—'}
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>RAM</Text>
          <Text style={{
            fontSize: 14, fontWeight: '500',
            color: currentRam && currentRam > 70 ? colors.semantic.warning : colors.text.secondary,
          }}>
            {currentRam ? `${currentRam.toFixed(1)}%` : '—'}
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.text.hint, fontSize: 9, marginBottom: 2 }}>Disk</Text>
          <Text style={{
            fontSize: 14, fontWeight: '500',
            color: colors.semantic.stable,
          }}>
            {currentDisk ? `${currentDisk.toFixed(1)}%` : '—'}
          </Text>
        </View>
      </View>
    </View>
  )
})