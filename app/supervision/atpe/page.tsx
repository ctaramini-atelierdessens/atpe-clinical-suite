import { AtpeSupervisionDashboard } from '@/components/atpe-supervision-dashboard'

// Remplace ce mock par une vraie récupération Supabase
const mockPatients = [
  {
    patientId: 'p1',
    patientName: 'Patient A',
    profile: 'Inhibition émotionnelle profonde',
    compositeScore: 42,
    predictionTrend: 'fragile' as const,
    riskLevel: 'moderate' as const,
    axisScores: {
      internalProcess: 35,
      expressiveProcess: 41,
      relationalProcess: 48,
      pluriexpressivity: 50,
      institutionalIndicators: 44,
      sensorialSymbolic: 38,
    },
  },
  {
    patientId: 'p2',
    patientName: 'Patient B',
    profile: 'Débordement émotionnel non intégré',
    compositeScore: 37,
    predictionTrend: 'declining' as const,
    riskLevel: 'high' as const,
    axisScores: {
      internalProcess: 30,
      expressiveProcess: 55,
      relationalProcess: 39,
      pluriexpressivity: 47,
      institutionalIndicators: 42,
      sensorialSymbolic: 33,
    },
  },
]

export default function AtpeSupervisionPage() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <AtpeSupervisionDashboard patients={mockPatients} />
    </main>
  )
}