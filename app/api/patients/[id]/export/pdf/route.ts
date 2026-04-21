import { createClient } from '@/lib/supabase/server'
import { buildClinicalPdf } from '@/lib/exports/pdf-clinical'
import type { AtpeInput } from '@/lib/atpe-expert'

type RouteContext = {
    params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params
        const supabase = await createClient()

        const [{ data: patient }, { data: sessions }] = await Promise.all([
            supabase.from('patients').select('*').eq('id', id).maybeSingle(),
            supabase
                .from('active_patient_sessions')
                .select('*')
                .eq('patient_id', id)
                .order('session_number', { ascending: true }),
        ])

        if (!patient) {
            return Response.json({ error: 'Patient introuvable.' }, { status: 404 })
        }

        const pdf = await buildClinicalPdf({
            patient,
            sessions: Array.isArray(sessions) ? (sessions as AtpeInput[]) : [],
        })

        return new Response(pdf.pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': pdf.contentType,
                'Content-Disposition': `inline; filename="${pdf.fileName}"`,
                'X-Checksum-SHA256': pdf.checksum,
            },
        })
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Generation PDF impossible.'
        return Response.json({ error: message }, { status: 500 })
    }
}