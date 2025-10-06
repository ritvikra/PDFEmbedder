import express, { Request, Response } from 'express'
import { 
  createJob, 
  processJob, 
  getJobById, 
  getAllJobs, 
  getJobsByStatus, 
  getJobsByType, 
  deleteJob, 
  retryJob 
} from '../service/jobService'

const router = express.Router()

// Create a new job
router.post('/', async (req: Request, res: Response) => {
  try {
    const { url, type } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }
    
    if (!type || (type !== 'html' && type !== 'pdf')) {
      return res.status(400).json({ error: 'Type must be either "html" or "pdf"' })
    }
    
    const job = await createJob(url, type)
    
    // Start processing the job asynchronously
    processJob(job._id.toString()).catch(err => {
      console.error(`Error processing job ${job._id}:`, err)
    })
    
    res.status(201).json({ jobId: job._id })
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({ error: 'Failed to create job' })
  }
})

// Get all jobs
router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await getAllJobs()
    res.json(jobs)
  } catch (error) {
    console.error('Error getting jobs:', error)
    res.status(500).json({ error: 'Failed to get jobs' })
  }
})

// Get jobs by status
router.get('/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params
    
    if (!status || !['pending', 'processing', 'done', 'error'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    
    const jobs = await getJobsByStatus(status as 'pending' | 'processing' | 'done' | 'error')
    res.json(jobs)
  } catch (error) {
    console.error('Error getting jobs by status:', error)
    res.status(500).json({ error: 'Failed to get jobs by status' })
  }
})

// Get jobs by type
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params
    
    if (!type || (type !== 'html' && type !== 'pdf')) {
      return res.status(400).json({ error: 'Type must be either "html" or "pdf"' })
    }
    
    const jobs = await getJobsByType(type as 'html' | 'pdf')
    res.json(jobs)
  } catch (error) {
    console.error('Error getting jobs by type:', error)
    res.status(500).json({ error: 'Failed to get jobs by type' })
  }
})

// Get a job by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const job = await getJobById(id)
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    res.json(job)
  } catch (error) {
    console.error('Error getting job:', error)
    res.status(500).json({ error: 'Failed to get job' })
  }
})

// Delete a job
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = await deleteJob(id)
    
    if (!success) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting job:', error)
    res.status(500).json({ error: 'Failed to delete job' })
  }
})

// Retry a failed job
router.post('/:id/retry', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const job = await retryJob(id)
    res.json(job)
  } catch (error) {
    console.error('Error retrying job:', error)
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    if (error instanceof Error && error.message.includes('Can only retry jobs with status')) {
      return res.status(400).json({ error: error.message })
    }
    
    res.status(500).json({ error: 'Failed to retry job' })
  }
})

export { router as jobsRouter }