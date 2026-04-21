import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'

type PdfSection = {
  title: string
  body: string
}

export async function generateClinicalPdf(args: {
  title: string
  subtitle?: string
  sections: PdfSection[]
  outputPath: string
}) {
  const { title, subtitle, sections, outputPath } = args

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })

  return new Promise<string>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 56,
        bottom: 56,
        left: 56,
        right: 56,
      },
    })

    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    doc.fontSize(22).text(title, { align: 'left' })

    if (subtitle) {
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#555555').text(subtitle)
      doc.fillColor('black')
    }

    doc.moveDown(1.5)

    sections.forEach((section, index) => {
      if (index > 0) {
        doc.moveDown(1)
      }

      doc.fontSize(14).text(section.title)
      doc.moveDown(0.4)
      doc.fontSize(10).text(section.body, {
        align: 'left',
        lineGap: 4,
      })
    })

    doc.end()

    stream.on('finish', () => resolve(outputPath))
    stream.on('error', reject)
  })
}