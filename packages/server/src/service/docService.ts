import { Document } from '../db/document'
import { Job } from '../db/jobs'

/**
 * Get a document by its ID
 */
export const getDocumentById = async (documentId: string) => {
  return await Document.findById(documentId)
}

/**
 * Get all documents
 */
export const getAllDocuments = async () => {
  return await Document.find().sort({ createdAt: -1 })
}

/**
 * Get documents by job ID
 */
export const getDocumentsByJobId = async (jobId: string) => {
  return await Document.find({ jobId }).sort({ createdAt: -1 })
}

/**
 * Get documents by type (html or pdf)
 */
export const getDocumentsByType = async (type: 'html' | 'pdf') => {
  return await Document.find({ type }).sort({ createdAt: -1 })
}

/**
 * Get documents by URL
 */
export const getDocumentsByUrl = async (url: string) => {
  return await Document.find({ url }).sort({ createdAt: -1 })
}

/**
 * Get document chunks
 */
export const getDocumentChunks = async (documentId: string) => {
  const document = await Document.findById(documentId)
  if (!document) return null
  
  return document.chunks
}

/**
 * Get document pages (for PDF documents)
 */
export const getDocumentPages = async (documentId: string) => {
  const document = await Document.findById(documentId)
  if (!document || document.type !== 'pdf') return null
  
  return document.pages
}

/**
 * Get document with related job information
 */
export const getDocumentWithJob = async (documentId: string) => {
  const document = await Document.findById(documentId)
  if (!document) return null
  
  const job = await Job.findById(document.jobId)
  
  return {
    document,
    job
  }
}

/**
 * Delete a document and its associated job
 */
export const deleteDocument = async (documentId: string) => {
  const document = await Document.findById(documentId)
  if (!document) return false
  
  // Delete the associated job
  await Job.findByIdAndDelete(document.jobId)
  
  // Delete the document
  await Document.findByIdAndDelete(documentId)
  
  return true
}

/**
 * Search documents by text content
 */
export const searchDocuments = async (query: string) => {
  // Simple text search in extractedText field
  return await Document.find({
    extractedText: { $regex: query, $options: 'i' }
  }).sort({ createdAt: -1 })
}
