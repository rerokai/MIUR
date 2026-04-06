import { colors } from '../constants/colours'
import React, { useState, useMemo } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Share } from 'react-native'
import { Feather } from '@expo/vector-icons'

import { useServers } from '../hooks/useServers'
import { useGroups } from '../hooks/useGroups'
import { useAllServersHealth } from '../hooks/useAllServersHealth'
import { predictTimeToThreshold } from '../utils/analytics'

const getScoreColor = (score: number) => {
  if (score < 50) return colors.semantic.threat
  if (score < 75) return colors.semantic.warning
  return colors.semantic.stable
}

const getScoreLabel = (score: number) => {
  if (score < 50) return 'критично'
  if (score < 75) return 'деградация'
  return 'стабильно'
}

export const AnalyticsScreen = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'modelling'>('summary')
  const { servers } = useServers()
  const { groups } = useGroups()
  const allHealth = useAllServersHealth(servers)

  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // Digest на русском
  const digest = useMemo(() => {
    const critical = allHealth.filter(h => h.healthScore < 50)
    const degrading = allHealth.filter(h => h.healthScore >= 50 && h.healthScore < 75)
    const stable = allHealth.filter(h => h.healthScore >= 75)
    const parts: string[] = []

    if (critical.length > 0)
      parts.push(`${critical.map(h => h.server.name).join(', ')} в критическом состоянии — требуется немедленное вмешательство.`)
    if (degrading.length > 0)
      parts.push(`${degrading.map(h => h.server.name).join(', ')} деградируют.`)
    if (stable.length > 0 && (critical.length > 0 || degrading.length > 0))
      parts.push(`${stable.map(h => h.server.name).join(', ')} стабильны.`)
    if (parts.length === 0)
      return 'Все системы работают в штатном режиме.'

    return parts.join(' ')
  }, [allHealth])

  // Группы с реальными score
  const groupsWithScore = useMemo(() => {
    if (groups.length === 0) {
      return allHealth.map(h => ({
        name: h.server.name,
        score: h.healthScore,
      }))
    }
    return groups.map(group => {
      const groupHealth = allHealth.filter(h => group.serverIds.includes(h.server.id))
      const avg = groupHealth.length > 0
        ? Math.round(groupHealth.reduce((s, h) => s + h.healthScore, 0) / groupHealth.length)
        : 0
      return { name: group.name, score: avg }
    })
  }, [groups, allHealth])

  // Тихая деградация
  const degradingServers = useMemo(() =>
    allHealth.filter(h => h.anomalyType === 'degradation'),
    [allHealth]
  )

  

  // Сценарии — предсказание времени до порога
  const scenarios = useMemo(() =>
    allHealth
      .filter(h => h.cpu.length > 0)
      .map(h => {
        const time = predictTimeToThreshold(h.cpu, 90)
        return { name: h.server.name, time }
      })
      .filter(s => s.time !== null),
    [allHealth]
  )

  // SVG для скачивания
  const handleDownloadSVG = async () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
      <rect width="400" height="200" fill="#0D0D0F"/>
      <text x="20" y="40" fill="#fff" font-size="16" font-family="sans-serif">MIUR Digest — ${timeStr}</text>
      <text x="20" y="70" fill="#ccc" font-size="12" font-family="sans-serif" width="360">${digest}</text>
      ${groupsWithScore.map((g, i) => `
        <text x="20" y="${110 + i * 24}" fill="${getScoreColor(g.score)}" font-size="13" font-family="sans-serif">${g.name}: ${g.score}%</text>
      `).join('')}
    </svg>`

    try {
      await Share.share({
        message: svgContent,
        title: 'MIUR Digest',
      })
    } catch (e) {
      console.error(e)
    }
  }

  const overallAnomaly = allHealth.some(h => h.anomalyType !== null)
  const overallScore = allHealth.length > 0
    ? Math.round(allHealth.reduce((s, h) => s + h.healthScore, 0) / allHealth.length)
    : 0

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
        <Text style={{ fontSize: 11, color: colors.text.hint }}>обновлено {timeStr}</Text>
      </View>

      {/* Digest */}
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
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1 }}>ДАЙДЖЕСТ</Text>
          <Text style={{ fontSize: 11, color: colors.text.hint }}>{timeStr}</Text>
        </View>
        <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 20, marginBottom: 12 }}>
          {digest}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: getScoreColor(overallScore),
            }} />
            <Text style={{ fontSize: 11, color: colors.text.hint }}>
              {overallAnomaly ? 'обнаружены аномалии' : 'все системы стабильны'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDownloadSVG}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              borderWidth: 0.5, borderColor: colors.border, borderRadius: 6,
              paddingHorizontal: 8, paddingVertical: 4,
            }}
          >
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
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>
            ГРУППЫ
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {groupsWithScore.map(g => (
              <View key={g.name} style={{
                minWidth: '30%', flex: 1,
                backgroundColor: colors.bg.card, borderRadius: 2,
                borderWidth: 0.5, borderColor: colors.border, padding: 10,
              }}>
                <Text style={{ fontSize: 9, color: colors.text.hint, marginBottom: 4 }}>{g.name}</Text>
                <Text style={{ fontSize: 22, fontWeight: '500', color: getScoreColor(g.score) }}>
                  {g.score}%
                </Text>
                <Text style={{ fontSize: 9, color: colors.text.hint, marginTop: 2 }}>
                  {getScoreLabel(g.score)}
                </Text>
              </View>
            ))}
          </View>

          {/* Тихая деградация */}
          {degradingServers.length > 0 && (
            <>
              <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>
                ТИХАЯ ДЕГРАДАЦИЯ
              </Text>
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                {degradingServers.map(h => {
                  const baseline = h.cpu.length > 0
                    ? h.cpu.reduce((s, p) => s + p.value, 0) / h.cpu.length
                    : 0
                  const current = h.cpu.length > 0 ? h.cpu[h.cpu.length - 1].value : 0
                  const dev = baseline > 0 ? ((current - baseline) / baseline * 100).toFixed(0) : '0'
                  return (
                    <View key={h.server.id} style={{
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border,
                    }}>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>
                          {h.server.name} · CPU
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.text.hint, marginTop: 2 }}>
                          выше baseline последние 5 точек
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.semantic.warning }}>
                        +{dev}%
                      </Text>
                    </View>
                  )
                })}
              </View>
            </>
          )}

          {/* Корреляции — пока заглушка */}
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>
            КОРРЕЛЯЦИИ
          </Text>
          <View style={{
            backgroundColor: colors.bg.card, marginHorizontal: 16,
            borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
            padding: 12, marginBottom: 16,
          }}>
            {allHealth.filter(h => h.anomalyType !== null).length >= 2 ? (
              <>
                <Text style={{ fontSize: 10, color: colors.text.hint, marginBottom: 6 }}>
                  {timeStr} — одновременные аномалии
                </Text>
                <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 10 }}>
                  {allHealth.filter(h => h.anomalyType !== null).length} сервера изменили поведение одновременно
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {allHealth.filter(h => h.anomalyType !== null).map(h => (
                    <View key={h.server.id} style={{
                      backgroundColor: colors.bg.elevated, borderRadius: 4,
                      paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                      <Text style={{ fontSize: 10, color: colors.text.muted }}>CPU {h.server.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={{ fontSize: 13, color: colors.text.hint }}>
                Синхронных аномалий не обнаружено
              </Text>
            )}
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
            {scenarios.length === 0 ? (
              <Text style={{ fontSize: 13, color: colors.text.hint, paddingVertical: 12 }}>
                Тревожных трендов не обнаружено
              </Text>
            ) : (
              scenarios.map((s, i) => (
                <View key={i} style={{
                  flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                  paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border,
                }}>
                  <View style={{
                    width: 16, height: 16, borderRadius: 8,
                    borderWidth: 1.5, borderColor: colors.semantic.warning,
                    marginTop: 2, flexShrink: 0,
                  }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: colors.text.hint, marginBottom: 4 }}>
                      {s.name} · CPU
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 6 }}>
                      Достигнет порога 90% при текущем темпе роста
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.semantic.warning }}>
                        ~{s.time} мин
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.text.hint }}>· линейный тренд</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Паттерны — заглушка */}
          <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>
            ПАТТЕРНЫ — повторяемость
          </Text>
          <View style={{
            backgroundColor: colors.bg.card, marginHorizontal: 16,
            borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
            padding: 12,
          }}>
            <Text style={{ fontSize: 13, color: colors.text.hint }}>
              Недостаточно данных для анализа паттернов — нужна история за 7+ дней
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  )
}