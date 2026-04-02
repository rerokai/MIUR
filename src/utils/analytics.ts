import { MetricPoint } from '../constants/types'

// Считает скользящее среднее за последние N точек
// Это и есть baseline — "типичное" значение метрики
export const calculateBaseline = (
  points: MetricPoint[],
  windowSize: number = 24
): MetricPoint[] => {
  return points.map((point, index) => {
    const start = Math.max(0, index - windowSize)
    const window = points.slice(start, index + 1)
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length
    return { timestamp: point.timestamp, value: avg }
  })
}

// Считает стандартное отклонение — насколько метрика "прыгает" в норме
export const calculateStdDev = (points: MetricPoint[]): number => {
  if (points.length < 2) return 0
  const avg = points.reduce((sum, p) => sum + p.value, 0) / points.length
  const variance = points.reduce((sum, p) => sum + Math.pow(p.value - avg, 2), 0) / points.length
  return Math.sqrt(variance)
}

export type AnomalyType = 'spike' | 'degradation' | null

// Проверяет последнюю точку — есть ли аномалия
export const detectAnomaly = (
  points: MetricPoint[],
  baseline: MetricPoint[],
  threshold: number = 2 // порог в σ
): AnomalyType => {
  if (points.length < 5) return null

  const last = points[points.length - 1]
  const lastBaseline = baseline[baseline.length - 1]
  const stdDev = calculateStdDev(points.slice(-24))

  // Всплеск — текущее значение выше baseline на threshold * σ
  if (last.value > lastBaseline.value + threshold * stdDev) {
    return 'spike'
  }

  // Тихая деградация — последние 5 точек подряд выше baseline
  const lastFive = points.slice(-5)
  const lastFiveBaseline = baseline.slice(-5)
  const allAbove = lastFive.every(
    (p, i) => p.value > lastFiveBaseline[i].value
  )
  if (allAbove) return 'degradation'

  return null
}

// Считает health score от 0 до 100
// 100 = всё хорошо, 0 = критично
export const calculateHealthScore = (metrics: {
  cpu: number
  ram: number
  disk: number
  hasAnomaly: boolean
}): number => {
  const cpuScore = Math.max(0, 100 - metrics.cpu) * 0.4
  const ramScore = Math.max(0, 100 - metrics.ram) * 0.3
  const diskScore = Math.max(0, 100 - metrics.disk) * 0.2
  const anomalyPenalty = metrics.hasAnomaly ? 10 : 0

  return Math.round(cpuScore + ramScore + diskScore - anomalyPenalty)
}

// Линейная экстраполяция — через сколько минут метрика достигнет порога
export const predictTimeToThreshold = (
  points: MetricPoint[],
  threshold: number
): number | null => {
  if (points.length < 5) return null

  const last = points.slice(-5)
  const first = last[0]
  const lastPoint = last[last.length - 1]

  // Скорость роста в единицах в миллисекунду
  const rate = (lastPoint.value - first.value) / (lastPoint.timestamp - first.timestamp)

  // Если не растёт — предсказание не нужно
  if (rate <= 0) return null

  // Через сколько миллисекунд достигнем порога
  const msToThreshold = (threshold - lastPoint.value) / rate

  // Если уже превысили или больше часа — не показываем
  if (msToThreshold <= 0 || msToThreshold > 3600000) return null

  return Math.round(msToThreshold / 60000) // в минутах
}

// Генерирует текстовый дайджест по шаблону
export const generateDigest = (groups: {
  name: string
  score: number
  anomalyCount: number
}[]): string => {
  const critical = groups.filter(g => g.score < 50)
  const degrading = groups.filter(g => g.score >= 50 && g.score < 75)
  const stable = groups.filter(g => g.score >= 75)

  const parts: string[] = []

  if (critical.length > 0) {
    parts.push(`${critical.map(g => g.name).join(', ')} ${critical.length === 1 ? 'is' : 'are'} critical — immediate attention required.`)
  }

  if (degrading.length > 0) {
    parts.push(`${degrading.map(g => g.name).join(', ')} ${degrading.length === 1 ? 'is' : 'are'} degrading.`)
  }

  if (stable.length > 0 && (critical.length > 0 || degrading.length > 0)) {
    parts.push(`${stable.map(g => g.name).join(', ')} ${stable.length === 1 ? 'is' : 'are'} stable.`)
  }

  if (parts.length === 0) {
    return 'All systems are operating normally.'
  }

  return parts.join(' ')
}