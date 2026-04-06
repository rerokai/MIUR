import { colors } from '../constants/colours'
import React, { useState, useMemo } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'

import { useAnomalyHistory } from '../hooks/useAnomalyHistory'
import { Anomaly } from '../constants/types'

const FILTERS = ['Date', 'Server', 'Event']

const getLevelColor = (level: string, colors: any) => {
  if (level === 'threat') return colors.semantic.threat
  if (level === 'warning') return colors.semantic.warning
  return colors.semantic.stable
}

const getLevelLabel = (anomaly: Anomaly) => {
  if (anomaly.resolvedAt) return 'Resolved'
  if (anomaly.level === 'threat') return 'Threat'
  return 'Warning'
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const formatDate = (ts: number) => {
  const d = new Date(ts)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

export const HistoryScreen = () => {


  const [activeFilter, setActiveFilter] = useState('Date')
  const { history } = useAnomalyHistory()

  const sorted = useMemo(() => {
    const copy = [...history]
    if (activeFilter === 'Date') {
      return copy.sort((a, b) => b.startedAt - a.startedAt)
    }
    if (activeFilter === 'Server') {
      return copy.sort((a, b) => a.serverName.localeCompare(b.serverName))
    }
    if (activeFilter === 'Event') {
      const order = { threat: 0, warning: 1, resolved: 2 }
      return copy.sort((a, b) => {
        const aLevel = a.resolvedAt ? 'resolved' : a.level
        const bLevel = b.resolvedAt ? 'resolved' : b.level
        return (order[aLevel as keyof typeof order] ?? 3) - (order[bLevel as keyof typeof order] ?? 3)
      })
    }
    return copy
  }, [history, activeFilter])

  const grouped = useMemo(() => {
    if (activeFilter === 'Server') {
      const groups: Record<string, Anomaly[]> = {}
      sorted.forEach(a => {
        if (!groups[a.serverName]) groups[a.serverName] = []
        groups[a.serverName].push(a)
      })
      return groups
    }
    if (activeFilter === 'Event') {
      const groups: Record<string, Anomaly[]> = {
        'Threat': sorted.filter(a => !a.resolvedAt && a.level === 'threat'),
        'Warning': sorted.filter(a => !a.resolvedAt && a.level === 'warning'),
        'Resolved': sorted.filter(a => !!a.resolvedAt),
      }
      return Object.fromEntries(Object.entries(groups).filter(([_, v]) => v.length > 0))
    }
    // Date — группируем по дате
    const groups: Record<string, Anomaly[]> = {}
    sorted.forEach(a => {
      const key = formatDate(a.startedAt)
      if (!groups[key]) groups[key] = []
      groups[key].push(a)
    })
    return groups
  }, [sorted, activeFilter])

  const getGap = (current: Anomaly, next?: Anomaly) => {
    if (!next || activeFilter !== 'Date') return 16
    const diffMin = Math.abs(current.startedAt - next.startedAt) / 60000
    return Math.min(Math.max(diffMin * 2, 8), 60)
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
      }}>
        {FILTERS.map((f, i) => (
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
            {i < FILTERS.length - 1 && (
              <Text style={{ color: colors.text.hint, fontSize: 15 }}>/</Text>
            )}
          </React.Fragment>
        ))}
      </View>

      {history.length === 0 && (
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <Text style={{ color: colors.text.hint, fontSize: 14 }}>No events yet</Text>
          <Text style={{ color: colors.text.ghost, fontSize: 12, marginTop: 6 }}>
            Anomalies will appear here automatically
          </Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 16 }}>
        {Object.entries(grouped).map(([groupKey, events]) => (
          <View key={groupKey}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginVertical: 12,
            }}>
              <View style={{ flex: 1, height: 0.5, backgroundColor: colors.border }} />
              <Text style={{ fontSize: 11, color: colors.text.hint }}>{groupKey}</Text>
              <View style={{ flex: 1, height: 0.5, backgroundColor: colors.border }} />
            </View>

            {events.map((event, i) => {
              const levelColor = event.resolvedAt
                ? colors.semantic.stable
                : getLevelColor(event.level, colors)
              const gap = getGap(event, events[i + 1])

              return (
                <View key={event.id} style={{ flexDirection: 'row', gap: 14 }}>
                  <View style={{ width: 36, alignItems: 'flex-end', paddingTop: 2 }}>
                    <Text style={{ fontSize: 12, color: colors.text.hint }}>
                      {formatTime(event.startedAt)}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'center', width: 16 }}>
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: levelColor, marginTop: 4,
                    }} />
                    {i < events.length - 1 && (
                      <View style={{
                        width: 1, height: gap,
                        backgroundColor: colors.border, marginTop: 4,
                      }} />
                    )}
                  </View>

                  <View style={{ flex: 1, paddingBottom: gap }}>
                    <Text style={{ fontSize: 10, color: colors.text.hint, marginBottom: 3 }}>
                      {event.serverName} · {event.metric}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text.secondary, marginBottom: 3 }}>
                      {event.description}
                    </Text>
                    <Text style={{ fontSize: 12, color: levelColor }}>
                      {getLevelLabel(event)}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}