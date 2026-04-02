import React, { useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { MetricPoint } from '../constants/types'
import { calculateBaseline } from '../utils/analytics'
import { colors } from '../constants/colours'

interface MetricChartProps {
  data: MetricPoint[]
  height?: number
}

export const MetricChart = React.memo(({ data, height = 180 }: MetricChartProps) => {
  const width = Dimensions.get('window').width - 36

  const sliced = useMemo(() => data.slice(-7), [data])
  const baseline = useMemo(() => calculateBaseline(data), [data])

    const baselineAvg = useMemo(() => {
    if (baseline.length === 0) return 0
    const last = baseline.slice(-7)
    return last.reduce((sum, p) => sum + p.value, 0) / last.length
  }, [baseline])

const chartData = useMemo(() =>
    sliced.map(point => ({
      value: parseFloat((point.value - baselineAvg + 10).toFixed(1)),
    })),
    [sliced, baselineAvg]
  )

  const baselineData = useMemo(() =>
    sliced.map(() => ({ value: 10 })),
    [sliced]
  )

const maxVal = useMemo(() => {
    if (chartData.length === 0) return 10
    const maxChart = Math.max(...chartData.map(d => d.value))
    const maxBase = Math.max(...baselineData.map(d => d.value))
    const max = Math.max(maxChart, maxBase)
    const min = Math.min(...chartData.map(d => d.value), ...baselineData.map(d => d.value))
    return Math.ceil((max + (max - min) * 0.5) / 5) * 5
  }, [chartData, baselineData])

  const timeLabels = sliced.map((point, i) => {
    const diffSec = Math.round((Date.now() - point.timestamp) / 1000)
    if (i === sliced.length - 1) return 'now'
    if (diffSec < 60) return `${diffSec}s`
    return `${Math.round(diffSec / 60)}m`
  })

  const pointWidth = (width - 30) / sliced.length

  if (data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text.hint, fontSize: 12 }}>No data</Text>
      </View>
    )
  }
  
  const testChart = [
    {value: 8}, {value: 7}, {value: 9}, {value: 6}, {value: 8}, {value: 7}, {value: 9}
  ]
  const testBaseline = [
    {value: 3}, {value: 3}, {value: 3}, {value: 3}, {value: 3}, {value: 3}, {value: 3}
  ]




  return (
    <View style={{ marginLeft: -6, marginRight: -16 }}>
      <LineChart
        data={chartData}
        data2={baselineData}
        width={width + 62}
        height={height}
        
        
        areaChart
        startFillColor="#7B61FF"
        endFillColor="#7B61FF"
        startOpacity={0.1}
        endOpacity={0}
        
        color="#7B61FF"
        thickness={2}
        color2={colors.accent}
        thickness2={0.8}

        dataPointsColor="#7B61FF"
        dataPointsRadius={2}
        hideDataPoints2
        hideRules={false}
        rulesColor={colors.bg.elevated}
        rulesThickness={0.5}
        xAxisColor={colors.border}
        yAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.text.hint, fontSize: 9 }}
        formatYLabel={(val) => Math.round(Number(val)).toString()}
        backgroundColor={colors.bg.card}
        maxValue={20}
        noOfSections={4}
        stepValue={5}
        
        curved
        
        disableScroll
      />
      <View style={{
        flexDirection: 'row',
        paddingLeft: 40,
        paddingRight: 0,
        marginTop: 0,
      }}>
        {timeLabels.map((label, i) => (
          <Text
            key={i}
            style={{
              width: pointWidth,
              color: colors.text.hint,
              fontSize: 7,
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  )
})