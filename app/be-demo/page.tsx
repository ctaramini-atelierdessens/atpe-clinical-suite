import { BEExpertReport } from '@/components/be-expert-report'

export default function BEDemoPage() {
    return (
        <main className="min-h-screen bg-neutral-50 p-6 md:p-10">
            <div className="mx-auto max-w-6xl">
                <BEExpertReport
                    data={{
                        patientName: 'PAT-CTS-001',
                        assessmentDate: '11/04/2026',
                        clinicianName: 'Mme O. V.',
                        context:
                            "le sujet présente un engagement variable selon le niveau de sollicitation, avec une meilleure mobilisation lorsque le cadre reste lisible, stable et suffisamment soutenant",
                        observations:
                            "des ressources expressives sont présentes mais leur stabilité dépend encore des conditions de régulation, de sécurité relationnelle et de progressivité du dispositif",
                        scores: {
                            emotionalExpression: 58,
                            bodyEngagement: 64,
                            relationalAvailability: 61,
                            symbolicCapacity: 46,
                            regulationCapacity: 52,
                            initiativeCreativity: 57,
                        },
                    }}
                />
            </div>
        </main>
    )
}