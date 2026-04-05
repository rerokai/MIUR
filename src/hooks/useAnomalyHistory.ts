import { useState, useEffect, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Anomaly } from '../constants/types'
import { usePrometheus } from './usePrometheus'
import { calculateBaseline, detectAnomaly } from '../utils/analytics'
import { useServers } from './useServers'

export const useAnomalyHistory = () => {
  const [history, setHistory] = useState<Anomaly[]>([])
  const { servers } = useServers()
  const server = servers[0]
  const { cpu } = usePrometheus(server?.url, 1)
  const lastAnomalyType = useRef<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem('anomaly_history')
        if (stored) setHistory(JSON.parse(stored))
      } catch {}
    }
    load()
  }, [])

  useEffect(() => {
    if (cpu.length === 0) return

    const baseline = calculateBaseline(cpu)
    const anomalyType = detectAnomaly(cpu, baseline)
    const current = anomalyType ?? 'null'

    if (current !== lastAnomalyType.current) {
      lastAnomalyType.current = current

      if (anomalyType !== null) {
        const last = cpu[cpu.length - 1]
        const baselineVal = baseline[baseline.length - 1]?.value ?? 0
        const deviation = ((last.value - baselineVal) / baselineVal * 100).toFixed(0)

        const newAnomaly: Anomaly = {
          id: `${Date.now()}`,
          serverId: server?.id ?? '1',
          serverName: server?.name ?? 'prod-web-01',
          metric: 'CPU',
          level: anomalyType === 'spike' ? 'threat' : 'warning',
          description: `CPU spike +${deviation}% от baseline`,
          startedAt: Date.now(),
        }

        setHistory(prev => {
          const updated = [newAnomaly, ...prev].slice(0, 100)
          AsyncStorage.setItem('anomaly_history', JSON.stringify(updated))
          return updated
        })
      } else if (lastAnomalyType.current === null) {
        setHistory(prev => {
          const updated = prev.map((a, i) =>
            i === 0 && !a.resolvedAt ? { ...a, resolvedAt: Date.now() } : a
          )
          AsyncStorage.setItem('anomaly_history', JSON.stringify(updated))
          return updated
        })
      }
    }
  }, [cpu])

  return { history }
}