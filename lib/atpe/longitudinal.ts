
export function computeTrend(sessions: any[]) {
  if (sessions.length < 2) return 'insuffisant'

  const values = sessions
    .map((s) => s.global_score)
    .filter((v) => typeof v === 'number')

  if (values.length < 2) return 'insuffisant'

  const first = values[values.length - 1]
  const last = values[0]

  const delta = last - first

  if (delta > 10) return 'amélioration forte'
  if (delta > 3) return 'amélioration'
  if (delta < -10) return 'régression forte'
  if (delta < -3) return 'régression'

  return 'stable'
}