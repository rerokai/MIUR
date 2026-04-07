import { MetricPoint } from '../constants/types'

const DEFAULT_STEP = '15s'

export const queryRange = async (
  baseUrl: string,
  query: string,
  start: number,
  end: number,
  step: string = DEFAULT_STEP
): Promise<MetricPoint[]> => {
  try {
    const params = new URLSearchParams({
      query,
      start: start.toString(),
      end: end.toString(),
      step,
    })

    const response = await fetch(
      `${baseUrl}/api/v1/query_range?${params}`
    )

    if (!response.ok) {
      throw new Error(`Prometheus error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'success') {
      throw new Error('Prometheus returned error status')
    }

    const result = data.data.result[0]
    if (!result) return []

    return result.values.map(([timestamp, value]: [number, string]) => ({
      timestamp: timestamp * 1000,
      value: parseFloat(value),
    }))
  } catch (error) {
    
    return []
  }
}

export const checkConnection = async (baseUrl: string): Promise<boolean> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`${baseUrl}/api/v1/query?query=up`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    clearTimeout(timeoutId)
    return false
  }
}

export const queries = {
  cpuUsage: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)',
  ramUsage: '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100',
  ramUsedGB: '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / 1024 / 1024 / 1024',
  ramTotalGB: 'node_memory_MemTotal_bytes / 1024 / 1024 / 1024',
  diskUsage: '100 - ((node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100)',
  diskRead: 'rate(node_disk_read_bytes_total[5m]) / 1024 / 1024',
  diskWrite: 'rate(node_disk_written_bytes_total[5m]) / 1024 / 1024',
  networkIn: 'rate(node_network_receive_bytes_total{device!="lo"}[5m]) / 1024 / 1024',
  networkOut: 'rate(node_network_transmit_bytes_total{device!="lo"}[5m]) / 1024 / 1024',
  loadAvg1: 'node_load1',
  loadAvg5: 'node_load5',
  loadAvg15: 'node_load15',
  uptime: 'node_time_seconds - node_boot_time_seconds',
  openConnections: 'node_sockstat_TCP_inuse',
  processes: 'node_procs_running',
}
