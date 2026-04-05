import { useState, useEffect, useRef } from 'react'
import { MetricPoint } from '../constants/types'
import { queryRange, queries } from '../services/prometheus'
import { config } from '../constants/config'

interface ServerMetrics {
  cpu: MetricPoint[]
  ram: MetricPoint[]
  disk: MetricPoint[]
  ramUsedGB: MetricPoint[]
  loadAvg: MetricPoint[]
  uptime: MetricPoint[]
  openConnections: MetricPoint[]
  processes: MetricPoint[]
  loading: boolean
  error: string | null
}

export const usePrometheus = (
  serverUrl: string = config.prometheusUrl,
  rangeHours: number = 1
) => {
  const [metrics, setMetrics] = useState<ServerMetrics>({
    cpu: [],
    ram: [],
    disk: [],
    ramUsedGB: [],
    loadAvg: [],
    uptime: [],
    openConnections: [],
    processes: [],
    loading: true,
    error: null,
  })

  const isFirstLoad = useRef(true)

  useEffect(() => {
    isFirstLoad.current = true
    setMetrics(prev => ({ ...prev, loading: true }))

    const fetchMetrics = async () => {
      const end = Math.floor(Date.now() / 1000)
      const start = end - rangeHours * 3600

      if (isFirstLoad.current) {
        setMetrics(prev => ({ ...prev, loading: true, error: null }))
      }

      try {
        const [cpu, ram, disk, ramUsedGB, loadAvg, uptime, openConnections, processes] = await Promise.all([
          queryRange(serverUrl, queries.cpuUsage, start, end),
          queryRange(serverUrl, queries.ramUsage, start, end),
          queryRange(serverUrl, queries.diskUsage, start, end),
          queryRange(serverUrl, queries.ramUsedGB, start, end),
          queryRange(serverUrl, queries.loadAvg1, start, end),
          queryRange(serverUrl, queries.uptime, start, end),
          queryRange(serverUrl, queries.openConnections, start, end),
          queryRange(serverUrl, queries.processes, start, end),
        ])

        setMetrics(prev => ({
          ...prev,
          cpu, ram, disk, ramUsedGB, loadAvg, uptime, openConnections, processes,
          loading: false,
          error: null,
        }))

        isFirstLoad.current = false
      } catch (e) {
        setMetrics(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch metrics',
        }))
      }
    }

    fetchMetrics()

    const interval = setInterval(fetchMetrics, config.defaultInterval * 1000)
    return () => clearInterval(interval)
  }, [serverUrl, rangeHours])

  return metrics
}