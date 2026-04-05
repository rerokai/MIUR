export type UserRole = 'sre' | 'developer' | 'manager'

export type ServerProfile = 'web' | 'db' | 'worker'

export type AnomalyLevel = 'threat' | 'warning' | 'resolved'

export interface Server {
  id: string
  name: string
  url: string
  interval: number
  profile: ServerProfile
}

export interface MetricPoint {
  timestamp: number
  value: number
}

export interface Anomaly {
  id: string
  serverId: string
  serverName: string
  metric: string
  level: AnomalyLevel
  description: string
  startedAt: number
  resolvedAt?: number
}

export interface Group {
  id: string
  name: string
  serverIds: string[]
}