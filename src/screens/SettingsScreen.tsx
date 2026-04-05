import React, { useState, useCallback } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Switch, TextInput, Alert } from 'react-native'
import { Feather } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../constants/colours'
import { useServers } from '../hooks/useServers'
import { checkConnection } from '../services/prometheus'
import { Server } from '../constants/types'
import { useGroups } from '../hooks/useGroups'

type UserRole = 'sre' | 'developer' | 'manager'
type ServerProfile = 'web' | 'db' | 'worker'

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'sre', label: 'SRE', desc: 'Все метрики, полная детализация' },
  { id: 'developer', label: 'Developer', desc: 'Метрики сервисов, базовая аналитика' },
  { id: 'manager', label: 'Manager', desc: 'Health score, дайджест, сводка' },
]

const PROFILES: { id: ServerProfile; label: string; desc: string; icon: string }[] = [
  { id: 'web', label: 'WEB', desc: 'CPU · Net · Conn', icon: 'globe' },
  { id: 'db', label: 'DB', desc: 'Disk · RAM · IOPS', icon: 'database' },
  { id: 'worker', label: 'WORKER', desc: 'CPU · Load · Proc', icon: 'settings' },
]

export const SettingsScreen = () => {
  const { servers, addServer, removeServer } = useServers()
  const { groups, addGroup, removeGroup, toggleServerInGroup } = useGroups()
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole>('sre')
  const [profile, setProfile] = useState<ServerProfile>('web')
  const [showBaseline, setShowBaseline] = useState(true)
  const [showDeviation, setShowDeviation] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [silentDegradation, setSilentDegradation] = useState(true)
  const [correlations, setCorrelations] = useState(true)
  const [threshold, setThreshold] = useState(2)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [connStatus, setConnStatus] = useState<'idle' | 'checking' | 'ok' | 'err'>('idle')

  const handleCheckConnection = useCallback(async () => {
    if (!newUrl) return
    setConnStatus('checking')
    const ok = await checkConnection(newUrl)
    setConnStatus(ok ? 'ok' : 'err')
  }, [newUrl])

  const handleAddServer = useCallback(async () => {
    if (!newName || !newUrl) return
    const server: Server = {
      id: Date.now().toString(),
      name: newName,
      url: newUrl,
      interval: 15,
      profile,
    }
    await addServer(server)
    setNewName('')
    setNewUrl('')
    setConnStatus('idle')
    setAdding(false)
  }, [newName, newUrl, profile, addServer])

  const handleRemove = useCallback((id: string) => {
    Alert.alert('Remove server', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeServer(id) },
    ])
  }, [removeServer])

  const connColor = connStatus === 'ok'
    ? colors.semantic.stable
    : connStatus === 'err'
    ? colors.semantic.threat
    : connStatus === 'checking'
    ? colors.semantic.warning
    : colors.text.hint

  const connText = connStatus === 'ok'
    ? 'Connected'
    : connStatus === 'err'
    ? 'Failed to connect'
    : connStatus === 'checking'
    ? 'Checking...'
    : 'Tap to check'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text.primary }}>Settings</Text>
      </View>

      {/* SERVERS */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>SERVERS</Text>
      <View style={{
        backgroundColor: colors.bg.card, marginHorizontal: 16,
        borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
        marginBottom: 16, overflow: 'hidden',
      }}>
        {servers.map(server => (
          <View key={server.id} style={{
            flexDirection: 'row', alignItems: 'center',
            padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border,
          }}>
            <View style={{
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: colors.semantic.stable, marginRight: 10, flexShrink: 0,
            }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>
                {server.name}
              </Text>
              <Text style={{ fontSize: 10, color: colors.text.hint }}>{server.url}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(server.id)} style={{ padding: 4 }}>
              <Feather name="x" size={14} color={colors.text.ghost} />
            </TouchableOpacity>
          </View>
        ))}

        {adding && (
          <View style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Server name"
              placeholderTextColor={colors.text.hint}
              style={{
                backgroundColor: colors.bg.elevated,
                borderRadius: 8, padding: 10,
                fontSize: 13, color: colors.text.primary,
                marginBottom: 8,
              }}
            />
            <TextInput
              value={newUrl}
              onChangeText={setNewUrl}
              placeholder="http://192.168.1.10:9090"
              placeholderTextColor={colors.text.hint}
              autoCapitalize="none"
              style={{
                backgroundColor: colors.bg.elevated,
                borderRadius: 8, padding: 10,
                fontSize: 13, color: colors.text.primary,
                marginBottom: 8,
              }}
            />
            <TouchableOpacity onPress={handleCheckConnection} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, color: connColor }}>{connText}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleAddServer}
                style={{
                  flex: 1, backgroundColor: colors.accent,
                  borderRadius: 8, padding: 10, alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#000' }}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setAdding(false); setConnStatus('idle') }}
                style={{
                  flex: 1, backgroundColor: colors.bg.elevated,
                  borderRadius: 8, padding: 10, alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, color: colors.text.hint }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setAdding(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}
        >
          <Feather name="plus" size={13} color={colors.accent} />
          <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '500' }}>ADD SERVER</Text>
        </TouchableOpacity>
      </View>
      {/* GROUPS */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>GROUPS</Text>
      <View style={{
        backgroundColor: colors.bg.card, marginHorizontal: 16,
        borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
        marginBottom: 16, overflow: 'hidden',
      }}>
        {groups.map(group => (
          <View key={group.id}>
            <TouchableOpacity
              onPress={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              style={{
                flexDirection: 'row', alignItems: 'center',
                padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>
                  {group.name}
                </Text>
                <Text style={{ fontSize: 10, color: colors.text.hint, marginTop: 2 }}>
                  {group.serverIds.length} servers
                </Text>
              </View>
              <Feather
                name={expandedGroup === group.id ? 'chevron-up' : 'chevron-down'}
                size={14} color={colors.text.hint}
              />
              <TouchableOpacity onPress={() => removeGroup(group.id)} style={{ padding: 4, marginLeft: 8 }}>
                <Feather name="x" size={14} color={colors.text.ghost} />
              </TouchableOpacity>
            </TouchableOpacity>

            {expandedGroup === group.id && (
              <View style={{ paddingVertical: 6 }}>
                {servers.map(server => {
                  const inGroup = group.serverIds.includes(server.id)
                  return (
                    <TouchableOpacity
                      key={server.id}
                      onPress={() => toggleServerInGroup(group.id, server.id)}
                      style={{
                        flexDirection: 'row', alignItems: 'center',
                        paddingHorizontal: 14, paddingVertical: 10,
                        borderBottomWidth: 0.5, borderBottomColor: colors.border,
                      }}
                    >
                      <View style={{
                        width: 18, height: 18, borderRadius: 9,
                        borderWidth: 1.5,
                        borderColor: inGroup ? colors.accent : colors.text.ghost,
                        alignItems: 'center', justifyContent: 'center',
                        marginRight: 10,
                      }}>
                        {inGroup && (
                          <View style={{
                            width: 9, height: 9, borderRadius: 5,
                            backgroundColor: colors.accent,
                          }} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.text.secondary }}>
                          {server.name}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.text.hint }}>{server.url}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        ))}

        {addingGroup && (
          <View style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Group name (e.g. PROD)"
              placeholderTextColor={colors.text.hint}
              style={{
                backgroundColor: colors.bg.elevated,
                borderRadius: 8, padding: 10,
                fontSize: 13, color: colors.text.primary,
                marginBottom: 8,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  if (newGroupName.trim()) {
                    addGroup(newGroupName.trim().toUpperCase())
                    setNewGroupName('')
                    setAddingGroup(false)
                  }
                }}
                style={{
                  flex: 1, backgroundColor: colors.accent,
                  borderRadius: 8, padding: 10, alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#000' }}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setAddingGroup(false); setNewGroupName('') }}
                style={{
                  flex: 1, backgroundColor: colors.bg.elevated,
                  borderRadius: 8, padding: 10, alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, color: colors.text.hint }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setAddingGroup(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 }}
        >
          <Feather name="plus" size={13} color={colors.accent} />
          <Text style={{ fontSize: 13, color: colors.accent, fontWeight: '500' }}>CREATE GROUP</Text>
        </TouchableOpacity>
      </View>

      {/* ROLE */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>ROLE</Text>
      <View style={{
        backgroundColor: colors.bg.card, marginHorizontal: 16,
        borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
        marginBottom: 16, overflow: 'hidden',
      }}>
        <View style={{ flexDirection: 'row', padding: 4, gap: 2 }}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r.id}
              onPress={() => setRole(r.id)}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 6,
                backgroundColor: role === r.id ? colors.bg.elevated : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 12, fontWeight: '500',
                color: role === r.id ? colors.accent : colors.text.hint,
              }}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ padding: 12, borderTopWidth: 0.5, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 13, color: colors.text.secondary }}>
            {ROLES.find(r => r.id === role)?.desc}
          </Text>
        </View>
      </View>

      {/* SERVER PROFILES */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>SERVER PROFILES</Text>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 }}>
        {PROFILES.map(p => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setProfile(p.id)}
            style={{
              flex: 1,
              backgroundColor: profile === p.id ? `${colors.accent}0F` : colors.bg.card,
              borderRadius: 2, borderWidth: 0.5,
              borderColor: profile === p.id ? `${colors.accent}44` : colors.border,
              padding: 12, alignItems: 'center',
            }}
          >
            <Feather
              name={p.icon as any}
              size={20}
              color={profile === p.id ? colors.accent : colors.text.hint}
              style={{ marginBottom: 6 }}
            />
            <Text style={{
              fontSize: 11, fontWeight: '500',
              color: profile === p.id ? colors.accent : colors.text.hint,
              marginBottom: 4,
            }}>
              {p.label}
            </Text>
            <Text style={{ fontSize: 9, color: colors.text.ghost, textAlign: 'center' }}>
              {p.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ANALYTICS */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>ANALYTICS</Text>
      <View style={{
        backgroundColor: colors.bg.card, marginHorizontal: 16,
        borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
        marginBottom: 16, overflow: 'hidden',
      }}>
        {/* Threshold slider */}
        <View style={{ padding: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>Anomaly threshold</Text>
            <Text style={{ fontSize: 13, color: colors.accent }}>{threshold}σ</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3].map(v => (
              <TouchableOpacity
                key={v}
                onPress={() => setThreshold(v)}
                style={{
                  flex: 1, paddingVertical: 6, borderRadius: 6,
                  backgroundColor: threshold === v ? `${colors.accent}18` : colors.bg.elevated,
                  borderWidth: 0.5,
                  borderColor: threshold === v ? `${colors.accent}44` : colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '500',
                  color: threshold === v ? colors.accent : colors.text.hint,
                }}>
                  {v}σ
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 9, color: colors.text.ghost }}>1σ — чувствительно</Text>
            <Text style={{ fontSize: 9, color: colors.text.ghost }}>3σ — строго</Text>
          </View>
        </View>

        {[
          { label: 'Anomaly threshold', desc: 'Отслеживать медленный рост', value: silentDegradation, set: setSilentDegradation },
          { label: 'Корреляция', desc: 'Искать синхронные аномалии', value: correlations, set: setCorrelations },
        ].map(item => (
          <View key={item.label} style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            padding: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border,
          }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>{item.label}</Text>
              <Text style={{ fontSize: 11, color: colors.text.hint, marginTop: 2 }}>{item.desc}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.set}
              trackColor={{ false: colors.bg.elevated, true: `${colors.accent}22` }}
              thumbColor={item.value ? `${colors.accent}99` : colors.text.ghost}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        ))}
      </View>

      {/* VISUALIZATION */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>VISUALIZATION</Text>
      <View style={{
        backgroundColor: colors.bg.card, marginHorizontal: 16,
        borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
        marginBottom: 16, overflow: 'hidden',
      }}>
        {[
          { label: 'Показывать baseline', desc: 'Пунктир на графиках метрик', value: showBaseline, set: setShowBaseline },
          { label: 'Зона отклонения', desc: 'Заливка между линией и baseline', value: showDeviation, set: setShowDeviation },
        ].map(item => (
          <View key={item.label} style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            padding: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border,
          }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>{item.label}</Text>
              <Text style={{ fontSize: 11, color: colors.text.hint, marginTop: 2 }}>{item.desc}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.set}
              trackColor={{ false: colors.bg.elevated, true: `${colors.accent}22` }}
              thumbColor={item.value ? `${colors.accent}99` : colors.text.ghost}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        ))}
      </View>

      {/* NOTIFICATIONS */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8 }}>NOTIFICATIONS</Text>
      <View style={{
        backgroundColor: colors.bg.card, marginHorizontal: 16,
        borderRadius: 2, borderWidth: 0.5, borderColor: colors.border,
        marginBottom: 16, overflow: 'hidden',
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          padding: 14, borderBottomWidth: 0.5, borderBottomColor: colors.border,
        }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>Push-уведомления</Text>
            <Text style={{ fontSize: 11, color: colors.text.hint, marginTop: 2 }}>При критических аномалиях</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: colors.bg.elevated, true: `${colors.accent}22` }}
            thumbColor={colors.text.secondary}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          padding: 14,
        }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text.secondary }}>Порог срабатывания</Text>
            <Text style={{ fontSize: 11, color: colors.text.hint, marginTop: 2 }}>Минимальный уровень для уведомления</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, color: colors.text.hint }}>Threat only</Text>
            <Feather name="chevron-right" size={14} color={colors.text.ghost} />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}