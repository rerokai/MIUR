import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Group } from '../constants/types'

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([])

  
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('groups')
        if (stored) setGroups(JSON.parse(stored))
      } catch {}
    }
    load()
  }, [])

  const saveGroups = async (list: Group[]) => {
    setGroups(list)
    await AsyncStorage.setItem('groups', JSON.stringify(list))
  }

  const addGroup = (name: string) => {
    const group: Group = { id: Date.now().toString(), name, serverIds: [] }
    saveGroups([...groups, group])
  }

  const removeGroup = (id: string) => saveGroups(groups.filter(g => g.id !== id))

  const toggleServerInGroup = (groupId: string, serverId: string) => {
    saveGroups(groups.map(g => {
      if (g.id !== groupId) return g
      const has = g.serverIds.includes(serverId)
      return {
        ...g,
        serverIds: has
          ? g.serverIds.filter(id => id !== serverId)
          : [...g.serverIds, serverId],
      }
    }))
  }

const refresh = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('groups')
      setGroups(stored ? JSON.parse(stored) : [])
    } catch {}
  }, [])


  return { groups, addGroup, removeGroup, toggleServerInGroup, refresh }
}