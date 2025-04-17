import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as Blob | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(buffer)
    const pageCount = pdfDoc.getPageCount()

    return NextResponse.json({ pageCount })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 })
  }
}
