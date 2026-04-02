import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors } from '../constants/colours'

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, backgroundColor: colors.bg.primary, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: colors.text.primary, fontSize: 18 }}>{name}</Text>
  </View>
)

const MainScreen = () => <PlaceholderScreen name="Overview" />
const MapScreen = () => <PlaceholderScreen name="Map" />
const HistoryScreen = () => <PlaceholderScreen name="History" />
const AnalyticsScreen = () => <PlaceholderScreen name="Analytics" />
const SettingsScreen = () => <PlaceholderScreen name="Settings" />

const Tab = createBottomTabNavigator()

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.bg.card,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
            height: 80,
            paddingBottom: 5,
            paddingTop: 10
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

            return (
              <Feather
                name={icons[route.name]}
                size={22}
                color={iconColor}
              />
            )
          },
        })}
      >
        <Tab.Screen name="Settings" component={SettingsScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Main" component={MainScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}