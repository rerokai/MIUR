import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Feather } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors } from '../constants/colours'
import { MainScreen } from '../screens/MainScreen'
import { MapScreen } from '../screens/MapScreen'
import { HistoryScreen } from '../screens/HistoryScreen'
import { AnalyticsScreen } from '../screens/AnalyticsScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { ServiceScreen } from '../screens/ServiceScreen'
import { OnboardingWelcomeScreen } from '../screens/OnboardingWelcomeScreen'
import { OnboardingRoleScreen } from '../screens/OnboardingRoleScreen'
import { OnboardingServerScreen } from '../screens/OnboardingServerScreen'

export type RootStackParamList = {
  OnboardingWelcome: undefined
  OnboardingRole: undefined
  OnboardingServer: undefined
  Tabs: undefined
  Service: { serverId: string; serverName: string; serverUrl: string }
}

export type TabParamList = {
  Settings: undefined
  Map: undefined
  Main: undefined
  Analytics: undefined
  History: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: colors.bg.card,
        borderTopColor: colors.border,
        borderTopWidth: 0.5,
        height: 70,
        paddingBottom: 5,
        paddingTop: 5,
      },
      tabBarIcon: ({ focused }) => {
        const iconColor = focused ? colors.accent : colors.text.hint
        const icons: Record<string, keyof typeof Feather.glyphMap> = {
          Settings: 'sliders',
          Map: 'grid',
          Main: 'activity',
          Analytics: 'bar-chart-2',
          History: 'clock',
        }
        return <Feather name={icons[route.name]} size={22} color={iconColor} />
      },
    })}
  >
    <Tab.Screen name="Settings" component={SettingsScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Main" component={MainScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
  </Tab.Navigator>
)

export const Navigation = () => {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then(val => {
      setIsOnboarded(val === 'true')
    })
  }, [])

  if (isOnboarded === null) return null

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={isOnboarded ? 'Tabs' : 'OnboardingWelcome'}
      >
        <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
        <Stack.Screen name="OnboardingRole" component={OnboardingRoleScreen} />
        <Stack.Screen name="OnboardingServer" component={OnboardingServerScreen} />
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Service" component={ServiceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}