import React, { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../constants/colours'
import { RootStackParamList } from '../navigation'
import { checkConnection } from '../services/prometheus'
import { Server } from '../constants/types'

type Nav = NativeStackNavigationProp<RootStackParamList>

const INTERVALS = ['15s', '30s', '1m']
const PROFILES = ['Web', 'DB', 'Worker']

export const OnboardingServerScreen = () => {
  const navigation = useNavigation<Nav>()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [interval, setInterval] = useState('15s')
  const [profile, setProfile] = useState('Web')
  const [connStatus, setConnStatus] = useState<'idle' | 'checking' | 'ok' | 'err'>('idle')

  const handleCheck = async () => {
    if (!url) return
    setConnStatus('checking')
    const ok = await checkConnection(url)
    setConnStatus(ok ? 'ok' : 'err')
  }

const handleAdd = async () => {
    const server: Server = {
      id: Date.now().toString(),
      name: name || 'My server',
      url: url,
      interval: interval === '15s' ? 15 : interval === '30s' ? 30 : 60,
      profile: profile.toLowerCase() as any,
    }
    
    try {
      const stored = await AsyncStorage.getItem('servers')
      const existing = stored ? JSON.parse(stored) : []
      await AsyncStorage.setItem('servers', JSON.stringify([...existing, server]))
    } catch {
      await AsyncStorage.setItem('servers', JSON.stringify([server]))
    }
    
    await AsyncStorage.setItem('onboarded', 'true')
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarded', 'true')
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })
  }

  const connColor = connStatus === 'ok'
    ? colors.semantic.stable
    : connStatus === 'err'
    ? colors.semantic.threat
    : connStatus === 'checking'
    ? colors.semantic.warning
    : colors.text.hint

  const connText = connStatus === 'ok'
    ? 'Connected successfully'
    : connStatus === 'err'
    ? 'Failed to connect'
    : connStatus === 'checking'
    ? 'Checking...'
    : 'Connect pls'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 50 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ paddingTop: 80, marginBottom: 32 }}>
        <Text style={{ fontSize: 32, fontWeight: '500', color: colors.accent, marginBottom: 10 }}>
          Add your first server
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.hint }}>
          Enter your Prometheus endpoint
        </Text>
      </View>

      {/* Name */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, marginBottom: 8 }}>NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="prod-web-01"
        placeholderTextColor={colors.text.ghost}
        style={{
          backgroundColor: colors.bg.card,
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: colors.border,
          padding: 14,
          fontSize: 14,
          color: colors.text.primary,
          marginBottom: 16,
        }}
      />

      {/* URL */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, marginBottom: 8 }}>PROMETHEUS URL</Text>
      <TextInput
        value={url}
        onChangeText={(t) => { setUrl(t); setConnStatus('idle') }}
        placeholder="http://192.168.1.10:9090"
        placeholderTextColor={colors.text.ghost}
        autoCapitalize="none"
        keyboardType="url"
        style={{
          backgroundColor: colors.bg.card,
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: colors.border,
          padding: 14,
          fontSize: 14,
          color: colors.text.primary,
          marginBottom: 10,
        }}
      />

      {/* Connection status */}
      <TouchableOpacity
        onPress={handleCheck}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.bg.card,
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: colors.border,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <View style={{
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: connColor,
        }} />
        <Text style={{ fontSize: 12, color: connColor }}>{connText}</Text>
      </TouchableOpacity>

      {/* Polling interval */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, marginBottom: 8 }}>POLLING INTERVAL</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {INTERVALS.map(i => (
          <TouchableOpacity
            key={i}
            onPress={() => setInterval(i)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10,
              backgroundColor: interval === i ? `${colors.accent}18` : colors.bg.card,
              borderWidth: 0.5,
              borderColor: interval === i ? `${colors.accent}44` : colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '500',
              color: interval === i ? colors.accent : colors.text.hint,
            }}>
              {i}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Server type */}
      <Text style={{ fontSize: 9, color: colors.text.hint, letterSpacing: 1, marginBottom: 8 }}>SERVER TYPE</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 40 }}>
        {PROFILES.map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setProfile(p)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10,
              backgroundColor: profile === p ? `${colors.accent}18` : colors.bg.card,
              borderWidth: 0.5,
              borderColor: profile === p ? `${colors.accent}44` : colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '500',
              color: profile === p ? colors.accent : colors.text.hint,
            }}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Buttons */}
      <TouchableOpacity
        onPress={handleAdd}
        style={{
          backgroundColor: colors.accent,
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
          Add & continue
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} style={{ alignItems: 'center', padding: 12 }}>
        <Text style={{ fontSize: 14, color: colors.text.hint }}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}