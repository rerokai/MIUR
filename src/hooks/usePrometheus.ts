import { useState, useEffect, useRef } from 'react'
import { MetricPoint } from '../constants/types'
import { queryRange, queries } from '../services/prometheus'
import { config } from '../constants/config'

interface ServerMetrics {
  cpu: MetricPoint[]
  ram: MetricPoint[]
  disk: MetricPoint[]
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
    loading: true,
    error: null,
  })

  const isFirstLoad = useRef(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      const end = Math.floor(Date.now() / 1000)
      const start = end - rangeHours * 3600

      // При первой загрузке показываем loading
      // При последующих — тихо обновляем данные без loading
      if (isFirstLoad.current) {
        setMetrics(prev => ({ ...prev, loading: true, error: null }))
      }

      try {
        const [cpu, ram, disk] = await Promise.all([
          queryRange(serverUrl, queries.cpuUsage, start, end),
          queryRange(serverUrl, queries.ramUsage, start, end),
          queryRange(serverUrl, queries.diskUsage, start, end),
        ])

        setMetrics(prev => ({
          ...prev,
          cpu,
          ram,
          disk,
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