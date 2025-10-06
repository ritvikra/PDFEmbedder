import axios from 'axios'
import * as cheerio from 'cheerio'
import { Job } from '../db/jobs'
import { Document } from '../db/document'
import { getEmbeddings } from '../service/embeddingService'

/**
 * Process an HTML document
 */
export const processHtml = async (job: any) => {
  try {
    // Update job status
    job.progress.push('Fetching HTML document')
    await job.save()
    
    // Fetch the HTML document
    const response = await axios.get(job.url)
    const html = response.data
    
    // Parse the HTML
    job.progress.push('Parsing HTML document')
    await job.save()
    
    const $ = cheerio.load(html)
    
    // Extract the title
    const title = $('title').text() || 'Untitled Document'
    
    // Extract text from the body
    const bodyText = $('body').text()
    
    // Clean the text (remove extra whitespace)
    const cleanedText = bodyText.replace(/\s+/g, ' ').trim()
    
    // Create chunks (simple approach: split by paragraphs)
    job.progress.push('Creating text chunks')
    await job.save()
    
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get()
    const chunks = paragraphs.length > 0 ? paragraphs : [cleanedText]
    
    // Generate embeddings for chunks
    job.progress.push('Generating embeddings for chunks')
    await job.save()
    
    const chunkObjects = await getEmbeddings(chunks);
    
    // Create the document
    job.progress.push('Saving document')
    await job.save()
    
    const document = await Document.create({
      title,
      url: job.url,
      type: 'html',
      content: html,
      extractedText: cleanedText,
      chunks,
      chunkObjects,
      jobId: job._id
    })
    
    // Update job status
    job.status = 'done'
    job.progress.push('Processing complete')
    await job.save()
    
    return document
  } catch (error) {
    console.error('Error processing HTML document:', error)
    job.status = 'error'
    job.progress.push(`error: ${error instanceof Error ? error.message : String(error)}`)
    await job.save()
    throw error
  }
}

