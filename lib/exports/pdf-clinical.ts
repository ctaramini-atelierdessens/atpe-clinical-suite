import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createHash } from 'crypto'
import type { AtpeInput } from '@/lib/atpe-expert'
import { computeAtpeExpertResult } from '@/lib/atpe-expert'

type PatientLike = {
    id: string
    code?: string | null
    initials?: string | null
    case_reference?: string | null
}

type BuildPdfInput = {
    patient: PatientLike
    sessions: AtpeInput[]
    generatedAt?: string
}

type BuildPdfOutput = {
    pdfBytes: Uint8Array
    checksum: string
    fileName: string
    contentType: 'application/pdf'
}

function formatDate(value?: string | null) {
    if (!value) return 'Date inconnue'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Date inconnue'
    return date.toLocaleString('fr-FR')
}

function sanitizeFilePart(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
}

function wrapText(text: string, maxChars = 95) {
    const lines: string[] = []
    const paragraphs = text.split('\n')

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
            lines.push('')
            continue
        }

        const words = paragraph.split(/\s+/)
        let current = ''

        for (const word of words) {
            const candidate = current ? `${current} ${word}` : word
            if (candidate.length <= maxChars) {
                current = candidate
            } else {
                if (current) lines.push(current)
                current = word
            }
        }

        if (current) lines.push(current)
    }

    return lines
}

function drawSectionTitle(
    page: import('pdf-lib').PDFPage,
    text: string,
    y: number,
    font: import('pdf-lib').PDFFont,
) {
    page.drawText(text, {
        x: 50,
        y,
        size: 14,
        font,
        color: rgb(0.12, 0.16, 0.24),
    })
}

function drawBodyLines(
    page: import('pdf-lib').PDFPage,
    lines: string[],
    yStart: number,
    font: import('pdf-lib').PDFFont,
) {
    let y = yStart

    for (const line of lines) {
        page.drawText(line, {
            x: 50,
            y,
            size: 10,
            font,
            color: rgb(0.2, 0.24, 0.31),
        })
        y -= 14
    }

    return y
}

export async function buildClinicalPdf({
    patient,
    sessions,
    generatedAt = new Date().toISOString(),
}: BuildPdfInput): Promise<BuildPdfOutput> {
    const safeSessions = Array.isArray(sessions) ? sessions : []
    const latest = safeSessions.length ? safeSessions[safeSessions.length - 1] : null
    const previous =
        safeSessions.length > 1 ? safeSessions[safeSessions.length - 2] : null

    const result = computeAtpeExpertResult(latest, previous)

    const pdf = await PDFDocument.create()
    const page = pdf.addPage([595.28, 841.89]) // A4
    const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold)
    const bodyFont = await pdf.embedFont(StandardFonts.Helvetica)

    page.drawRectangle({
        x: 0,
        y: 780,
        width: 595.28,
        height: 61.89,
        color: rgb(0.95, 0.97, 0.99),
    })

    page.drawText('Export clinique certifie', {
        x: 50,
        y: 805,
        size: 22,
        font: titleFont,
        color: rgb(0.1, 0.13, 0.2),
    })

    page.drawText(`Patient : ${patient.code ?? patient.initials ?? patient.id}`, {
        x: 50,
        y: 785,
        size: 11,
        font: bodyFont,
        color: rgb(0.3, 0.34, 0.42),
    })

    let y = 740

    drawSectionTitle(page, 'Metadonnees', y, titleFont)
    y -= 24

    y = drawBodyLines(
        page,
        [
            `Date de generation : ${formatDate(generatedAt)}`,
            `Nombre de seances : ${safeSessions.length}`,
            `Score global : ${result.globalScore}/100`,
            `Niveau clinique : ${result.level}`,
            `Profil : ${result.profile}`,
        ],
        y,
        bodyFont,
    )

    y -= 18
    drawSectionTitle(page, 'Dimensions cliniques', y, titleFont)
    y -= 24

    y = drawBodyLines(
        page,
        [
            `Emotion : ${result.scores.emotion}/100`,
            `Corps : ${result.scores.corps}/100`,
            `Conscience : ${result.scores.conscience}/100`,
            `Dynamique : ${result.scores.dynamique}/100`,
            `Symbolique : ${result.scores.symbolique}/100`,
        ],
        y,
        bodyFont,
    )

    y -= 18
    drawSectionTitle(page, 'Synthese expert', y, titleFont)
    y -= 24

    y = drawBodyLines(page, wrapText(result.synthesis, 92), y, bodyFont)

    y -= 18
    drawSectionTitle(page, 'Historique des seances', y, titleFont)
    y -= 24

    const historyLines =
        safeSessions.length > 0
            ? safeSessions.map((session, index) => {
                    const prev = index > 0 ? safeSessions[index - 1] : null
                    const r = computeAtpeExpertResult(session, prev)
                    return `Seance ${session.session_number ?? index + 1} - ${formatDate(
                        session.created_at,
                    )} - ${r.globalScore}/100`
                })
            : ['Aucune seance disponible.']

    drawBodyLines(page, historyLines.slice(0, 18), y, bodyFont)

    const pdfBytes = await pdf.save()
    const checksum = createHash('sha256').update(pdfBytes).digest('hex')

    const patientPart = sanitizeFilePart(patient.code ?? patient.initials ?? patient.id)
    const datePart = new Date(generatedAt).toISOString().slice(0, 10)
    const fileName = `export-clinique-${patientPart}-${datePart}.pdf`

    return {
        pdfBytes,
        checksum,
        fileName,
        contentType: 'application/pdf',
    }
}