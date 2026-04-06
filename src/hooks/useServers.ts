import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Server } from '../constants/types'
import { config } from '../constants/config'

const DEFAULT_SERVERS: Server[] = [
  {
    id: '1',
    name: 'prod-web-01',
    url: config.prometheusUrl,
    interval: 15,
    profile: 'web',
  },
]

export const useServers = () => {
  const [servers, setServers] = useState<Server[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('servers')
        if (stored) setServers(JSON.parse(stored))
        else setServers(DEFAULT_SERVERS)
      } catch {
        setServers(DEFAULT_SERVERS)
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [])

  const saveServers = async (list: Server[]) => {
    setServers(list)
    await AsyncStorage.setItem('servers', JSON.stringify(list))
  }

  const refresh = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('servers')
      if (stored) setServers(JSON.parse(stored))
    } catch {}
  }, [])

  const addServer = (server: Server) => saveServers([...servers, server])
  const removeServer = (id: string) => saveServers(servers.filter(s => s.id !== id))

  return { servers, addServer, removeServer, refresh, loaded }
}

