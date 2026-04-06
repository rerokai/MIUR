import { colors } from '../constants/colours'
import React, { useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import Svg, { Polyline, Line, Circle } from 'react-native-svg'
import { MetricPoint } from '../constants/types'


interface ServerLine {
  name: string
  data: MetricPoint[]
  color: string
}

interface MultiServerChartProps {
  servers: ServerLine[]
  height?: number
}

const WIDTH = Dimensions.get('window').width - 28
const PADDING_LEFT = 8
const PADDING_RIGHT = 8
const PADDING_TOP = 10
const PADDING_BOTTOM = 20

export const SERVER_COLORS = [
  '#00F6FF',
  '#7B61FF',
  '#34C78A',
  '#F5A623',
  '#FF4D4D',
  '#FF79C6',
]

export const MultiServerChart = React.memo(({ servers, height = 160 }: MultiServerChartProps) => {
  const chartW = WIDTH - PADDING_LEFT - PADDING_RIGHT
  const chartH = height - PADDING_TOP - PADDING_BOTTOM

  const normalized = useMemo(() => {
    return servers.map((s, i) => ({
      ...s,
      color: SERVER_COLORS[i % SERVER_COLORS.length],
      sliced: s.data.slice(-20),
    }))
  }, [servers])

  const allValues = useMemo(() =>
    normalized.flatMap(s => s.sliced.map(p => p.value)),
    [normalized]
  )

  const minVal = useMemo(() =>
    allValues.length === 0 ? 0 : Math.max(0, Math.floor(Math.min(...allValues) - 5)),
    [allValues]
  )

  const maxVal = useMemo(() =>
    allValues.length === 0 ? 100 : Math.min(100, Math.ceil(Math.max(...allValues) + 5)),
    [allValues]
  )

  const toX = (i: number, total: number) =>
    PADDING_LEFT + (i / Math.max(total - 1, 1)) * chartW

  const toY = (v: number) =>
    PADDING_TOP + chartH - ((Math.min(Math.max(v, minVal), maxVal) - minVal) / Math.max(maxVal - minVal, 1)) * chartH

  if (servers.length === 0 || servers.every(s => s.data.length === 0)) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text.hint, fontSize: 12 }}>No data</Text>
      </View>
    )
  }

  return (
    <View>
      <Svg width={WIDTH} height={height}>
        {/* Grid lines */}
        {[minVal, Math.round((minVal + maxVal) / 2), maxVal].map(val => (
          <Line
            key={val}
            x1={PADDING_LEFT}
            y1={toY(val)}
            x2={WIDTH - PADDING_RIGHT}
            y2={toY(val)}
            stroke={colors.bg.elevated}
            strokeWidth={0.5}
          />
        ))}

        {/* Server lines */}
        {normalized.map(server => {
          if (server.sliced.length === 0) return null
          const points = server.sliced
            .map((p, i) => `${toX(i, server.sliced.length)},${toY(p.value)}`)
            .join(' ')
          const lastPoint = server.sliced[server.sliced.length - 1]
          const lastX = toX(server.sliced.length - 1, server.sliced.length)
          const lastY = toY(lastPoint.value)

          return (
            <React.Fragment key={server.name}>
              <Polyline
                points={points}
                fill="none"
                stroke={server.color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={lastX} cy={lastY} r={3} fill={server.color} />
            </React.Fragment>
          )
        })}
      </Svg>

      {/* Legend */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingHorizontal: 8,
        paddingBottom: 8,
      }}>
        {normalized.map(server => (
          <View key={server.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: server.color }} />
            <Text style={{ fontSize: 10, color: colors.text.hint }}>{server.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
})