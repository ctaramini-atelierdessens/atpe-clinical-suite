import { NextResponse } from 'next/server'

function esc(value: unknown) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export async function GET() {
  const patient = {
    code: 'PAT-CT-001',
    initials: 'CT',
    status: 'active',
  }

  const sessions = [
    {
      session_number: 1,
      session_date: new Date().toISOString().slice(0, 10),
      emotional_score: 0,
      body_score: 0,
      awareness_score: 0,
      dynamic_score: 0,
      symbolic_score: 0,
      regulation_score: 0,
      engagement_score: 0,
      note: 'Première séance ATPE',
    },
  ]

  const header = [
    'code',
    'initials',
    'status',
    'session_number',
    'session_date',
    'emotion',
    'body',
    'awareness',
    'dynamic',
    'symbolic',
    'regulation',
    'engagement',
    'note',
  ]

  const rows = sessions.map((s) => [
    patient.code,
    patient.initials ?? '',
    patient.status,
    s.session_number,
    s.session_date,
    s.emotional_score,
    s.body_score,
    s.awareness_score,
    s.dynamic_score,
    s.symbolic_score,
    s.regulation_score,
    s.engagement_score,
    s.note ?? '',
  ])

  const csv = [header, ...rows].map((row) => row.map(esc).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="patient-export.csv"',
    },
  })
}