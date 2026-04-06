import { colors } from '../constants/colours'
import React, { useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { MetricPoint } from '../constants/types'


interface MetricChartProps {
  data: MetricPoint[]
  data2?: MetricPoint[]
  height?: number
}

export const MetricChart = React.memo(({ data, height = 180, data2 }: MetricChartProps) => {
  const width = Dimensions.get('window').width - 36
  const sliced = useMemo(() => {
    if (data.length <= 7) return data
    const step = Math.floor(data.length / 7)
    return Array.from({ length: 7 }, (_, i) => data[i * step])
  }, [data])

  const chartData = useMemo(() =>
    sliced.map(point => ({
      value: parseFloat(point.value.toFixed(1)),
    })),
    [sliced]
  )

  const maxVal = useMemo(() => {
    if (chartData.length === 0) return 100
    const max = Math.max(...chartData.map(d => d.value))
    return Math.ceil((max * 1.3) / 10) * 10
  }, [chartData])

  const timeLabels = sliced.map((point, i) => {
    const diffSec = Math.round((Date.now() - point.timestamp) / 1000)
    if (i === sliced.length - 1) return 'now'
    if (diffSec < 60) return `${diffSec}s`
    if (diffSec < 3600) return `${Math.round(diffSec / 60)}m`
    return `${Math.round(diffSec / 3600)}h`
  })

  const pointWidth = (width - 30) / sliced.length

  if (data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text.hint, fontSize: 12 }}>No data</Text>
      </View>
    )
  }

  return (
    <View style={{ marginLeft: 0, marginBottom:10, marginTop:10 }}>
      <LineChart
        data={chartData}
        width={width}
        height={height}
        color="#7B61FF"
        thickness={2}
        areaChart2
        startFillColor2={colors.bg.elevated}
        endFillColor2={colors.bg.elevated}
        areaChart
        startFillColor="#7B61FF"
        endFillColor="#7B61FF"
        startOpacity={0.2}
        endOpacity={0}
        
        dataPointsColor="#7B61FF"
        dataPointsRadius={3}
        
        hideDataPoints3
        hideRules={false}
        rulesColor={colors.bg.elevated}
        rulesThickness={0.5}
        xAxisColor={colors.border}
        yAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.text.hint, fontSize: 9 }}
        formatYLabel={(val) => Math.round(Number(val)).toString()}
        backgroundColor={colors.bg.card}
        maxValue={maxVal}
        noOfSections={4}
        data2={data2 ? data2.slice(-7).map(p => ({ value: parseFloat(p.value.toFixed(1)) })) : undefined}
        color2={colors.semantic.warning}
        thickness2={1.5}
        hideDataPoints2
        curved
        disableScroll
        xAxisLabelsHeight={0}
      />
      <View style={{
        flexDirection: 'row',
        paddingLeft: 30,
        marginTop: 4,
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