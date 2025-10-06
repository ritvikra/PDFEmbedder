  import axios from 'axios'
  import { Document } from '../db/document'
  import { PDFDocument } from 'pdf-lib'
  import { promises as fsPromises, existsSync, mkdirSync, readdirSync } from 'fs'
  import path, { resolve } from 'path';
  import os from 'os';
  import { convert } from 'pdf-poppler';
  import { getEmbeddings } from '../service/embeddingService';
  import { fromPath } from 'pdf2pic';
  import fs from 'fs';
  import { fileURLToPath } from 'url';
  import { dirname } from 'path';
import { DocumentGroupAssociation } from '../db/documentGroupAssociation';

  // Get the directory name of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  async function isOcrServiceAvailable(): Promise<boolean> {
    return true;
  }
  // ──────────────────────────────────────────────────────────────────────────────
  // Replace the whole pdfToImage implementation with this local‑file version
  // ──────────────────────────────────────────────────────────────────────────────
  export const pdfToImage = async (pdfPath: string): Promise<string[]> => {
    const outputDir = path.join(path.dirname(pdfPath), 'output')

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }

    const options = {
      density: 100,             // DPI
      savePath: outputDir,
      format: 'jpg',
      width: 600,
      height: 800,
    }

    const store = fromPath(pdfPath, options)
    if (typeof (store as any).bulk !== 'function') {
      throw new Error('pdf2pic bulk() method not available – is poppler-utils installed?')
    }

    const images: string[] = []
    const pages = await (store as any).bulk(-1)   // convert all pages

    pages.forEach((img: any) => {
      if (img.path) {
        images.push(img.path)                     // file path to PNG
      } else if (img.base64) {
        images.push(`data:image/png;base64,${img.base64}`)
      }
    })

    return images
  }
  /**
   * Process a PDF document and generate real images for each page
   */
  export const processPdf = async (job: any) => {
    try {
      job.progress.push('Fetching PDF document')
      await job.save()

      const response = await axios.get(job.url, { responseType: 'arraybuffer' })
      const pdfBuffer = Buffer.from(response.data)

      job.progress.push('Loading PDF document')
      await job.save()

      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const numPages = pdfDoc.getPageCount()

      const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'pdf-'))
      const pdfPath = path.join(tempDir, 'document.pdf')
      await fsPromises.writeFile(pdfPath, pdfBuffer)

      job.progress.push('Converting PDF pages to images')
      await job.save()

      const imagePaths = await pdfToImage(pdfPath)

      // after pdf2pic conversion
      const testPath = imagePaths.find(p => p.endsWith('.jpg'))!;
      const buf = await fsPromises.readFile(testPath);

      try {
        const res = await axios.post('http://localhost:4001/ocr', buf, {
          headers: { 'Content-Type': 'image/jpeg' },
          timeout: 10000,
        });
        console.log('OCR OK:', res.data);
      } catch (e: any) {
        console.error('OCR error status:', e.response?.status);
        console.error('OCR error data  :', e.response?.data);
      }

      job.progress.push('Checking OCR service status')
      await job.save()

      const ocrServiceAvailable = await isOcrServiceAvailable()

      if (ocrServiceAvailable) {
        job.progress.push('OCR service is available')
      } else {
        job.progress.push('OCR service is not available, using simulated text')
      }
      await job.save()

      const pages = []
      const chunks = []
      const pageChunks: { text: string, pageNumber: number }[] = []

      for (let i = 0; i < numPages; i++) {
        job.progress.push(`Processing page ${i + 1} of ${numPages}`)
        await job.save()

        let pageText = ''

        if (ocrServiceAvailable) {
          try {
            const imageBuffer = await fsPromises.readFile(imagePaths[i])

            const ocrResponse = await axios.post('http://localhost:4001/ocr', imageBuffer, {
              headers: { 'Content-Type': 'image/jpeg' },
              timeout: 10000
            })
            pageText = ocrResponse.data.text
            job.progress.push(`OCR completed for page ${i + 1}`)
          } catch (ocrError: any) {
            console.error(`OCR service error for page ${i + 1}:`, ocrError.message)
            job.progress.push(`OCR failed for page ${i + 1}, using simulated text`)

            pageText = `Simulated OCR text for page ${i + 1} of the document at ${job.url}.`
          }
        } else {
          pageText = `Ocr service is not available, using simulated text`
        }

        await job.save()

        pages.push({
          text: pageText,
          pageNumber: i + 1,
          imageUrl: `data:image/png;base64,${(await fsPromises.readFile(imagePaths[i])).toString('base64')}`
        })

        const chunkText = `Page ${i + 1}: ${pageText}`;
        chunks.push(chunkText)
        pageChunks.push({ text: chunkText, pageNumber: i + 1 })
      }

      job.progress.push('Generating embeddings for chunks')
      await job.save()

      const chunkEmbeddings = await getEmbeddings(chunks)

      const chunkObjects = chunkEmbeddings.map((chunk, index) => ({
        text: chunk.text,
        embedding: chunk.embedding,
        pageNumber: pageChunks[index].pageNumber
      }))

      try {
        await fsPromises.rm(tempDir, { recursive: true, force: true })
      } catch (error) {
        console.error('Error cleaning up temporary files:', error)
      }

      const extractedText = pages.map(p => p.text).join('\n\n')

      job.progress.push('Saving document')
      await job.save()

      const document = await Document.create({
        title: `PDF Document from ${job.url}`,
        url: job.url,
        type: 'pdf',
        content: pdfBuffer.toString('base64'),
        extractedText,
        chunks,
        chunkObjects,
        pages,
        jobId: job._id
      })

      if (job.groupId) { // Ensure you have the group ID
        await DocumentGroupAssociation.create({
            documentId: document._id,
            groupId: job.groupId // Assuming job.groupId contains the relevant group ID
        });
    }

      job.status = 'done'
      job.progress.push('Processing complete')
      await job.save()

      return document
    } catch (error) {
      console.error('Error processing PDF document:', error)
      job.status = 'error'
      job.progress.push(`error: ${error instanceof Error ? error.message : String(error)}`)
      await job.save()
      throw error
    }
  }