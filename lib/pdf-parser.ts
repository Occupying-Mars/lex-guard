import pdfParse from 'pdf-parse'

export async function parsePdf(buffer: Buffer) {
  const data = await pdfParse(buffer)
  return data.text
}
