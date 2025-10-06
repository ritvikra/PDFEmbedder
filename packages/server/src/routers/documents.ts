import express, { Request, Response } from 'express'
import { 
  getDocumentById,
  getAllDocuments,
  getDocumentsByJobId,
  getDocumentsByType,
  getDocumentsByUrl,
  getDocumentChunks,
  getDocumentPages,
  getDocumentWithJob,
  deleteDocument,
  searchDocuments
} from '../service/docService'

const router = express.Router()

// Get all documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const documents = await getAllDocuments()
    res.json(documents)
  } catch (error) {
    console.error('Error getting documents:', error)
    res.status(500).json({ error: 'Failed to get documents' })
  }
})

// Get document by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const document = await getDocumentById(id)
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    res.json(document)
  } catch (error) {
    console.error('Error getting document:', error)
    res.status(500).json({ error: 'Failed to get document' })
  }
})

// Get document with job information
router.get('/:id/with-job', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const document = await getDocumentWithJob(id)
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    res.json(document)
  } catch (error) {
    console.error('Error getting document with job:', error)
    res.status(500).json({ error: 'Failed to get document with job' })
  }
})

// Get documents by job ID
router.get('/job/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params
    const documents = await getDocumentsByJobId(jobId)
    res.json(documents)
  } catch (error) {
    console.error('Error getting documents by job:', error)
    res.status(500).json({ error: 'Failed to get documents by job' })
  }
})

// Get documents by type
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params
    
    if (!type || (type !== 'html' && type !== 'pdf')) {
      return res.status(400).json({ error: 'Type must be either "html" or "pdf"' })
    }
    
    const documents = await getDocumentsByType(type as 'html' | 'pdf')
    res.json(documents)
  } catch (error) {
    console.error('Error getting documents by type:', error)
    res.status(500).json({ error: 'Failed to get documents by type' })
  }
})

// Get documents by URL
router.get('/url/:url', async (req: Request, res: Response) => {
  try {
    const { url } = req.params
    const documents = await getDocumentsByUrl(decodeURIComponent(url))
    res.json(documents)
  } catch (error) {
    console.error('Error getting documents by URL:', error)
    res.status(500).json({ error: 'Failed to get documents by URL' })
  }
})

// Get document chunks
router.get('/:id/chunks', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const chunks = await getDocumentChunks(id)
    
    if (!chunks) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    res.json(chunks)
  } catch (error) {
    console.error('Error getting document chunks:', error)
    res.status(500).json({ error: 'Failed to get document chunks' })
  }
})

// Get document pages (for PDF documents)
router.get('/:id/pages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const pages = await getDocumentPages(id)
    
    if (!pages) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    res.json(pages)
  } catch (error) {
    console.error('Error getting document pages:', error)
    res.status(500).json({ error: 'Failed to get document pages' })
  }
})

// Search documents
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params
    const documents = await searchDocuments(decodeURIComponent(query))
    res.json(documents)
  } catch (error) {
    console.error('Error searching documents:', error)
    res.status(500).json({ error: 'Failed to search documents' })
  }
})

// Delete document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = await deleteDocument(id)
    
    if (!success) {
      return res.status(404).json({ error: 'Document not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ error: 'Failed to delete document' })
  }
})

export { router as documentsRouter } 