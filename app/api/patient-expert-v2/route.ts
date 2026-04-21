import { NextResponse } from 'next/server'
import { getAppContext } from '@/lib/atpe/app-context'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
        return NextResponse.json({ error: 'Missing patientId' }, { status: 400 })
    }

    const { supabase } = await getAppContext()

    const { data, error } = await supabase
        .from('clinical_profiles')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data ?? null })
}