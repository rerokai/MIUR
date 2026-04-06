import { useState, useEffect, useRef } from 'react'
import { Server } from '../constants/types'
import { queryRange, queries } from '../services/prometheus'
import { calculateBaseline, detectAnomaly, calculateHealthScore } from '../utils/analytics'
import { MetricPoint } from '../constants/types'
import { config } from '../constants/config'

export interface ServerHealth {
  server: Server
  cpu: MetricPoint[]
  ram: MetricPoint[]
  disk: MetricPoint[]
  healthScore: number
  anomalyType: 'spike' | 'degradation' | null
  loading: boolean
}

export const useAllServersHealth = (servers: Server[]) => {
  const [healthData, setHealthData] = useState<ServerHealth[]>(
    servers.map(s => ({
      server: s, cpu: [], ram: [], disk: [],
      healthScore: 0, anomalyType: null, loading: true,
    }))
  )

  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (servers.length === 0) return

    setHealthData(servers.map(s => ({
      server: s, cpu: [], ram: [], disk: [],
      healthScore: 0, anomalyType: null, loading: true,
    })))

    const fetchAll = async () => {
      const results = await Promise.all(servers.map(async (server) => {
        try {
          const end = Math.floor(Date.now() / 1000)
          const start = end - 3600

          const [cpu, ram, disk] = await Promise.all([
            queryRange(server.url, queries.cpuUsage, start, end),
            queryRange(server.url, queries.ramUsage, start, end),
            queryRange(server.url, queries.diskUsage, start, end),
          ])

          const baseline = calculateBaseline(cpu)
          const anomalyType = detectAnomaly(cpu, baseline)
          const healthScore = cpu.length && ram.length && disk.length
            ? calculateHealthScore({
                cpu: cpu[cpu.length - 1].value,
                ram: ram[ram.length - 1].value,
                disk: disk[disk.length - 1].value,
                hasAnomaly: anomalyType !== null,
              })
            : 0

          return { server, cpu, ram, disk, healthScore, anomalyType, loading: false }
        } catch {
          return {
            server, cpu: [], ram: [], disk: [],
            healthScore: 0, anomalyType: null, loading: false,
          }
        }
      }))

      setHealthData(results)
    }

    fetchAll()
    const interval = setInterval(fetchAll, config.defaultInterval * 1000)
    return () => clearInterval(interval)
  }, [servers.map(s => s.url).join(',')])

  return healthData
}