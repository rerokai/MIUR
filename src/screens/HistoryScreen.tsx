import React from 'react'
import { View, Text } from 'react-native'
import { colors } from '../constants/colours'

export const HistoryScreen = () => (
  <View style={{ flex: 1, backgroundColor: colors.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: colors.text.primary, fontSize: 18 }}>History</Text>
  </View>
)