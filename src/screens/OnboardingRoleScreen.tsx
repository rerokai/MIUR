import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../constants/colours'
import { RootStackParamList } from '../navigation'

type Nav = NativeStackNavigationProp<RootStackParamList>

const ROLES = [
  { id: 'sre', label: 'SRE', desc: 'All metrics, full detail, anomalies and correlations' },
  { id: 'developer', label: 'DEVELOPER', desc: 'Service metrics, charts, basic analytics' },
  { id: 'manager', label: 'MANAGER', desc: 'Health scores, digest, group summary' },
]

export const OnboardingRoleScreen = () => {
  const navigation = useNavigation<Nav>()
  const [selected, setSelected] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selected) return
    await AsyncStorage.setItem('role', selected)
    navigation.navigate('OnboardingServer')
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary, paddingHorizontal: 24 }}>
      <View style={{ paddingTop: 80, marginBottom: 40 }}>
        <Text style={{ fontSize: 32, fontWeight: '500', color: colors.text.primary, marginBottom: 10 }}>
          Who are you?
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.hint, lineHeight: 20 }}>
          This affects the level of detail and which data is shown first
        </Text>
      </View>

      <View style={{ gap: 10, flex: 1 }}>
        {ROLES.map(role => (
          <TouchableOpacity
            key={role.id}
            onPress={() => setSelected(role.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selected === role.id ? colors.accent : colors.border,
              backgroundColor: selected === role.id ? `${colors.accent}08` : colors.bg.card,
            }}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: selected === role.id ? colors.accent : colors.text.hint,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {selected === role.id && (
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.accent,
                }} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: selected === role.id ? colors.accent : colors.text.secondary,
                marginBottom: 4,
              }}>
                {role.label}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text.hint, lineHeight: 16 }}>
                {role.desc}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ paddingBottom: 50 }}>
        <Text style={{ fontSize: 10, color: colors.text.ghost, textAlign: 'center', marginBottom: 16 }}>
          You can change this later in Settings
        </Text>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selected}
          style={{
            backgroundColor: selected ? colors.accent : colors.bg.elevated,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{
            fontSize: 15,
            fontWeight: '500',
            color: selected ? '#000' : colors.text.hint,
          }}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}